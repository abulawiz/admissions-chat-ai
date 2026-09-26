import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "./_auth";

const BUCKET = "admission-documents";
const MAX_BYTES = 10 * 1024 * 1024;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const user = await requireAdmin(req, res);
  if (!user) return;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !serviceKey) return res.status(503).json({ error: "Supabase server storage is not configured" });
  const contentType = req.headers["content-type"] || "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) return res.status(400).json({ error: "Use multipart/form-data for file uploads" });
  // Vercel's multipart parser is deployment-specific; this endpoint accepts the parsed file when available.
  const file = (req as any).file || (req as any).files?.file;
  const path = typeof (req as any).body?.path === "string" ? (req as any).body.path : `${user.id}/${Date.now()}-upload`;
  if (!file) return res.status(400).json({ error: "No file received. Configure the deployment's multipart parser." });
  const buffer = Buffer.isBuffer(file) ? file : Buffer.from(file.buffer || file.data || []);
  if (!buffer.length || buffer.length > MAX_BYTES) return res.status(400).json({ error: "File is empty or exceeds the 10 MB limit" });
  const client = createClient(url, serviceKey);
  try {
    const { data: bucket } = await client.storage.getBucket(BUCKET);
    if (!bucket) { const created = await client.storage.createBucket(BUCKET, { public: false }); if (created.error && !/already exists/i.test(created.error.message)) throw created.error; }
    const result = await client.storage.from(BUCKET).upload(path, buffer, { contentType: file.mimetype || "application/octet-stream", upsert: false });
    if (result.error) throw result.error;
    return res.status(200).json({ ok: true, path: result.data.path });
  } catch (error) { console.error("upload error", error); return res.status(500).json({ error: "Storage upload failed" }); }
}
