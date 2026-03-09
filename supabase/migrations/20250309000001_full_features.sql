-- Migration: Full Feature Set for Offee Execution OS
-- Features: Check-ins, Comments, Teams, Quarters, Audit, Permissions, Parent OKRs, Confidence

-- =============================================================================
-- 1. KR CHECK-INS (Progress History)
-- =============================================================================
CREATE TABLE IF NOT EXISTS kr_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_result_id UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_value NUMERIC NOT NULL,
  new_value NUMERIC NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kr_check_ins_kr_id ON kr_check_ins(key_result_id);
CREATE INDEX IF NOT EXISTS idx_kr_check_ins_created_at ON kr_check_ins(created_at);

-- =============================================================================
-- 2. COMMENTS (Generic comments on OKRs, KRs, Decisions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('okr', 'key_result', 'decision')),
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- =============================================================================
-- 3. TEAMS / DEPARTMENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_workspace_id ON teams(workspace_id);

-- Add team_id to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON profiles(team_id);

-- =============================================================================
-- 4. QUARTERS (Cycle Management)
-- =============================================================================
CREATE TABLE IF NOT EXISTS quarters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "Q1 2025"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, name)
);

CREATE INDEX IF NOT EXISTS idx_quarters_workspace_id ON quarters(workspace_id);
CREATE INDEX IF NOT EXISTS idx_quarters_status ON quarters(status);

-- Link OKRs to quarters
ALTER TABLE okrs ADD COLUMN IF NOT EXISTS quarter_id UUID REFERENCES quarters(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_okrs_quarter_id ON okrs(quarter_id);

-- =============================================================================
-- 5. OKR HIERARCHY (Parent-Child)
-- =============================================================================
ALTER TABLE okrs ADD COLUMN IF NOT EXISTS parent_okr_id UUID REFERENCES okrs(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_okrs_parent_id ON okrs(parent_okr_id);

-- =============================================================================
-- 6. CONFIDENCE SCORING ON KEY RESULTS
-- =============================================================================
ALTER TABLE key_results ADD COLUMN IF NOT EXISTS confidence INTEGER CHECK (confidence >= 1 AND confidence <= 10);

-- =============================================================================
-- 7. WORKSPACE ROLES (Permissions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'editor', 'viewer', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);

-- =============================================================================
-- 8. AUDIT LOG
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  entity_type TEXT NOT NULL, -- 'okr', 'key_result', 'decision', etc.
  entity_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace_id ON audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- =============================================================================
-- 9. NOTIFICATION PREFERENCES
-- =============================================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_overdue_decisions BOOLEAN NOT NULL DEFAULT true,
  email_weekly_digest BOOLEAN NOT NULL DEFAULT true,
  email_scorecard_reminder BOOLEAN NOT NULL DEFAULT true,
  email_kr_at_risk BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =============================================================================
-- 10. SCHEDULED NOTIFICATIONS (for email queue)
-- =============================================================================
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'overdue_decision', 'weekly_digest', 'scorecard_reminder', 'kr_at_risk'
  payload JSONB,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_for) WHERE sent_at IS NULL;

-- =============================================================================
-- RLS POLICIES FOR NEW TABLES
-- =============================================================================
ALTER TABLE kr_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarters ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- KR Check-ins
CREATE POLICY "Users can read kr_check_ins" ON kr_check_ins FOR SELECT USING (true);
CREATE POLICY "Users can insert kr_check_ins" ON kr_check_ins FOR INSERT WITH CHECK (true);

-- Comments
CREATE POLICY "Users can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Teams
CREATE POLICY "Users can read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Users can insert teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Users can delete teams" ON teams FOR DELETE USING (true);

-- Quarters
CREATE POLICY "Users can read quarters" ON quarters FOR SELECT USING (true);
CREATE POLICY "Users can insert quarters" ON quarters FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update quarters" ON quarters FOR UPDATE USING (true);
CREATE POLICY "Users can delete quarters" ON quarters FOR DELETE USING (true);

-- Workspace Members
CREATE POLICY "Users can read workspace_members" ON workspace_members FOR SELECT USING (true);
CREATE POLICY "Users can insert workspace_members" ON workspace_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update workspace_members" ON workspace_members FOR UPDATE USING (true);
CREATE POLICY "Users can delete workspace_members" ON workspace_members FOR DELETE USING (true);

-- Audit Logs (read only for users)
CREATE POLICY "Users can read audit_logs" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "System can insert audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- Notification Preferences
CREATE POLICY "Users can read own notification_preferences" ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notification_preferences" ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notification_preferences" ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Notification Queue
CREATE POLICY "Users can read own notification_queue" ON notification_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage notification_queue" ON notification_queue FOR ALL USING (true);
