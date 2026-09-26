import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "./_auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const admin = await requireAdmin(req, res); if (!admin) return;
  const { to, subject, text } = req.body ?? {};
  if (typeof to !== "string" || !emailPattern.test(to) || typeof subject !== "string" || !subject.trim() || typeof text !== "string" || !text.trim()) return res.status(400).json({ error: "Valid recipient, subject and message are required" });
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM;
  if (!key || !from) return res.status(503).json({ error: "Resend is not configured" });
  try {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [to.trim()], subject: subject.trim(), text }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(502).json({ error: result.message || "Resend rejected the message" });
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE;
    if (url && service) await createClient(url, service).from("admin_emails").insert({ recipient: to.trim(), subject: subject.trim(), body: text, provider_id: result.id, sent_by: admin.id });
    return res.status(200).json({ ok: true, id: result.id });
  } catch (error) { console.error(error); return res.status(502).json({ error: "Email provider unavailable" }); }
}
