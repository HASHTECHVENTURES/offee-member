-- Add CEO and Member roles; fix Admin to be admin-panel-only (no OKR/KR manage).
-- Run after 20250310000000_admin_roles_and_member_status.sql

-- 1. Fix Admin role: admin-panel only, no execution (OKR/KR manage = false)
UPDATE public.roles
SET can_manage_okrs = false, can_manage_key_results = false, updated_at = NOW()
WHERE slug = 'admin';

-- 2. Add CEO role (full company dashboard, can manage OKRs/KRs, no admin panel)
INSERT INTO public.roles (workspace_id, name, slug, can_access_admin_panel, can_manage_okrs, can_manage_key_results, dashboard_type)
SELECT id, 'CEO', 'ceo', false, true, true, 'ceo'
FROM public.workspaces WHERE slug = 'test' OR id = 'a0000000-0000-0000-0000-000000000001'::uuid LIMIT 1
ON CONFLICT (workspace_id, slug) DO NOTHING;

-- 3. Add Member role (my dashboard only, no manage)
INSERT INTO public.roles (workspace_id, name, slug, can_access_admin_panel, can_manage_okrs, can_manage_key_results, dashboard_type)
SELECT id, 'Member', 'member', false, false, false, 'my'
FROM public.workspaces WHERE slug = 'test' OR id = 'a0000000-0000-0000-0000-000000000001'::uuid LIMIT 1
ON CONFLICT (workspace_id, slug) DO NOTHING;
