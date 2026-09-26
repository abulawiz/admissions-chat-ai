import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "./_auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) return res.status(503).json({ error: "Database is not configured" });
  const client = createClient(url, key);

  if (req.method === "GET") {
    // list users (basic)
    try {
      // supabase-js exposes admin API under auth.admin
      // @ts-ignore
      const { data, error } = await client.auth.admin.listUsers();
      if (error) return res.status(500).json({ error: "Could not list users" });
      return res.status(200).json({ users: data.users || data });
    } catch (err: any) { console.error(err); return res.status(500).json({ error: "Could not list users" }); }
  }

  if (req.method === "POST") {
    const { id, role } = req.body ?? {};
    if (!id || typeof role !== "string") return res.status(400).json({ error: "id and role are required" });
    try {
      // @ts-ignore
      const { data, error } = await client.auth.admin.updateUserById(id, { app_metadata: { role } });
      if (error) return res.status(500).json({ error: "Could not update user" });
      return res.status(200).json({ user: data });
    } catch (err: any) { console.error(err); return res.status(500).json({ error: "Could not update user" }); }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
