import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase-browser";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { keyResultService, okrService, weeklyKRScorecardService } from "@/services";
import { getWeekStartDate } from "@/services/weekly-kr-scorecards";
import { PageHeader } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { KeyResult, OKR, WeeklyKRScorecard } from "@/types";

export function WeeklyScorecardPage() {
  const { user } = useAuth();
  const { membership } = useProfile();
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [keyResultsLoaded, setKeyResultsLoaded] = useState(false);
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [scorecards, setScorecards] = useState<WeeklyKRScorecard[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const weekStart = getWeekStartDate();
  const isPending = membership?.status === "pending";

  useEffect(() => {
    if (!user) return;
    setKeyResultsLoaded(false);
    keyResultService
      .getKeyResults(supabase, { dri_id: user.id })
      .then((data) => {
        setKeyResults(data);
        setKeyResultsLoaded(true);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load");
        setKeyResultsLoaded(true);
      });
    okrService.getOkrs(supabase).then(setOkrs).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    weeklyKRScorecardService.getWeeklyKRScorecards(supabase, { dri_id: user.id, week_start: weekStart }).then(setScorecards).catch(() => setScorecards([]));
  }, [user?.id, weekStart]);

  const okrMap = new Map(okrs.map((o) => [o.id, o.title]));
  const scorecardByKr = new Map(scorecards.map((s) => [s.key_result_id, s]));

  async function saveKr(kr: KeyResult) {
    if (!user) return;
    const form = document.getElementById(`weekly-form-${kr.id}`) as HTMLFormElement;
    if (!form) return;
    const outputVal = (form.querySelector('[name="output_value"]') as HTMLInputElement)?.value;
    const pipelineVal = (form.querySelector('[name="pipeline_value"]') as HTMLInputElement)?.value;
    const qualityVal = (form.querySelector('[name="quality_value"]') as HTMLInputElement)?.value;
    const notesVal = (form.querySelector('[name="notes"]') as HTMLInputElement)?.value?.trim() || null;

    setSaving(kr.id);
    try {
      await weeklyKRScorecardService.upsertWeeklyKRScorecard(supabase, {
        key_result_id: kr.id,
        dri_id: user.id,
        week_start: weekStart,
        output_value: outputVal === "" ? null : Number(outputVal),
        pipeline_value: pipelineVal === "" ? null : Number(pipelineVal),
        quality_value: qualityVal === "" ? null : Number(qualityVal),
        notes: notesVal,
        blocker_decision_id: null,
      });
      const updated = await weeklyKRScorecardService.getWeeklyKRScorecards(supabase, { dri_id: user.id, week_start: weekStart });
      setScorecards(updated);
      toast.success(`Saved: ${kr.title}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(null);
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Weekly Scorecard" description="Your KR progress this week" />
        <p className="text-sm text-critical-foreground">{error}</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="space-y-6">
        <PageHeader title="Weekly Scorecard" description="Your KR progress this week" />
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-6 text-center">
          <p className="text-sm font-medium text-foreground">Your access is pending</p>
          <p className="mt-1 text-sm text-muted-foreground">Contact your admin to be accepted. Once accepted, you can submit weekly scorecards here.</p>
        </div>
      </div>
    );
  }

  if (keyResultsLoaded && keyResults.length === 0) {
    return <Navigate to="/workspace" replace />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly Scorecard"
        description={`Week of ${weekStart} — Report progress on key results you own (DRI).`}
      />
      {keyResults.length === 0 ? (
        <div className="min-h-[120px] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {keyResults.map((kr) => {
            const existing = scorecardByKr.get(kr.id);
            return (
              <form
                key={kr.id}
                id={`weekly-form-${kr.id}`}
                onSubmit={(e) => { e.preventDefault(); saveKr(kr); }}
                className="rounded-xl border border-border bg-card p-6 space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-foreground">{kr.title}</h3>
                    <p className="text-xs text-muted-foreground">{okrMap.get(kr.okr_id) ?? "OKR"}</p>
                  </div>
                  <Button type="submit" size="sm" disabled={saving === kr.id}>{saving === kr.id ? "Saving…" : "Save"}</Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Output value</Label>
                    <Input name="output_value" type="number" step="any" defaultValue={existing?.output_value ?? ""} placeholder="—" />
                  </div>
                  <div className="space-y-2">
                    <Label>Pipeline value</Label>
                    <Input name="pipeline_value" type="number" step="any" defaultValue={existing?.pipeline_value ?? ""} placeholder="—" />
                  </div>
                  <div className="space-y-2">
                    <Label>Quality value</Label>
                    <Input name="quality_value" type="number" step="any" defaultValue={existing?.quality_value ?? ""} placeholder="—" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input name="notes" defaultValue={existing?.notes ?? ""} placeholder="Optional notes for this week" />
                </div>
              </form>
            );
          })}
        </div>
      )}
    </div>
  );
}
