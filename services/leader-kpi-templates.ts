import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeaderKPITemplate, LeaderKPITemplateInsert } from "@/types";

const TABLE = "leader_kpi_templates";

// Pre-defined KPI templates for Offee leaders
export const DEFAULT_LEADER_KPIS: Record<string, Omit<LeaderKPITemplateInsert, "workspace_id" | "leader_id">> = {
  "CEO": {
    output_kpi_1_label: "Investor calls completed",
    output_kpi_2_label: "Bridge ₹ committed today",
    output_kpi_3_label: "Govt senior meetings done",
    pipeline_kpi_1_label: "New investors added to pipeline",
    pipeline_kpi_2_label: "Next-step meetings scheduled",
    quality_kpi_label: "Decision turnaround time (avg hrs)",
  },
  "Strategy/Investment": {
    output_kpi_1_label: "Investors moved stage today",
    output_kpi_2_label: "Investor narrative docs updated",
    output_kpi_3_label: "Internal standups run",
    pipeline_kpi_1_label: "Investor follow-ups sent",
    pipeline_kpi_2_label: "Partner-level meetings scheduled",
    quality_kpi_label: "Investors stuck >14 days",
  },
  "Business/Partnerships": {
    output_kpi_1_label: "Booked revenue signed today (₹Cr)",
    output_kpi_2_label: "Partner meetings done",
    output_kpi_3_label: "Govt advanced meetings done",
    pipeline_kpi_1_label: "Pipeline created today (₹Cr)",
    pipeline_kpi_2_label: "Pipeline progressed today (₹Cr)",
    quality_kpi_label: "Follow-ups overdue >48h",
  },
  "Direct Sales": {
    output_kpi_1_label: "Contracts signed today",
    output_kpi_2_label: "Proposals sent today",
    output_kpi_3_label: "Booked revenue today (₹Cr)",
    pipeline_kpi_1_label: "Qualified leads added",
    pipeline_kpi_2_label: "Demos completed",
    quality_kpi_label: "Win-rate (last 10 deals) %",
  },
  "Finance": {
    output_kpi_1_label: "Collections received today (₹L)",
    output_kpi_2_label: "Invoices raised today (₹L)",
    output_kpi_3_label: "Compliance tasks closed today",
    pipeline_kpi_1_label: "Expected collections next 14 days (₹Cr)",
    pipeline_kpi_2_label: "Overdue receivables (₹Cr)",
    quality_kpi_label: "DSO (days)",
  },
  "Ops/Delivery": {
    output_kpi_1_label: "Tests completed today",
    output_kpi_2_label: "Passports issued today",
    output_kpi_3_label: "Issuers live added today",
    pipeline_kpi_1_label: "Scheduled tests next 7 days",
    pipeline_kpi_2_label: "Issuers onboarding in progress",
    quality_kpi_label: "Valid attempts % today",
  },
  "CTO/Product": {
    output_kpi_1_label: "Releases shipped today",
    output_kpi_2_label: "MVP milestones closed today",
    output_kpi_3_label: "Critical bugs closed today",
    pipeline_kpi_1_label: "Upcoming releases (next 7 days)",
    pipeline_kpi_2_label: "Open P1 bugs",
    quality_kpi_label: "Uptime last 24h %",
  },
  "Infra/Security": {
    output_kpi_1_label: "Infra incidents resolved today",
    output_kpi_2_label: "IoT devices prepared today",
    output_kpi_3_label: "Security controls implemented today",
    pipeline_kpi_1_label: "Upcoming deployments supported (7 days)",
    pipeline_kpi_2_label: "Pending infra changes",
    quality_kpi_label: "Uptime last 24h %",
  },
  "Research/Assessment": {
    output_kpi_1_label: "Data quality checks run today",
    output_kpi_2_label: "Valid attempts % improved today",
    output_kpi_3_label: "Content items updated today",
    pipeline_kpi_1_label: "Languages in progress",
    pipeline_kpi_2_label: "Pilots needing ROI data",
    quality_kpi_label: "Valid attempts % overall",
  },
  "Marketing": {
    output_kpi_1_label: "Content shipped today",
    output_kpi_2_label: "Leads generated today",
    output_kpi_3_label: "Qualified meetings booked today",
    pipeline_kpi_1_label: "Pipeline influenced today (₹L)",
    pipeline_kpi_2_label: "Event/webinar registrations",
    quality_kpi_label: "Engagement rate (avg) %",
  },
  "Customer Success": {
    output_kpi_1_label: "Customers onboarded/go-live today",
    output_kpi_2_label: "Renewals closed today (₹L)",
    output_kpi_3_label: "Support tickets closed today",
    pipeline_kpi_1_label: "Renewals due in 60 days (₹L)",
    pipeline_kpi_2_label: "At-risk accounts",
    quality_kpi_label: "Avg ticket resolution time (hrs)",
  },
  "HR": {
    output_kpi_1_label: "Interviews completed today",
    output_kpi_2_label: "Offers rolled today",
    output_kpi_3_label: "Performance system docs closed today",
    pipeline_kpi_1_label: "Open roles",
    pipeline_kpi_2_label: "Candidates in final round",
    quality_kpi_label: "Offer-to-join ratio (rolling) %",
  },
  "Founder Office": {
    output_kpi_1_label: "Daily scorecards received on time",
    output_kpi_2_label: "Overdue actions closed today",
    output_kpi_3_label: "Meeting briefs delivered today",
    pipeline_kpi_1_label: "Decisions pending approval",
    pipeline_kpi_2_label: "Upcoming key meetings (next 7 days)",
    quality_kpi_label: "Missing numbers count",
  },
};

export async function getTemplates(
  supabase: SupabaseClient,
  filters?: { workspace_id?: string; leader_id?: string }
) {
  let query = supabase.from(TABLE).select("*");
  if (filters?.workspace_id) query = query.eq("workspace_id", filters.workspace_id);
  if (filters?.leader_id) query = query.eq("leader_id", filters.leader_id);

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load KPI templates");
  return (data ?? []) as LeaderKPITemplate[];
}

export async function getOrCreateTemplate(
  supabase: SupabaseClient,
  workspaceId: string,
  leaderId: string,
  leaderRole?: string
): Promise<LeaderKPITemplate> {
  const existing = await supabase
    .from(TABLE)
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("leader_id", leaderId)
    .maybeSingle();

  if (existing.data) return existing.data as LeaderKPITemplate;

  const defaults = leaderRole && DEFAULT_LEADER_KPIS[leaderRole]
    ? DEFAULT_LEADER_KPIS[leaderRole]
    : DEFAULT_LEADER_KPIS["Founder Office"];

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      workspace_id: workspaceId,
      leader_id: leaderId,
      ...defaults,
    })
    .select()
    .single();

  if (error) throw new Error(error.message ?? "Failed to create KPI template");
  return data as LeaderKPITemplate;
}

export async function updateTemplate(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<LeaderKPITemplateInsert>
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message ?? "Failed to update KPI template");
  return data as LeaderKPITemplate;
}
