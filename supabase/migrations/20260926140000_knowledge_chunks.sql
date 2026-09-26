-- Knowledge chunks table stores text chunks and OpenAI embeddings (as JSONB). Using JSONB keeps this portable without pgvector.
create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.knowledge_items(id) on delete cascade not null,
  chunk_text text not null,
  embedding jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_knowledge_chunks_item on public.knowledge_chunks(item_id);
create index if not exists idx_knowledge_chunks_created on public.knowledge_chunks(created_at desc);
