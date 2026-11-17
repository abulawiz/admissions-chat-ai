CREATE TABLE public.user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role = 'admin'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;
REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;

CREATE TABLE public.knowledge_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'admin',
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_items TO authenticated;
GRANT ALL ON public.knowledge_items TO service_role;
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published knowledge is public" ON public.knowledge_items FOR SELECT USING (status = 'published' OR (auth.uid() IS NOT NULL AND created_by = auth.uid()));
CREATE POLICY "Admins manage knowledge" ON public.knowledge_items FOR ALL TO authenticated USING ((SELECT public.current_user_is_admin())) WITH CHECK ((SELECT public.current_user_is_admin()));
CREATE INDEX idx_knowledge_status_updated ON public.knowledge_items(status, updated_at DESC);

CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT 'false'::jsonb,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published settings are public" ON public.site_settings FOR SELECT USING (key = 'post_utme_started');
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL TO authenticated USING ((SELECT public.current_user_is_admin())) WITH CHECK ((SELECT public.current_user_is_admin()));
INSERT INTO public.site_settings (key, value) VALUES ('post_utme_started', 'false'::jsonb);

CREATE TABLE public.post_utme_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT,
  event_key TEXT NOT NULL DEFAULT 'post-utme-started',
  scheduled_for TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT post_utme_reminders_email_valid CHECK (length(email) BETWEEN 5 AND 320 AND position('@' IN email) > 1)
);
GRANT INSERT ON public.post_utme_reminders TO anon, authenticated;
GRANT SELECT, UPDATE ON public.post_utme_reminders TO authenticated;
GRANT ALL ON public.post_utme_reminders TO service_role;
ALTER TABLE public.post_utme_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe to reminders" ON public.post_utme_reminders FOR INSERT TO anon, authenticated WITH CHECK (length(email) BETWEEN 5 AND 320 AND position('@' IN email) > 1);
CREATE POLICY "Admins view reminders" ON public.post_utme_reminders FOR SELECT TO authenticated USING ((SELECT public.current_user_is_admin()));
CREATE POLICY "Admins update reminders" ON public.post_utme_reminders FOR UPDATE TO authenticated USING ((SELECT public.current_user_is_admin())) WITH CHECK ((SELECT public.current_user_is_admin()));
CREATE INDEX idx_post_utme_reminders_pending ON public.post_utme_reminders(event_key, delivered_at, cancelled_at);

CREATE TABLE public.admin_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'resend',
  provider_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  sent_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_emails TO authenticated;
GRANT ALL ON public.admin_emails TO service_role;
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view mail log" ON public.admin_emails FOR SELECT TO authenticated USING ((SELECT public.current_user_is_admin()));
CREATE INDEX idx_admin_emails_created ON public.admin_emails(created_at DESC);

CREATE POLICY "Admins view all conversations" ON public.conversations FOR SELECT TO authenticated USING ((SELECT public.current_user_is_admin()));
CREATE POLICY "Admins view all chat messages" ON public.chat_messages FOR SELECT TO authenticated USING ((SELECT public.current_user_is_admin()));