import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { email, fullName } = req.body ?? {};
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "A valid email is required" });
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL; const service = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !service) return res.status(503).json({ error: "Reminder service is not configured" });
  const { error } = await createClient(url, service).from("post_utme_reminders").insert({ email: email.trim().toLowerCase(), full_name: typeof fullName === "string" ? fullName.trim() : null });
  if (error) return res.status(500).json({ error: "Could not save reminder" });
  return res.status(201).json({ ok: true });
}
