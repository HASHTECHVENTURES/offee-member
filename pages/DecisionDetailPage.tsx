import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase-browser";
import { decisionService, workspaceService, userService, keyResultService } from "@/services";
import { getDecisionEscalation } from "@/utils/decision-escalation";
import { PageHeader } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { EditDecisionDialog } from "@/components/features/decisions/edit-decision-dialog";
import type { Decision, Workspace, UserProfile, KeyResult } from "@/types";
import { ArrowLeft } from "lucide-react";

const DEFAULT_WORKSPACE_ID = "a0000000-0000-0000-0000-000000000001";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const STATUS_LABELS: Record<Decision["status"], string> = {
  open: "Open",
  decided: "Decided",
  archived: "Archived",
};

export function DecisionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    decisionService.getDecisionById(supabase, id).then(setDecision).catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [id]);

  useEffect(() => {
    Promise.all([
      workspaceService.getWorkspaces(supabase),
      userService.getProfiles(supabase),
      keyResultService.getKeyResults(supabase),
    ]).then(([w, p, k]) => {
      setWorkspaces(w);
      setProfiles(p);
      setKeyResults(k);
    }).catch(() => {});
  }, []);

  const ownerName = decision?.decided_by ? profiles.find((p) => p.id === decision.decided_by)?.full_name ?? profiles.find((p) => p.id === decision.decided_by)?.email ?? "—" : "—";
  const krTitle = decision?.kr_impacted_id ? keyResults.find((k) => k.id === decision.kr_impacted_id)?.title ?? "—" : "—";
  const escalation = decision ? getDecisionEscalation(decision.status, decision.due_date) : null;

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/decisions"><ArrowLeft className="size-4" /> Back to decisions</Link>
        </Button>
        <PageHeader title="Decision" description={error} />
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/decisions"><ArrowLeft className="size-4" /> Back</Link>
        </Button>
        <PageHeader title="Decision" description="Loading…" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/decisions"><ArrowLeft className="size-4" /> Back</Link>
        </Button>
      </div>
      <PageHeader
        title={decision.title}
        description={`${STATUS_LABELS[decision.status]}${decision.due_date ? ` · Due ${formatDate(decision.due_date)}` : ""}${escalation?.isOverdue ? ` · ${escalation.daysOverdue}d overdue` : ""}`}
        actions={
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
        }
      />
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        {decision.context && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Context</h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">{decision.context}</p>
          </div>
        )}
        {decision.outcome && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Outcome</h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">{decision.outcome}</p>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div><span className="text-muted-foreground">Owner</span><br />{ownerName}</div>
          <div><span className="text-muted-foreground">KR impacted</span><br />{krTitle}</div>
          <div><span className="text-muted-foreground">Due date</span><br />{formatDate(decision.due_date)}</div>
          <div><span className="text-muted-foreground">Status</span><br />{STATUS_LABELS[decision.status]}</div>
          {decision.evidence_link && (
            <div className="sm:col-span-2">
              <span className="text-muted-foreground">Evidence</span><br />
              <a href={decision.evidence_link} target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">{decision.evidence_link}</a>
            </div>
          )}
        </div>
      </div>
      <EditDecisionDialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open && id) decisionService.getDecisionById(supabase, id).then(setDecision).catch(() => {});
        }}
        decision={decision}
        workspaces={workspaces.length > 0 ? workspaces : [{ id: DEFAULT_WORKSPACE_ID, name: "Test Workspace", slug: "test", created_at: "", updated_at: "" }]}
        profiles={profiles}
        keyResults={keyResults}
      />
    </div>
  );
}
