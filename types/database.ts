/**
 * Database entity types for Execution OS.
 * Align these with your Supabase table schemas.
 */

export interface Workspace {
  id: string;
  name: string;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  workspace_id: string | null;
  team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OKR {
  id: string;
  workspace_id: string;
  owner_id: string | null;
  title: string;
  description: string | null;
  quarter: string | null;
  year: number | null;
  quarter_id: string | null;
  parent_okr_id: string | null;
  status: "draft" | "active" | "completed" | "cancelled";
  progress_percent: number;
  created_at: string;
  updated_at: string;
}

export type MetricType = "number" | "percentage" | "currency" | "count" | "custom";

export interface KeyResult {
  id: string;
  okr_id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string | null;
  metric_type: MetricType | null;
  dri_id: string | null;
  confidence: number | null;
  status: "not_started" | "on_track" | "at_risk" | "behind" | "completed";
  created_at: string;
  updated_at: string;
}

export interface Scorecard {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  period: string | null;
  metrics: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/** Daily scorecard submission: 3 Output + 2 Pipeline + 1 Quality KPIs + blockers */
export interface DailyScorecard {
  id: string;
  workspace_id: string;
  submitted_by: string | null;
  submitted_at: string;
  output_kpi_1: number | null;
  output_kpi_2: number | null;
  output_kpi_3: number | null;
  pipeline_kpi_1: number | null;
  pipeline_kpi_2: number | null;
  quality_kpi_1: number | null;
  blockers: string | null;
  created_at: string;
}

export type DailyScorecardInsert = Omit<DailyScorecard, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export interface Decision {
  id: string;
  workspace_id: string;
  title: string;
  context: string | null;
  outcome: string | null;
  decided_at: string | null;
  decided_by: string | null;
  due_date: string | null;
  kr_impacted_id: string | null;
  evidence_link: string | null;
  status: "open" | "decided" | "archived";
  created_at: string;
  updated_at: string;
}

export interface AIReport {
  id: string;
  workspace_id: string;
  report_type: string;
  title: string;
  content: string | null;
  metadata: Record<string, unknown> | null;
  generated_at: string;
  created_at: string;
}

/** Key Responsibility Area - stable job areas for leaders (max 3 per leader) */
export interface KeyResponsibilityArea {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/** Junction: Leader <-> KRA assignment */
export interface LeaderKRA {
  id: string;
  leader_id: string;
  kra_id: string;
  assigned_at: string;
}

/** Weekly KR Scorecard - DRI reports weekly numbers for each KR */
export interface WeeklyKRScorecard {
  id: string;
  key_result_id: string;
  dri_id: string;
  week_start: string;
  output_value: number | null;
  pipeline_value: number | null;
  quality_value: number | null;
  notes: string | null;
  blocker_decision_id: string | null;
  created_at: string;
  updated_at: string;
}

/** Insert types (omit id, created_at, updated_at where auto-generated) */
export type UserProfileInsert = Omit<UserProfile, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type OKRInsert = Omit<OKR, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type KeyResultInsert = Omit<KeyResult, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ScorecardInsert = Omit<Scorecard, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type DecisionInsert = Omit<Decision, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type AIReportInsert = Omit<AIReport, "id" | "created_at" | "generated_at"> & {
  id?: string;
  created_at?: string;
  generated_at?: string;
};

export type KeyResponsibilityAreaInsert = Omit<KeyResponsibilityArea, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type LeaderKRAInsert = Omit<LeaderKRA, "id" | "assigned_at"> & {
  id?: string;
  assigned_at?: string;
};

export type WeeklyKRScorecardInsert = Omit<WeeklyKRScorecard, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

/** KR Check-in - tracks progress history */
export interface KRCheckIn {
  id: string;
  key_result_id: string;
  user_id: string;
  previous_value: number;
  new_value: number;
  note: string | null;
  created_at: string;
}

export type KRCheckInInsert = Omit<KRCheckIn, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

/** Comment - generic comments on OKRs, KRs, Decisions */
export interface Comment {
  id: string;
  user_id: string;
  entity_type: "okr" | "key_result" | "decision";
  entity_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type CommentInsert = Omit<Comment, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

/** Team / Department */
export interface Team {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  lead_id: string | null;
  created_at: string;
  updated_at: string;
}

export type TeamInsert = Omit<Team, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

/** Quarter / Cycle */
export interface Quarter {
  id: string;
  workspace_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: "planning" | "active" | "closed";
  created_at: string;
  updated_at: string;
}

export type QuarterInsert = Omit<Quarter, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

/** Role (per-workspace): defines permissions and dashboard type */
export interface Role {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  can_access_admin_panel: boolean;
  can_manage_okrs: boolean;
  can_manage_key_results: boolean;
  dashboard_type: "ceo" | "my";
  created_at: string;
  updated_at: string;
}

export type RoleInsert = Omit<Role, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

/** Workspace Member with role and status */
export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: "admin" | "editor" | "viewer" | "member";
  status?: "pending" | "active";
  role_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type WorkspaceMemberInsert = Omit<WorkspaceMember, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

/** Member row with profile and role joined (for Admin panel) */
export interface MemberWithProfile extends WorkspaceMember {
  profile?: UserProfile | null;
  roleRecord?: Role | null;
}

/** Audit Log entry */
export interface AuditLog {
  id: string;
  workspace_id: string | null;
  user_id: string | null;
  action: "create" | "update" | "delete";
  entity_type: string;
  entity_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

export type AuditLogInsert = Omit<AuditLog, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

/** Notification Preferences */
export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_overdue_decisions: boolean;
  email_weekly_digest: boolean;
  email_scorecard_reminder: boolean;
  email_kr_at_risk: boolean;
  created_at: string;
  updated_at: string;
}

export type NotificationPreferencesInsert = Omit<NotificationPreferences, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

// ============================================================================
// OFFEE EXECUTION MODEL TYPES
// ============================================================================

/** Daily Leader Scorecard */
export interface DailyLeaderScorecard {
  id: string;
  workspace_id: string;
  leader_id: string;
  scorecard_date: string;
  
