-- Add HR role per Offee Execution Model (HR = hiring, performance system, execution culture).
-- Run after 20250312000000_roles_rls_policies.sql

INSERT INTO public.roles (workspace_id, name, slug, can_access_admin_panel, can_manage_okrs, can_manage_key_results, dashboard_type)
SELECT DISTINCT workspace_id, 'HR', 'hr', false, false, false, 'my'
FROM public.roles
ON CONFLICT (workspace_id, slug) DO NOTHING;
