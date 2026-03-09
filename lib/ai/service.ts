import { createClient } from "@/lib/supabase/server";
import { getGeminiFlashModel } from "@/lib/gemini";
import * as aiReportService from "@/services/ai-reports";
import { gatherExecutionData } from "./execution-data";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * ONE_DAY_MS;

function getCacheTtlMs(reportType: AIReportType): number {
  return reportType === "weekly_analysis" ? ONE_WEEK_MS : ONE_DAY_MS;
}

export type AIReportType = "ceo_dashboard" | "weekly_analysis" | "risk_alerts" | "followups";

async function generateWithGemini(
  reportType: AIReportType,
  dataJson: string
): Promise<{ content: string; title: string }> {
  const prompts: Record<AIReportType, string> = {
    ceo_dashboard: `You are an execution analyst. Based on the following execution data, produce a concise CEO dashboard summary (3-5 bullet points). Focus on: overall progress, top risks, key decisions pending, and recommended actions. Use clear, executive language. Output only the summary, no preamble.\n\nExecution data (JSON):\n${dataJson}`,
    weekly_analysis: `You are an OKR analyst. Based on the following execution data, produce a brief weekly OKR analysis. Include: progress vs targets, which OKRs/KRs are on track vs at risk, and one paragraph of insights. Output only the analysis, no preamble.\n\nExecution data (JSON):\n${dataJson}`,
    risk_alerts: `You are a risk analyst. Based on the following execution data, list risk alerts: overdue decisions, KRs behind target, OKRs at risk. For each alert give: title, severity (high/medium/low), and recommended action. Output only the list, no preamble.\n\nExecution data (JSON):\n${dataJson}`,
    followups: `You are an execution coach. Based on the following execution data, generate follow-up reminders: decisions due soon, OKRs needing attention, KRs with no recent progress, and suggested next actions. Output only the reminders list, no preamble.\n\nExecution data (JSON):\n${dataJson}`,
  };

  const model = getGeminiFlashModel();
  const result = await model.generateContent(prompts[reportType]);
  const response = result.response;
  const text = response.text();

  const titles: Record<AIReportType, string> = {
    ceo_dashboard: "CEO Dashboard",
    weekly_analysis: "Weekly OKR Analysis",
    risk_alerts: "Risk Alerts",
    followups: "Follow-up Reminders",
  };

  return { content: text ?? "", title: titles[reportType] };
}

export async function getOrGenerateReport(
  workspaceId: string,
  reportType: AIReportType
): Promise<{ content: string; title: string; cached: boolean }> {
  const supabase = await createClient();
  const maxAge = getCacheTtlMs(reportType);

  const cached = await aiReportService.getLatestCachedReport(
    supabase,
    workspaceId,
    reportType,
    maxAge
  );

  if (cached?.content) {
    return {
      content: cached.content,
      title: cached.title,
      cached: true,
    };
  }

  const snapshot = await gatherExecutionData(supabase, workspaceId);
  const dataJson = JSON.stringify(snapshot, null, 2);
  const { content, title } = await generateWithGemini(reportType, dataJson);

  await aiReportService.createAIReport(supabase, {
    workspace_id: workspaceId,
    report_type: reportType,
    title,
    content,
    metadata: { asOf: snapshot.asOf },
  });

  return { content, title, cached: false };
}
