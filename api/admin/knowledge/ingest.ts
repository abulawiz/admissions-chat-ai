import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "../admin/_auth";

const OPENAI_URL = "https://api.openai.com/v1/embeddings";
const MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

function chunkText(text: string, size = 1000) {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + size));
    i += size;
  }
  return chunks;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res); if (!admin) return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { itemId, text } = req.body ?? {};
  if (!itemId || typeof text !== "string" || !text.trim()) return res.status(400).json({ error: "itemId and text are required" });

  try {
    const chunks = chunkText(text.trim(), 1200);
    const embeddings: any[] = [];
    const key = process.env.OPENAI_API_KEY;
    if (!key) return res.status(503).json({ error: "Embeddings provider not configured" });

    for (const c of chunks) {
      const r = await fetch(OPENAI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ input: c, model: MODEL }),
      });
      if (!r.ok) {
        const t = await r.text();
        console.error("embedding error", r.status, t);
        return res.status(502).json({ error: "Embedding provider error" });
      }
      const jr = await r.json();
      const emb = jr?.data?.[0]?.embedding;
      if (!Array.isArray(emb)) return res.status(502).json({ error: "Invalid embedding response" });
      embeddings.push({ chunk: c, embedding: emb });
    }

    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE;
    if (!url || !service) return res.status(503).json({ error: "Database not configured" });
    const client = createClient(url, service);
    for (const e of embeddings) {
      const { error } = await client.from("knowledge_chunks").insert({ item_id: itemId, chunk_text: e.chunk, embedding: e.embedding });
      if (error) console.error("chunk insert error", error);
    }

    return res.status(201).json({ ok: true, chunks: embeddings.length });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err?.message ?? "ingest failed" });
  }
}
