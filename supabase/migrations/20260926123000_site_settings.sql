-- Supporting settings table for admin-controlled event announcements.
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default 'false'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
create policy "published settings are public" on public.site_settings for select using (key = 'post_utme_started');
create policy "admins manage settings" on public.site_settings for all to authenticated using ((select coalesce(raw_app_meta_data->>'role','') from auth.users where id=auth.uid()) = 'admin') with check ((select coalesce(raw_app_meta_data->>'role','') from auth.users where id=auth.uid()) = 'admin');
insert into public.site_settings(key, value) values ('post_utme_started', 'false'::jsonb) on conflict (key) do nothing;
