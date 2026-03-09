-- Migration: Offee Execution Model - Full Implementation
-- Features: Daily Scorecards, Leader KPIs, Run-rates, Performance Scores, Rewards/Penalties, Support SLA, Products

-- =============================================================================
-- 1. LEADER PROFILES (extends profiles with leader-specific fields)
-- =============================================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_leader BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS leader_title TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS performance_score NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS score_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lop_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pip_status TEXT CHECK (pip_status IN ('none', 'active', 'completed')) DEFAULT 'none';

-- =============================================================================
-- 2. DAILY LEADER SCORECARDS
-- =============================================================================
CREATE TABLE IF NOT EXISTS daily_leader_scorecards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scorecard_date DATE NOT NULL,
  
  -- 3 Output KPIs
  output_kpi_1_label TEXT NOT NULL,
  output_kpi_1_value NUMERIC NOT NULL DEFAULT 0,
  output_kpi_1_cumulative NUMERIC,
  output_kpi_2_label TEXT NOT NULL,
  output_kpi_2_value NUMERIC NOT NULL DEFAULT 0,
  output_kpi_2_cumulative NUMERIC,
  output_kpi_3_label TEXT NOT NULL,
  output_kpi_3_value NUMERIC NOT NULL DEFAULT 0,
  output_kpi_3_cumulative NUMERIC,
  
  -- 2 Pipeline KPIs
  pipeline_kpi_1_label TEXT NOT NULL,
  pipeline_kpi_1_value NUMERIC NOT NULL DEFAULT 0,
  pipeline_kpi_2_label TEXT NOT NULL,
  pipeline_kpi_2_value NUMERIC NOT NULL DEFAULT 0,
  
  -- 1 Quality KPI
  quality_kpi_label TEXT NOT NULL,
  quality_kpi_value NUMERIC NOT NULL DEFAULT 0,
  
  -- 3 Blockers
  blocker_1_description TEXT,
  blocker_1_decision_needed TEXT,
  blocker_2_description TEXT,
  blocker_2_decision_needed TEXT,
  blocker_3_description TEXT,
  blocker_3_decision_needed TEXT,
  
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(workspace_id, leader_id, scorecard_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_leader_scorecards_leader ON daily_leader_scorecards(leader_id);
CREATE INDEX IF NOT EXISTS idx_daily_leader_scorecards_date ON daily_leader_scorecards(scorecard_date);

-- =============================================================================
-- 3. LEADER KPI TEMPLATES (pre-defined KPIs per leader role)
-- =============================================================================
CREATE TABLE IF NOT EXISTS leader_kpi_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Output KPI labels (3)
  output_kpi_1_label TEXT NOT NULL DEFAULT 'Output 1',
  output_kpi_2_label TEXT NOT NULL DEFAULT 'Output 2',
  output_kpi_3_label TEXT NOT NULL DEFAULT 'Output 3',
  
  -- Pipeline KPI labels (2)
  pipeline_kpi_1_label TEXT NOT NULL DEFAULT 'Pipeline 1',
  pipeline_kpi_2_label TEXT NOT NULL DEFAULT 'Pipeline 2',
  
  -- Quality KPI label (1)
  quality_kpi_label TEXT NOT NULL DEFAULT 'Quality',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(workspace_id, leader_id)
);

-- =============================================================================
-- 4. KR RUN-RATE TARGETS (6M, Monthly, Weekly targets)
-- =============================================================================
ALTER TABLE key_results ADD COLUMN IF NOT EXISTS target_6m NUMERIC;
ALTER TABLE key_results ADD COLUMN IF NOT EXISTS target_monthly NUMERIC;
ALTER TABLE key_results ADD COLUMN IF NOT EXISTS target_weekly NUMERIC;
ALTER TABLE key_results ADD COLUMN IF NOT EXISTS is_cumulative BOOLEAN DEFAULT true;
ALTER TABLE key_results ADD COLUMN IF NOT EXISTS is_binary BOOLEAN DEFAULT false;

