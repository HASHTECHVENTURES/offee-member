-- =============================================================================
-- SEED TEST USERS FOR LOCAL TESTING
-- Run this once in Supabase Dashboard → SQL Editor → New query → Paste → Run
-- Then sign in at /login with any of these (password for all: Test1234)
--
-- IMPORTANT: Run these first (in order), then run this seed:
--   1. supabase/schema.sql  (creates workspaces, profiles, okrs, key_results, etc.)
--   2. All files in supabase/migrations/ (e.g. 20250306000000_*.sql through 20250309000002_*.sql)
-- If you see "Database error querying schema" on login, the DB schema is missing or out of date.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Test workspace
INSERT INTO public.workspaces (id, name, slug, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Test Workspace',
  'test',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create 4 test users in auth + profiles + workspace_members
DO $$
DECLARE
  w_id uuid := 'a0000000-0000-0000-0000-000000000001'::uuid;
  u_id uuid;
  pw text := crypt('Test1234', gen_salt('bf'));
  inst_id uuid := COALESCE((SELECT id FROM auth.instances LIMIT 1), '00000000-0000-0000-0000-000000000000'::uuid);
  rec record;
BEGIN
  FOR rec IN
    SELECT * FROM (VALUES
      ('admin@test.com',  'Admin User',  'admin'),
      ('editor@test.com', 'Editor User', 'editor'),
      ('member@test.com', 'Member User', 'member'),
      ('viewer@test.com', 'Viewer User', 'viewer')
    ) AS t(email, full_name, role)
  LOOP
    SELECT id INTO u_id FROM auth.users WHERE email = rec.email LIMIT 1;
    IF u_id IS NULL THEN
      u_id := gen_random_uuid();
      INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) VALUES (
        u_id, inst_id, 'authenticated', 'authenticated', rec.email, pw,
        NOW(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', rec.full_name), NOW(), NOW(),
        '', '', '', ''
      );
    ELSE
      UPDATE auth.users SET
        encrypted_password = pw,
        email_confirmed_at = NOW(),
        updated_at = NOW(),
        confirmation_token = '',
        recovery_token = '',
        email_change_token_new = '',
        email_change = ''
      WHERE id = u_id;
    END IF;

    -- auth.identities (required to sign in; provider_id = user id for email)
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), u_id,
      jsonb_build_object('sub', u_id::text, 'email', rec.email),
      'email', u_id::text, NOW(), NOW(), NOW()
    )
    ON CONFLICT (provider_id, provider) DO UPDATE SET
      user_id = EXCLUDED.user_id,
      identity_data = EXCLUDED.identity_data,
      last_sign_in_at = NOW(),
      updated_at = NOW();

    -- profile (trigger may have created it; upsert role)
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (u_id, rec.email, rec.full_name, rec.role, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      updated_at = NOW();

    -- workspace_members
    INSERT INTO public.workspace_members (workspace_id, user_id, role, created_at, updated_at)
    VALUES (w_id, u_id, rec.role, NOW(), NOW())
    ON CONFLICT (workspace_id, user_id) DO UPDATE SET
      role = EXCLUDED.role,
      updated_at = NOW();
  END LOOP;
END $$;
