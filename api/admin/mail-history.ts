import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "./_auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res); if (!admin) return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) return res.status(503).json({ error: "Database is not configured" });
  const { data, error } = await createClient(url, key).from("admin_emails").select("id,recipient,subject,body,provider,provider_id,status,created_at").order("created_at", { ascending: false }).limit(100);
  if (error) return res.status(500).json({ error: "Could not load mail history" });
  return res.status(200).json({ emails: data || [] });
}