-- Weekly KR tracking with run-rate
CREATE TABLE IF NOT EXISTS weekly_kr_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_result_id UUID NOT NULL REFERENCES key_results(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  
  weekly_target NUMERIC NOT NULL DEFAULT 0,
  actual NUMERIC NOT NULL DEFAULT 0,
  achievement_pct NUMERIC GENERATED ALWAYS AS (
    CASE WHEN weekly_target > 0 THEN ROUND((actual / weekly_target) * 100, 1) ELSE 0 END
  ) STORED,
  gap NUMERIC GENERATED ALWAYS AS (
    CASE WHEN weekly_target > actual THEN weekly_target - actual ELSE 0 END
  ) STORED,
  remaining_weeks INTEGER DEFAULT 0,
  catch_up_add NUMERIC DEFAULT 0,
  next_week_target NUMERIC DEFAULT 0,
  
  rag_status TEXT CHECK (rag_status IN ('green', 'amber', 'red', 'black')) DEFAULT 'black',
  
  notes TEXT,
  evidence_link TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(key_result_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_kr_tracking_kr ON weekly_kr_tracking(key_result_id);
CREATE INDEX IF NOT EXISTS idx_weekly_kr_tracking_week ON weekly_kr_tracking(week_start);

-- =============================================================================
-- 5. MONTHLY PERFORMANCE SCORES
-- =============================================================================
CREATE TABLE IF NOT EXISTS monthly_performance_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_start DATE NOT NULL,
  
  -- Score components (total 100)
  kr_delivery_score NUMERIC DEFAULT 0 CHECK (kr_delivery_score >= 0 AND kr_delivery_score <= 50),
  pipeline_score NUMERIC DEFAULT 0 CHECK (pipeline_score >= 0 AND pipeline_score <= 20),
  quality_score NUMERIC DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 20),
  discipline_score NUMERIC DEFAULT 0 CHECK (discipline_score >= 0 AND discipline_score <= 10),
  
  total_score NUMERIC GENERATED ALWAYS AS (
    kr_delivery_score + pipeline_score + quality_score + discipline_score
  ) STORED,
  
  -- Tracking
  red_weeks_count INTEGER DEFAULT 0,
  black_events_count INTEGER DEFAULT 0,
  scorecard_compliance_pct NUMERIC DEFAULT 0,
  
  -- Disqualifier
  has_black_event BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(workspace_id, leader_id, month_start)
);

CREATE INDEX IF NOT EXISTS idx_monthly_scores_leader ON monthly_performance_scores(leader_id);
CREATE INDEX IF NOT EXISTS idx_monthly_scores_month ON monthly_performance_scores(month_start);

-- =============================================================================
-- 6. REWARDS TRACKING
-- =============================================================================
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  reward_type TEXT NOT NULL CHECK (reward_type IN ('quarterly_bonus', 'esop_acceleration', 'winners_trip', 'founder_prize')),
  quarter TEXT, -- e.g. 'Q1 2025'
  month TEXT, -- e.g. 'Mar 2025'
  
  amount NUMERIC,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')) DEFAULT 'pending',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rewards_leader ON rewards(leader_id);

-- =============================================================================
-- 7. PENALTIES TRACKING
-- =============================================================================
CREATE TABLE IF NOT EXISTS penalties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  leader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  penalty_type TEXT NOT NULL CHECK (penalty_type IN ('dri_removed', 'lop', 'privilege_removal', 'pip')),
  trigger_reason TEXT NOT NULL,
  
  -- For LOP
  lop_days INTEGER,
  
  -- For DRI removal
  kr_id UUID REFERENCES key_results(id) ON DELETE SET NULL,
  
  -- For privilege removal
  privilege_removed TEXT,
  removal_duration_days INTEGER,
  
  -- For PIP
  pip_start_date DATE,
  pip_end_date DATE,
  pip_metrics TEXT,
  
  status TEXT CHECK (status IN ('active', 'completed', 'reversed')) DEFAULT 'active',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_penalties_leader ON penalties(leader_id);

-- =============================================================================
-- 8. SUPPORT SLA REQUESTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS support_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  -- Request
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  support_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kr_impacted_id UUID REFERENCES key_results(id) ON DELETE SET NULL,
  
  dependency_needed TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  evidence_required TEXT,
  impact_if_delayed TEXT,
  
  -- Response
  response_type TEXT CHECK (response_type IN ('delivered', 'committed', 'rejected')),
  response_evidence_link TEXT,
  response_committed_date TIMESTAMPTZ,
  response_reject_reason TEXT,
  response_alternative TEXT,
  responded_at TIMESTAMPTZ,
  
  -- SLA tracking
  sla_breached BOOLEAN DEFAULT false,
  
  status TEXT CHECK (status IN ('open', 'responded', 'closed')) DEFAULT 'open',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_requests_requester ON support_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_owner ON support_requests(support_owner_id);

