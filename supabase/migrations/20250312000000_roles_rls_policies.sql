-- RLS policies for public.roles so the app can create and manage roles.
-- Run after 20250310000000_admin_roles_and_member_status.sql (and 20250311000000 if used).
-- Fixes: "new row violates row-level security policy for table 'roles'"

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read roles" ON public.roles;
CREATE POLICY "Users can read roles" ON public.roles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert roles" ON public.roles;
CREATE POLICY "Users can insert roles" ON public.roles
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update roles" ON public.roles;
CREATE POLICY "Users can update roles" ON public.roles
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete roles" ON public.roles;
CREATE POLICY "Users can delete roles" ON public.roles
  FOR DELETE USING (true);
