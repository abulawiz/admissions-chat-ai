import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "./_auth";

const db = () => createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE || "");
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const client = db();
  if (req.method === "GET") {
    const { data, error } = await client.from("knowledge_items").select("id,title,content,source,tags,status,created_at,updated_at").order("updated_at", { ascending: false }).limit(100);
    if (error) return res.status(500).json({ error: "Could not load knowledge base" });
    return res.status(200).json({ items: data || [] });
  }
  if (req.method === "POST") {
    const { id, title, content, tags, status } = req.body || {};
    if (typeof title !== "string" || !title.trim() || typeof content !== "string" || !content.trim()) return res.status(400).json({ error: "Title and content are required" });
    const record = { title: title.trim(), content: content.trim(), tags: Array.isArray(tags) ? tags.filter((tag: unknown) => typeof tag === "string").slice(0, 20) : [], status: status === "draft" ? "draft" : "published", source: "admin", created_by: admin.id, updated_at: new Date().toISOString() };
    const result = id ? await client.from("knowledge_items").update(record).eq("id", id).select().single() : await client.from("knowledge_items").insert(record).select().single();
    if (result.error) return res.status(500).json({ error: "Could not save knowledge item" });
    return res.status(id ? 200 : 201).json({ item: result.data });
  }
  if (req.method === "DELETE") {
    const id = typeof req.body?.id === "string" ? req.body.id : "";
    if (!id) return res.status(400).json({ error: "Knowledge item id is required" });
    const { error } = await client.from("knowledge_items").delete().eq("id", id);
    if (error) return res.status(500).json({ error: "Could not delete knowledge item" });
    return res.status(204).end();
  }
  return res.status(405).json({ error: "Method not allowed" });
}
