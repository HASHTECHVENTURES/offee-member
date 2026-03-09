-- Full Admin & Roles: roles table, member status, role_id on workspace_members
-- Run in Supabase SQL Editor after existing migrations

-- =============================================================================
-- 1. ROLES (per-workspace; defines what each role can see/do)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  can_access_admin_panel BOOLEAN NOT NULL DEFAULT false,
  can_manage_okrs BOOLEAN NOT NULL DEFAULT false,
  can_manage_key_results BOOLEAN NOT NULL DEFAULT false,
  dashboard_type TEXT NOT NULL DEFAULT 'my' CHECK (dashboard_type IN ('ceo', 'my')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_roles_workspace ON public.roles(workspace_id);

-- =============================================================================
-- 2. WORKSPACE_MEMBERS: add status and role_id
-- =============================================================================
ALTER TABLE public.workspace_members
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active')),
  ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_workspace_members_role_id ON public.workspace_members(role_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_status ON public.workspace_members(status);

-- =============================================================================
-- 3. SEED DEFAULT ROLES (for existing default workspace)
-- =============================================================================
INSERT INTO public.roles (workspace_id, name, slug, can_access_admin_panel, can_manage_okrs, can_manage_key_results, dashboard_type)
SELECT id, 'Admin', 'admin', true, true, true, 'ceo'
FROM public.workspaces WHERE slug = 'test' OR id = 'a0000000-0000-0000-0000-000000000001'::uuid LIMIT 1
ON CONFLICT (workspace_id, slug) DO NOTHING;

INSERT INTO public.roles (workspace_id, name, slug, can_access_admin_panel, can_manage_okrs, can_manage_key_results, dashboard_type)
SELECT id, 'Leader', 'leader', false, false, false, 'my'
FROM public.workspaces WHERE slug = 'test' OR id = 'a0000000-0000-0000-0000-000000000001'::uuid LIMIT 1
ON CONFLICT (workspace_id, slug) DO NOTHING;

-- Backfill role_id from current role text
UPDATE public.workspace_members wm
SET role_id = r.id, updated_at = NOW()
FROM public.roles r
WHERE r.workspace_id = wm.workspace_id
  AND (
    (wm.role = 'admin' AND r.slug = 'admin')
    OR (wm.role IN ('editor', 'member', 'viewer') AND r.slug = 'leader')
  )
  AND wm.role_id IS NULL;
