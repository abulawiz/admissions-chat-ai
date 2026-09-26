import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "./_auth";

const db = () => createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE || "");
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const client = db();
  if (req.method === "GET") {
    const { data, error } = await client.from("post_utme_reminders").select("id,email,full_name,event_key,scheduled_for,delivered_at,cancelled_at,created_at").order("created_at", { ascending: false }).limit(200);
    if (error) return res.status(500).json({ error: "Could not load reminders" });
    return res.status(200).json({ reminders: data || [] });
  }
  if (req.method === "POST") {
    const { action, id } = req.body || {};
    if (action === "cancel" && typeof id === "string") {
      const { error } = await client.from("post_utme_reminders").update({ cancelled_at: new Date().toISOString() }).eq("id", id);
      if (error) return res.status(500).json({ error: "Could not cancel reminder" });
      return res.status(200).json({ ok: true });
    }
    if (action === "start") {
      const { error } = await client.from("site_settings").upsert({ key: "post_utme_started", value: true, updated_by: admin.id, updated_at: new Date().toISOString() });
      if (error) return res.status(500).json({ error: "Could not update event status" });
      return res.status(200).json({ ok: true });
    }
    if (action === "reset") {
      const { error } = await client.from("site_settings").upsert({ key: "post_utme_started", value: false, updated_by: admin.id, updated_at: new Date().toISOString() });
      if (error) return res.status(500).json({ error: "Could not update event status" });
      return res.status(200).json({ ok: true });
    }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
