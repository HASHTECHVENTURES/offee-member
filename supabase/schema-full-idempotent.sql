-- Execution OS – Full schema (idempotent, safe to re-run)
-- Run this entire script in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- WORKSPACES
-- =============================================================================
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PROFILES
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- OKRs
-- =============================================================================
CREATE TABLE IF NOT EXISTS okrs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  quarter TEXT,
  year INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_okrs_workspace_id ON okrs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_okrs_status ON okrs(status);

-- =============================================================================
-- KEY RESULTS (base columns first; dri_id/metric_type added below if missing)
-- =============================================================================
CREATE TABLE IF NOT EXISTS key_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  okr_id UUID NOT NULL REFERENCES okrs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL DEFAULT 0,
  unit TEXT,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'on_track', 'at_risk', 'behind', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE key_results ADD COLUMN IF NOT EXISTS metric_type TEXT;
ALTER TABLE key_results ADD COLUMN IF NOT EXISTS dri_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_key_results_okr_id ON key_results(okr_id);
CREATE INDEX IF NOT EXISTS idx_key_results_status ON key_results(status);
CREATE INDEX IF NOT EXISTS idx_key_results_dri_id ON key_results(dri_id);

-- =============================================================================
-- SCORECARDS
-- =============================================================================
CREATE TABLE IF NOT EXISTS scorecards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  period TEXT,
  metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scorecards_workspace_id ON scorecards(workspace_id);

-- =============================================================================
-- DAILY SCORECARDS
-- =============================================================================
CREATE TABLE IF NOT EXISTS daily_scorecards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at DATE NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'UTC'),
  output_kpi_1 NUMERIC,
  output_kpi_2 NUMERIC,
  output_kpi_3 NUMERIC,
  pipeline_kpi_1 NUMERIC,
  pipeline_kpi_2 NUMERIC,
  quality_kpi_1 NUMERIC,
  blockers TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_scorecards_workspace_id ON daily_scorecards(workspace_id);
CREATE INDEX IF NOT EXISTS idx_daily_scorecards_submitted_at ON daily_scorecards(submitted_at);

-- =============================================================================
-- DECISIONS (base columns; due_date, kr_impacted_id, evidence_link added below)
-- =============================================================================
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  context TEXT,
  outcome TEXT,
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'decided', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE decisions ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS kr_impacted_id UUID REFERENCES key_results(id) ON DELETE SET NULL;
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS evidence_link TEXT;

CREATE INDEX IF NOT EXISTS idx_decisions_workspace_id ON decisions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(status);
CREATE INDEX IF NOT EXISTS idx_decisions_due_date ON decisions(due_date);

-- =============================================================================
-- AI REPORTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  metadata JSONB,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_reports_workspace_id ON ai_reports(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_report_type ON ai_reports(report_type);

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies then recreate (so script is re-runnable)
DROP POLICY IF EXISTS "Users can read workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can insert workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can update workspaces" ON workspaces;

CREATE POLICY "Users can read workspaces" ON workspaces FOR SELECT USING (true);
CREATE POLICY "Users can insert workspaces" ON workspaces FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update workspaces" ON workspaces FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read okrs" ON okrs;
DROP POLICY IF EXISTS "Users can insert okrs" ON okrs;
DROP POLICY IF EXISTS "Users can update okrs" ON okrs;
DROP POLICY IF EXISTS "Users can delete okrs" ON okrs;

CREATE POLICY "Users can read okrs" ON okrs FOR SELECT USING (true);
CREATE POLICY "Users can insert okrs" ON okrs FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update okrs" ON okrs FOR UPDATE USING (true);
CREATE POLICY "Users can delete okrs" ON okrs FOR DELETE USING (true);

DROP POLICY IF EXISTS "Users can read key_results" ON key_results;
DROP POLICY IF EXISTS "Users can insert key_results" ON key_results;
DROP POLICY IF EXISTS "Users can update key_results" ON key_results;
DROP POLICY IF EXISTS "Users can delete key_results" ON key_results;

CREATE POLICY "Users can read key_results" ON key_results FOR SELECT USING (true);
CREATE POLICY "Users can insert key_results" ON key_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update key_results" ON key_results FOR UPDATE USING (true);
CREATE POLICY "Users can delete key_results" ON key_results FOR DELETE USING (true);

DROP POLICY IF EXISTS "Users can read scorecards" ON scorecards;
DROP POLICY IF EXISTS "Users can insert scorecards" ON scorecards;
DROP POLICY IF EXISTS "Users can update scorecards" ON scorecards;
DROP POLICY IF EXISTS "Users can delete scorecards" ON scorecards;

CREATE POLICY "Users can read scorecards" ON scorecards FOR SELECT USING (true);
CREATE POLICY "Users can insert scorecards" ON scorecards FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update scorecards" ON scorecards FOR UPDATE USING (true);
CREATE POLICY "Users can delete scorecards" ON scorecards FOR DELETE USING (true);

DROP POLICY IF EXISTS "Users can read daily_scorecards" ON daily_scorecards;
DROP POLICY IF EXISTS "Users can insert daily_scorecards" ON daily_scorecards;
DROP POLICY IF EXISTS "Users can update daily_scorecards" ON daily_scorecards;
DROP POLICY IF EXISTS "Users can delete daily_scorecards" ON daily_scorecards;

CREATE POLICY "Users can read daily_scorecards" ON daily_scorecards FOR SELECT USING (true);
CREATE POLICY "Users can insert daily_scorecards" ON daily_scorecards FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update daily_scorecards" ON daily_scorecards FOR UPDATE USING (true);
CREATE POLICY "Users can delete daily_scorecards" ON daily_scorecards FOR DELETE USING (true);

DROP POLICY IF EXISTS "Users can read decisions" ON decisions;
DROP POLICY IF EXISTS "Users can insert decisions" ON decisions;
DROP POLICY IF EXISTS "Users can update decisions" ON decisions;
DROP POLICY IF EXISTS "Users can delete decisions" ON decisions;

CREATE POLICY "Users can read decisions" ON decisions FOR SELECT USING (true);
CREATE POLICY "Users can insert decisions" ON decisions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update decisions" ON decisions FOR UPDATE USING (true);
CREATE POLICY "Users can delete decisions" ON decisions FOR DELETE USING (true);

DROP POLICY IF EXISTS "Users can read ai_reports" ON ai_reports;
DROP POLICY IF EXISTS "Users can insert ai_reports" ON ai_reports;
DROP POLICY IF EXISTS "Users can delete ai_reports" ON ai_reports;

CREATE POLICY "Users can read ai_reports" ON ai_reports FOR SELECT USING (true);
CREATE POLICY "Users can insert ai_reports" ON ai_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete ai_reports" ON ai_reports FOR DELETE USING (true);

-- =============================================================================
-- TRIGGER: profile on signup
-- =============================================================================
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
