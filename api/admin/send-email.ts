import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "./_auth";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maxMessageLength = 100_000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!await requireAdmin(req, res)) return;
  const { to, subject, text } = req.body ?? {};
  if (typeof to !== "string" || !emailPattern.test(to) || typeof subject !== "string" || !subject.trim() || typeof text !== "string" || !text.trim()) return res.status(400).json({ error: "Valid recipient, subject, and message are required" });
  if (subject.length > 200 || text.length > maxMessageLength) return res.status(400).json({ error: "Subject or message is too long" });
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return res.status(503).json({ error: "Email service is not configured" });
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ personalizations: [{ to: [{ email: to.trim() }] }], from: { email: from }, subject: subject.trim(), content: [{ type: "text/plain", value: text }] }) });
    if (!response.ok) { console.error("SendGrid error", response.status, await response.text()); return res.status(502).json({ error: "Email provider rejected the message" }); }
    return res.status(200).json({ ok: true });
  } catch (error) { console.error("send-email error", error); return res.status(502).json({ error: "Email provider unavailable" }); }
}
