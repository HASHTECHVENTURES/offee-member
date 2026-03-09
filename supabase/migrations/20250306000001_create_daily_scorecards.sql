-- Daily scorecards: 3 Output + 2 Pipeline + 1 Quality KPIs + blockers
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

ALTER TABLE daily_scorecards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read daily_scorecards" ON daily_scorecards FOR SELECT USING (true);
CREATE POLICY "Users can insert daily_scorecards" ON daily_scorecards FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update daily_scorecards" ON daily_scorecards FOR UPDATE USING (true);
CREATE POLICY "Users can delete daily_scorecards" ON daily_scorecards FOR DELETE USING (true);
