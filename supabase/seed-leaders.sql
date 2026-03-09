-- =============================================================================
-- SEED LEADERS (test logins for KRA/OKR app)
-- Run in Supabase Dashboard → SQL Editor → New query → Paste → Run
--
-- Password for ALL users below:  Test1234
--
-- Run after: run-this-in-order.sql and migrations. Ensure seed-test-users.sql
-- has run at least once (so Test Workspace exists), or run the workspace INSERT
-- from seed-test-users.sql first.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure test workspace exists
INSERT INTO public.workspaces (id, name, slug, created_at, updated_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Test Workspace',
  'test',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

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
      ('amit@test.com',      'Amit (Founder/CEO)',           'admin'),
      ('nayan@test.com',     'Dr. Nayan (Growth/Strategy)',  'admin'),
      ('nandkumar@test.com', 'Nandkumar (Business/Partnerships)', 'editor'),
      ('ishita@test.com',    'Ishita (Direct Sales)',        'editor'),
      ('chetan@test.com',    'Chetan (Finance)',             'editor'),
      ('ambrish@test.com',   'Ambrish (Ops/Delivery)',       'editor'),
      ('akshay@test.com',    'Akshay (CTO + Product)',       'admin'),
      ('manish@test.com',    'Manish (Infra/Security/IoT)',  'editor'),
      ('sakshi@test.com',    'Sakshi (Research/Assessment)', 'editor'),
      ('rohan@test.com',     'Rohan (Marketing)',            'editor'),
      ('ankit@test.com',     'Ankit (Customer Success)',     'editor'),
      ('ankita@test.com',    'Ankita (HR)',                  'editor'),
      ('pratik@test.com',    'Pratik (Founder Office)',      'editor')
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

    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (u_id, rec.email, rec.full_name, rec.role, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      updated_at = NOW();

    INSERT INTO public.workspace_members (workspace_id, user_id, role, created_at, updated_at)
    VALUES (w_id, u_id, rec.role, NOW(), NOW())
    ON CONFLICT (workspace_id, user_id) DO UPDATE SET
      role = EXCLUDED.role,
      updated_at = NOW();
  END LOOP;
END $$;
