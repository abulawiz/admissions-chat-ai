-- Admin mail, knowledge base, and POST-UTME reminder data.
create extension if not exists pgcrypto;

create table if not exists public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  source text not null default 'admin',
  tags text[] not null default '{}',
  status text not null default 'published' check (status in ('draft','published','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_utme_reminders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  event_key text not null default 'post-utme-started',
  scheduled_for timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_emails (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  subject text not null,
  body text not null,
  provider text not null default 'resend',
  provider_id text,
  status text not null default 'sent',
  sent_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.knowledge_items enable row level security;
alter table public.post_utme_reminders enable row level security;
alter table public.admin_emails enable row level security;

create policy "published knowledge is public" on public.knowledge_items for select using (status = 'published' or created_by = auth.uid());
create policy "authenticated users can subscribe" on public.post_utme_reminders for insert to anon, authenticated with check (length(email) between 5 and 320);
create policy "users can view their reminders by email" on public.post_utme_reminders for select to authenticated using (email = (select email from auth.users where id = auth.uid()));
create policy "admins manage knowledge" on public.knowledge_items for all to authenticated using ((select coalesce(raw_app_meta_data->>'role','') from auth.users where id=auth.uid()) = 'admin') with check ((select coalesce(raw_app_meta_data->>'role','') from auth.users where id=auth.uid()) = 'admin');
create policy "admins view mail log" on public.admin_emails for select to authenticated using ((select coalesce(raw_app_meta_data->>'role','') from auth.users where id=auth.uid()) = 'admin');

create index if not exists idx_knowledge_status_updated on public.knowledge_items(status, updated_at desc);
create index if not exists idx_post_utme_reminders_pending on public.post_utme_reminders(event_key, delivered_at, cancelled_at);
create index if not exists idx_admin_emails_created on public.admin_emails(created_at desc);
