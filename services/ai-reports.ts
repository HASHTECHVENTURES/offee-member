import type { SupabaseClient } from "@supabase/supabase-js";
import type { AIReport, AIReportInsert } from "@/types";

const TABLE = "ai_reports";

export async function getAIReports(
  supabase: SupabaseClient,
  filters?: { workspace_id?: string; report_type?: string }
) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("generated_at", { ascending: false });

  if (filters?.workspace_id) {
    query = query.eq("workspace_id", filters.workspace_id);
  }
  if (filters?.report_type) {
    query = query.eq("report_type", filters.report_type);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load AI reports");
  return (data ?? []) as AIReport[];
}

export async function getAIReportById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) throw new Error(error.message ?? "Failed to load AI report");
  return data as AIReport;
}

export async function createAIReport(
  supabase: SupabaseClient,
  payload: AIReportInsert
) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      ...payload,
      generated_at: payload.generated_at ?? new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create AI report");
  return data as AIReport;
}

export async function deleteAIReport(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message ?? "Failed to delete AI report");
}

/** Get latest cached report by type and workspace; returns null if none or stale. */
export async function getLatestCachedReport(
  supabase: SupabaseClient,
  workspaceId: string,
  reportType: string,
  maxAgeMs: number
): Promise<AIReport | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("report_type", reportType)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message ?? "Failed to load cached report");
  if (!data) return null;
  const report = data as AIReport;
  const generatedAt = new Date(report.generated_at).getTime();
  if (Date.now() - generatedAt > maxAgeMs) return null;
  return report;
}
