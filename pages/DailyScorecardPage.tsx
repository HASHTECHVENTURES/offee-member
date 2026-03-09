import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { workspaceService, userService, dailyLeaderScorecardService, leaderKPITemplateService } from "@/services";
import { getTodayDate } from "@/services/daily-leader-scorecards";
import { PageHeader } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { DailyLeaderScorecard, LeaderKPITemplate, UserProfile } from "@/types";

const DEFAULT_WORKSPACE_ID = "a0000000-0000-0000-0000-000000000001";

export function DailyScorecardPage() {
  const { user } = useAuth();
  const { profile, role, membership } = useProfile();
  const leaderRoleForTemplate = role?.name ?? profileFetched?.role ?? profile?.role ?? undefined;
  const [profileFetched, setProfileFetched] = useState<UserProfile | null>(null);
  const [template, setTemplate] = useState<LeaderKPITemplate | null>(null);
  const [existing, setExisting] = useState<DailyLeaderScorecard | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workspaceId = DEFAULT_WORKSPACE_ID;
  const today = getTodayDate();

  useEffect(() => {
    if (!user) return;
    userService.getProfileById(supabase, user.id).then(setProfileFetched).catch(() => setProfileFetched(null));
  }, [user]);

  const isPending = membership?.status === "pending";
  if (isPending) {
    return (
      <div className="space-y-6">
        <PageHeader title="Daily Scorecard" description="Submit your daily KPIs and blockers" />
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-6 text-center">
          <p className="text-sm font-medium text-foreground">Your access is pending</p>
          <p className="mt-1 text-sm text-muted-foreground">Contact your admin to be accepted. Once accepted, you can submit daily scorecards here.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!user) return;
    Promise.all([
      leaderKPITemplateService.getOrCreateTemplate(supabase, workspaceId, user.id, leaderRoleForTemplate),
      dailyLeaderScorecardService.getTodayScorecard(supabase, user.id),
    ])
      .then(([t, e]) => {
        setTemplate(t);
        setExisting(e);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [user?.id, workspaceId, leaderRoleForTemplate]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !template) return;
    const form = e.currentTarget;

    const getNum = (name: string) => {
      const v = (form.querySelector(`[name="${name}"]`) as HTMLInputElement)?.value;
      return v === "" ? 0 : Number(v);
    };
    const getStr = (name: string) => (form.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement)?.value?.trim() || null;

    setSaving(true);
    dailyLeaderScorecardService
      .upsertDailyScorecard(supabase, {
        workspace_id: workspaceId,
        leader_id: user.id,
        scorecard_date: today,
        output_kpi_1_label: template.output_kpi_1_label,
        output_kpi_1_value: getNum("output_kpi_1_value"),
        output_kpi_1_cumulative: null,
        output_kpi_2_label: template.output_kpi_2_label,
        output_kpi_2_value: getNum("output_kpi_2_value"),
        output_kpi_2_cumulative: null,
        output_kpi_3_label: template.output_kpi_3_label,
        output_kpi_3_value: getNum("output_kpi_3_value"),
        output_kpi_3_cumulative: null,
        pipeline_kpi_1_label: template.pipeline_kpi_1_label,
        pipeline_kpi_1_value: getNum("pipeline_kpi_1_value"),
        pipeline_kpi_2_label: template.pipeline_kpi_2_label,
        pipeline_kpi_2_value: getNum("pipeline_kpi_2_value"),
        quality_kpi_label: template.quality_kpi_label,
        quality_kpi_value: getNum("quality_kpi_value"),
        blocker_1_description: getStr("blocker_1_description"),
        blocker_1_decision_needed: getStr("blocker_1_decision_needed"),
        blocker_2_description: getStr("blocker_2_description"),
        blocker_2_decision_needed: getStr("blocker_2_decision_needed"),
        blocker_3_description: getStr("blocker_3_description"),
        blocker_3_decision_needed: getStr("blocker_3_decision_needed"),
        submitted_at: new Date().toISOString(),
      })
      .then((updated) => {
        setExisting(updated);
        toast.success("Daily scorecard saved");
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to save"))
      .finally(() => setSaving(false));
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Daily Scorecard" description="Submit your daily KPIs and blockers" />
        <p className="text-sm text-critical-foreground">{error}</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="space-y-6">
        <PageHeader title="Daily Scorecard" description="Submit your daily KPIs and blockers" />
        <div className="flex items-center justify-center py-12 text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Scorecard"
        description={`${today} — 3 outputs, 2 pipeline, 1 quality, 3 blockers`}
      />
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <h3 className="text-sm font-semibold text-foreground">Output KPIs</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{template.output_kpi_1_label}</Label>
              <Input name="output_kpi_1_value" type="number" step="any" defaultValue={existing?.output_kpi_1_value ?? 0} />
            </div>
            <div className="space-y-2">
              <Label>{template.output_kpi_2_label}</Label>
              <Input name="output_kpi_2_value" type="number" step="any" defaultValue={existing?.output_kpi_2_value ?? 0} />
            </div>
            <div className="space-y-2">
              <Label>{template.output_kpi_3_label}</Label>
              <Input name="output_kpi_3_value" type="number" step="any" defaultValue={existing?.output_kpi_3_value ?? 0} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <h3 className="text-sm font-semibold text-foreground">Pipeline KPIs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{template.pipeline_kpi_1_label}</Label>
              <Input name="pipeline_kpi_1_value" type="number" step="any" defaultValue={existing?.pipeline_kpi_1_value ?? 0} />
            </div>
            <div className="space-y-2">
              <Label>{template.pipeline_kpi_2_label}</Label>
              <Input name="pipeline_kpi_2_value" type="number" step="any" defaultValue={existing?.pipeline_kpi_2_value ?? 0} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Quality KPI</h3>
          <div className="space-y-2">
            <Label>{template.quality_kpi_label}</Label>
            <Input name="quality_kpi_value" type="number" step="any" defaultValue={existing?.quality_kpi_value ?? 0} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Top 3 blockers</h3>
          {[1, 2, 3].map((i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Blocker {i} — Description</Label>
                <Input name={`blocker_${i}_description`} placeholder="What is blocked?" defaultValue={i === 1 ? (existing?.blocker_1_description ?? "") : i === 2 ? (existing?.blocker_2_description ?? "") : (existing?.blocker_3_description ?? "")} />
              </div>
              <div className="space-y-1">
                <Label>Decision needed</Label>
                <Input name={`blocker_${i}_decision_needed`} placeholder="What decision?" defaultValue={i === 1 ? (existing?.blocker_1_decision_needed ?? "") : i === 2 ? (existing?.blocker_2_decision_needed ?? "") : (existing?.blocker_3_decision_needed ?? "")} />
              </div>
            </div>
          ))}
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Submit scorecard"}
        </Button>
      </form>
    </div>
  );
}