-- =============================================================================
-- 9. PRODUCTS (for Product Scoreboard)
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('development', 'beta', 'live', 'deprecated')) DEFAULT 'development',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_workspace ON products(workspace_id);

-- =============================================================================
-- 10. WEEKLY PRODUCT SCORECARDS
-- =============================================================================
CREATE TABLE IF NOT EXISTS weekly_product_scorecards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  
  -- Release
  release_shipped BOOLEAN DEFAULT false,
  features_shipped INTEGER DEFAULT 0,
  
  -- Adoption
  active_orgs INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  activation_rate_pct NUMERIC DEFAULT 0,
  retention_pct NUMERIC DEFAULT 0,
  
  -- API (if applicable)
  api_calls INTEGER DEFAULT 0,
  
  -- Business
  pilot_count INTEGER DEFAULT 0,
  paid_customers INTEGER DEFAULT 0,
  revenue_booked NUMERIC DEFAULT 0,
  roi_captured INTEGER DEFAULT 0,
  
  -- Quality
  nps_csat NUMERIC,
  sev1_incidents INTEGER DEFAULT 0,
  uptime_pct NUMERIC DEFAULT 100,
  mttr_hours NUMERIC DEFAULT 0,
  
  notes TEXT,
  evidence_link TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(product_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_product_scorecards_product ON weekly_product_scorecards(product_id);
CREATE INDEX IF NOT EXISTS idx_product_scorecards_week ON weekly_product_scorecards(week_start);

-- =============================================================================
-- 11. DECISION LOG ENHANCEMENTS
-- =============================================================================
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS decision_id TEXT;
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS days_overdue INTEGER DEFAULT 0;
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS escalation_level TEXT CHECK (escalation_level IN ('none', 'ceo_strip', 'auto_reassign', 'penalty')) DEFAULT 'none';

-- =============================================================================
-- RLS POLICIES FOR NEW TABLES
-- =============================================================================
ALTER TABLE daily_leader_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leader_kpi_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_kr_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_performance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_product_scorecards ENABLE ROW LEVEL SECURITY;

-- Daily Leader Scorecards
CREATE POLICY "Users can read daily_leader_scorecards" ON daily_leader_scorecards FOR SELECT USING (true);
CREATE POLICY "Users can insert daily_leader_scorecards" ON daily_leader_scorecards FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own daily_leader_scorecards" ON daily_leader_scorecards FOR UPDATE USING (auth.uid() = leader_id);

-- Leader KPI Templates
CREATE POLICY "Users can read leader_kpi_templates" ON leader_kpi_templates FOR SELECT USING (true);
CREATE POLICY "Users can manage leader_kpi_templates" ON leader_kpi_templates FOR ALL USING (true);

-- Weekly KR Tracking
CREATE POLICY "Users can read weekly_kr_tracking" ON weekly_kr_tracking FOR SELECT USING (true);
CREATE POLICY "Users can manage weekly_kr_tracking" ON weekly_kr_tracking FOR ALL USING (true);

-- Monthly Performance Scores
CREATE POLICY "Users can read monthly_performance_scores" ON monthly_performance_scores FOR SELECT USING (true);
CREATE POLICY "System can manage monthly_performance_scores" ON monthly_performance_scores FOR ALL USING (true);

-- Rewards
CREATE POLICY "Users can read rewards" ON rewards FOR SELECT USING (true);
CREATE POLICY "System can manage rewards" ON rewards FOR ALL USING (true);

-- Penalties
CREATE POLICY "Users can read penalties" ON penalties FOR SELECT USING (true);
CREATE POLICY "System can manage penalties" ON penalties FOR ALL USING (true);

-- Support Requests
CREATE POLICY "Users can read support_requests" ON support_requests FOR SELECT USING (true);
CREATE POLICY "Users can insert support_requests" ON support_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update support_requests" ON support_requests FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = support_owner_id);

-- Products
CREATE POLICY "Users can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Users can manage products" ON products FOR ALL USING (true);

-- Weekly Product Scorecards
CREATE POLICY "Users can read weekly_product_scorecards" ON weekly_product_scorecards FOR SELECT USING (true);
CREATE POLICY "Users can manage weekly_product_scorecards" ON weekly_product_scorecards FOR ALL USING (true);