  output_kpi_1_label: string;
  output_kpi_1_value: number;
  output_kpi_1_cumulative: number | null;
  output_kpi_2_label: string;
  output_kpi_2_value: number;
  output_kpi_2_cumulative: number | null;
  output_kpi_3_label: string;
  output_kpi_3_value: number;
  output_kpi_3_cumulative: number | null;
  
  pipeline_kpi_1_label: string;
  pipeline_kpi_1_value: number;
  pipeline_kpi_2_label: string;
  pipeline_kpi_2_value: number;
  
  quality_kpi_label: string;
  quality_kpi_value: number;
  
  blocker_1_description: string | null;
  blocker_1_decision_needed: string | null;
  blocker_2_description: string | null;
  blocker_2_decision_needed: string | null;
  blocker_3_description: string | null;
  blocker_3_decision_needed: string | null;
  
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type DailyLeaderScorecardInsert = Omit<DailyLeaderScorecard, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

/** Leader KPI Template */
export interface LeaderKPITemplate {
  id: string;
  workspace_id: string;
  leader_id: string;
  
  output_kpi_1_label: string;
  output_kpi_2_label: string;
  output_kpi_3_label: string;
  pipeline_kpi_1_label: string;
  pipeline_kpi_2_label: string;
  quality_kpi_label: string;
  
  created_at: string;
  updated_at: string;
}

export type LeaderKPITemplateInsert = Omit<LeaderKPITemplate, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

/** Weekly KR Tracking (run-rate) */
export interface WeeklyKRTracking {
  id: string;
  key_result_id: string;
  week_start: string;
  
  weekly_target: number;
  actual: number;
  achievement_pct: number;
  gap: number;
  remaining_weeks: number;
  catch_up_add: number;
  next_week_target: number;
  
