import type { SupabaseClient } from "@supabase/supabase-js";
import * as okrService from "@/services/okrs";
import * as keyResultService from "@/services/key-results";
import * as decisionService from "@/services/decisions";
import * as dailyScorecardService from "@/services/daily-scorecards";

export interface ExecutionSnapshot {
  okrs: Array<{
    id: string;
    title: string;
    status: string;
    progress_percent: number;
    quarter: string | null;
    year: number | null;
  }>;
  keyResults: Array<{
    id: string;
    okr_id: string;
    title: string;
    target_value: number;
    current_value: number;
    status: string;
    unit: string | null;
  }>;
  decisions: Array<{
    id: string;
    title: string;
    status: string;
    due_date: string | null;
    decided_at: string | null;
  }>;
  dailyScorecards: Array<{
    submitted_at: string;
    output_kpi_1: number | null;
    output_kpi_2: number | null;
    output_kpi_3: number | null;
    pipeline_kpi_1: number | null;
    pipeline_kpi_2: number | null;
    quality_kpi_1: number | null;
    blockers: string | null;
  }>;
  asOf: string;
}

export async function gatherExecutionData(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<ExecutionSnapshot> {
  const [okrs, keyResults, decisions, dailyScorecards] = await Promise.all([
    okrService.getOkrs(supabase, { workspace_id: workspaceId }),
    keyResultService.getKeyResults(supabase),
    decisionService.getDecisions(supabase, { workspace_id: workspaceId }),
    dailyScorecardService.getDailyScorecards(supabase, {
      workspace_id: workspaceId,
      from: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    }),
  ]);

  const krFiltered = keyResults.filter((kr) =>
    okrs.some((o) => o.id === kr.okr_id)
  );

  return {
    okrs: okrs.map((o) => ({
      id: o.id,
      title: o.title,
      status: o.status,
      progress_percent: o.progress_percent,
      quarter: o.quarter,
      year: o.year,
    })),
    keyResults: krFiltered.map((kr) => ({
      id: kr.id,
      okr_id: kr.okr_id,
      title: kr.title,
      target_value: kr.target_value,
      current_value: kr.current_value,
      status: kr.status,
      unit: kr.unit,
    })),
    decisions: decisions.map((d) => ({
      id: d.id,
      title: d.title,
      status: d.status,
      due_date: d.due_date,
      decided_at: d.decided_at,
    })),
    dailyScorecards: dailyScorecards.map((s) => ({
      submitted_at: s.submitted_at,
      output_kpi_1: s.output_kpi_1,
      output_kpi_2: s.output_kpi_2,
      output_kpi_3: s.output_kpi_3,
      pipeline_kpi_1: s.pipeline_kpi_1,
      pipeline_kpi_2: s.pipeline_kpi_2,
      quality_kpi_1: s.quality_kpi_1,
      blockers: s.blockers,
    })),
    asOf: new Date().toISOString(),
  };
}
