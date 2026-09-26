import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const client = () => createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE || "");
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).json({ error: "Unauthorized" });
  const db = client();
  const { data: event } = await db.from("site_settings").select("value").eq("key", "post_utme_started").maybeSingle();
  if (event?.value !== true) return res.status(200).json({ sent: 0, message: "POST-UTME is not marked started" });
  const { data: reminders } = await db.from("post_utme_reminders").select("id,email,full_name").is("delivered_at", null).is("cancelled_at", null).limit(100);
  const key = process.env.RESEND_API_KEY; const from = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM;
  if (!key || !from) return res.status(503).json({ error: "Resend is not configured" });
  let sent = 0;
  for (const reminder of reminders || []) {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [reminder.email], subject: "POST-UTME registration has started", text: `Hello ${reminder.full_name || "applicant"}, POST-UTME registration has started. Visit the official admissions portal for details.` }) });
    if (response.ok) { await db.from("post_utme_reminders").update({ delivered_at: new Date().toISOString() }).eq("id", reminder.id); sent++; }
  }
  return res.status(200).json({ sent });
}
