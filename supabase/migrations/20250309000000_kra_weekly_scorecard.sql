-- Migration: Add KRAs (Key Responsibility Areas) and Weekly KR Scorecards
-- Aligns with Offee Execution Model

-- =============================================================================
-- KEY RESPONSIBILITY AREAS (KRAs)
-- Each leader has max 3 stable responsibility areas (used for appraisal + role clarity)
-- =============================================================================
CREATE TABLE IF NOT EXISTS key_responsibility_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kras_workspace_id ON key_responsibility_areas(workspace_id);

-- Junction table: Leader <-> KRA (max 3 KRAs per leader enforced in app)
CREATE TABLE IF NOT EXISTS leader_kras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kra_id UUID NOT NULL REFERENCES key_responsibility_areas(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(leader_id, kra_id)
);

CREATE INDEX IF NOT EXISTS idx_leader_kras_leader_id ON leader_kras(leader_id);
CREATE INDEX IF NOT EXISTS idx_leader_kras_kra_id ON leader_kras(kra_id);

-- =============================================================================
-- WEEKLY KR SCORECARDS
-- DRIs report weekly numbers for EACH of their KRs
-- Format: output_value, pipeline_value, quality_value + blockers (links to decision)
-- =============================================================================
CREATE TABLE IF NOT EXISTS weekly_kr_scorecards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_result_id UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
  dri_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL, -- Monday of the reporting week
  output_value NUMERIC,
  pipeline_value NUMERIC,
  quality_value NUMERIC,
  notes TEXT,
  blocker_decision_id UUID REFERENCES decisions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(key_result_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_kr_scorecards_kr_id ON weekly_kr_scorecards(key_result_id);
CREATE INDEX IF NOT EXISTS idx_weekly_kr_scorecards_dri_id ON weekly_kr_scorecards(dri_id);
CREATE INDEX IF NOT EXISTS idx_weekly_kr_scorecards_week ON weekly_kr_scorecards(week_start);

-- =============================================================================
-- RLS for new tables
-- =============================================================================
ALTER TABLE key_responsibility_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE leader_kras ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_kr_scorecards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read kras" ON key_responsibility_areas;
DROP POLICY IF EXISTS "Users can insert kras" ON key_responsibility_areas;
DROP POLICY IF EXISTS "Users can update kras" ON key_responsibility_areas;
DROP POLICY IF EXISTS "Users can delete kras" ON key_responsibility_areas;
CREATE POLICY "Users can read kras" ON key_responsibility_areas FOR SELECT USING (true);
CREATE POLICY "Users can insert kras" ON key_responsibility_areas FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update kras" ON key_responsibility_areas FOR UPDATE USING (true);
CREATE POLICY "Users can delete kras" ON key_responsibility_areas FOR DELETE USING (true);

DROP POLICY IF EXISTS "Users can read leader_kras" ON leader_kras;
DROP POLICY IF EXISTS "Users can insert leader_kras" ON leader_kras;
DROP POLICY IF EXISTS "Users can delete leader_kras" ON leader_kras;
CREATE POLICY "Users can read leader_kras" ON leader_kras FOR SELECT USING (true);
CREATE POLICY "Users can insert leader_kras" ON leader_kras FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete leader_kras" ON leader_kras FOR DELETE USING (true);

DROP POLICY IF EXISTS "Users can read weekly_kr_scorecards" ON weekly_kr_scorecards;
DROP POLICY IF EXISTS "Users can insert weekly_kr_scorecards" ON weekly_kr_scorecards;
DROP POLICY IF EXISTS "Users can update weekly_kr_scorecards" ON weekly_kr_scorecards;
DROP POLICY IF EXISTS "Users can delete weekly_kr_scorecards" ON weekly_kr_scorecards;
CREATE POLICY "Users can read weekly_kr_scorecards" ON weekly_kr_scorecards FOR SELECT USING (true);
CREATE POLICY "Users can insert weekly_kr_scorecards" ON weekly_kr_scorecards FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update weekly_kr_scorecards" ON weekly_kr_scorecards FOR UPDATE USING (true);
CREATE POLICY "Users can delete weekly_kr_scorecards" ON weekly_kr_scorecards FOR DELETE USING (true);
