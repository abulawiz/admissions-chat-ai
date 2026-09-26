import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "../admin/_auth";

const OPENAI_URL = "https://api.openai.com/v1/embeddings";
const MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Public search: no admin required (used by chat RAG)
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { query, topK = 5 } = req.body ?? {};
  if (typeof query !== "string" || !query.trim()) return res.status(400).json({ error: "query is required" });
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return res.status(503).json({ error: "Embeddings provider not configured" });
    const r = await fetch(OPENAI_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: JSON.stringify({ input: query, model: MODEL }) });
    if (!r.ok) { console.error("openai search embed", await r.text()); return res.status(502).json({ error: "Embedding provider error" }); }
    const jr = await r.json();
    const qEmb: number[] = jr?.data?.[0]?.embedding;
    if (!Array.isArray(qEmb)) return res.status(502).json({ error: "Invalid embedding response" });

    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE;
    if (!url || !service) return res.status(503).json({ error: "Database not configured" });
    const client = createClient(url, service);
    const { data } = await client.from("knowledge_chunks").select("id,item_id,chunk_text,embedding").limit(1000);
    const scored = (data || []).map((row: any) => ({ ...row, score: cosine(qEmb, Array.isArray(row.embedding) ? row.embedding : (row.embedding ?? [])) })).sort((a: any, b: any) => b.score - a.score).slice(0, topK);
    return res.status(200).json({ results: scored });
  } catch (err: any) { console.error(err); return res.status(500).json({ error: err?.message ?? "search failed" }); }
}