  rag_status: "green" | "amber" | "red" | "black";
  
  notes: string | null;
  evidence_link: string | null;
  
  created_at: string;
  updated_at: string;
}

export type WeeklyKRTrackingInsert = Omit<WeeklyKRTracking, "id" | "created_at" | "updated_at" | "achievement_pct" | "gap"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

/** Monthly Performance Score */
export interface MonthlyPerformanceScore {
  id: string;
  workspace_id: string;
  leader_id: string;
  month_start: string;
  
  kr_delivery_score: number;
  pipeline_score: number;
  quality_score: number;
  discipline_score: number;
  total_score: number;
  
  red_weeks_count: number;
  black_events_count: number;
  scorecard_compliance_pct: number;
  
  has_black_event: boolean;
  
  created_at: string;
  updated_at: string;
}

export type MonthlyPerformanceScoreInsert = Omit<MonthlyPerformanceScore, "id" | "created_at" | "updated_at" | "total_score"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

/** Reward */
export interface Reward {
  id: string;
  workspace_id: string;
  leader_id: string;
  
  reward_type: "quarterly_bonus" | "esop_acceleration" | "winners_trip" | "founder_prize";
  quarter: string | null;
  month: string | null;
  
  amount: number | null;
  description: string | null;
  status: "pending" | "approved" | "paid" | "cancelled";
  
  created_at: string;
  updated_at: string;
}

export type RewardInsert = Omit<Reward, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

/** Penalty */
export interface Penalty {
  id: string;
  workspace_id: string;
  leader_id: string;
  
  penalty_type: "dri_removed" | "lop" | "privilege_removal" | "pip";
  trigger_reason: string;
  
  lop_days: number | null;
  kr_id: string | null;
  privilege_removed: string | null;
  removal_duration_days: number | null;
  pip_start_date: string | null;
  pip_end_date: string | null;
  pip_metrics: string | null;
  
  status: "active" | "completed" | "reversed";
  
  created_at: string;
  updated_at: string;
}

export type PenaltyInsert = Omit<Penalty, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

/** Support Request (SLA) */
export interface SupportRequest {
  id: string;
  workspace_id: string;
  
  requester_id: string;
  support_owner_id: string;
  kr_impacted_id: string | null;
  
  dependency_needed: string;
  due_date: string;
  evidence_required: string | null;
  impact_if_delayed: string | null;
  
  response_type: "delivered" | "committed" | "rejected" | null;
  response_evidence_link: string | null;
  response_committed_date: string | null;
  response_reject_reason: string | null;
  response_alternative: string | null;
  responded_at: string | null;
  
  sla_breached: boolean;
  status: "open" | "responded" | "closed";
  
  created_at: string;
  updated_at: string;
}

export type SupportRequestInsert = Omit<SupportRequest, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

/** Product */
export interface Product {
  id: string;
  workspace_id: string;
  owner_id: string | null;
  
  name: string;
  description: string | null;
  status: "development" | "beta" | "live" | "deprecated";
  
  created_at: string;
  updated_at: string;
}

export type ProductInsert = Omit<Product, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

/** Weekly Product Scorecard */
export interface WeeklyProductScorecard {
  id: string;
  product_id: string;
  week_start: string;
  
  release_shipped: boolean;
  features_shipped: number;
  
  active_orgs: number;
  active_users: number;
  sessions: number;
  activation_rate_pct: number;
  retention_pct: number;
  
  api_calls: number;
  
  pilot_count: number;
  paid_customers: number;
  revenue_booked: number;
  roi_captured: number;
  
  nps_csat: number | null;
  sev1_incidents: number;
  uptime_pct: number;
  mttr_hours: number;
  
  notes: string | null;
  evidence_link: string | null;
  
  created_at: string;
  updated_at: string;
}

export type WeeklyProductScorecardInsert = Omit<WeeklyProductScorecard, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};
