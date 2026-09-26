import { createClient } from "@supabase/supabase-js";

export async function requireAdmin(req: any, res: any) {
  const header = req.headers?.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!token || !url || !anonKey) { res.status(401).json({ error: "Authentication required" }); return null; }
  const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) { res.status(401).json({ error: "Invalid session" }); return null; }
  const configuredAdmin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const role = data.user.app_metadata?.role || data.user.user_metadata?.role;
  const isAdmin = role === "admin" || (!!configuredAdmin && data.user.email?.toLowerCase() === configuredAdmin);
  if (!isAdmin) { res.status(403).json({ error: "Admin access required" }); return null; }
  return data.user;
}
