-- =============================================================================
-- OFFEE – RUN THIS ONCE IN ORDER
-- Copy the ENTIRE file → Supabase Dashboard → SQL Editor → New query → Paste → Run
-- When it finishes, tell me "I have run it in order" and I will test login.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PART 1: SCHEMA (tables, trigger, RLS)
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'editor', 'viewer', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;
CREATE POLICY "Users can read profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read workspace_members" ON public.workspace_members;
CREATE POLICY "Users can read workspace_members" ON public.workspace_members FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert workspace_members" ON public.workspace_members;
CREATE POLICY "Users can insert workspace_members" ON public.workspace_members FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update workspace_members" ON public.workspace_members;
CREATE POLICY "Users can update workspace_members" ON public.workspace_members FOR UPDATE USING (true);

-- -----------------------------------------------------------------------------
-- PART 2: SEED (test workspace + 4 test users)
-- -----------------------------------------------------------------------------
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
  inst_id uuid;
  rec record;
BEGIN
  SELECT id INTO inst_id FROM auth.instances LIMIT 1;
  IF inst_id IS NULL THEN
    inst_id := '00000000-0000-0000-0000-000000000000'::uuid;
  END IF;

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
        NOW(), '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', rec.full_name), NOW(), NOW(),
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
