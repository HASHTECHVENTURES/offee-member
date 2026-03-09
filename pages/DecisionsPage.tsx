import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { workspaceService, userService, keyResultService, decisionService } from "@/services";
import { PageHeader } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { DecisionsTable, type DecisionRow } from "@/components/features/decisions/decisions-table";
import { CreateDecisionDialog } from "@/components/features/decisions/create-decision-dialog";
import type { Workspace, UserProfile, KeyResult, Decision } from "@/types";
import { Plus } from "lucide-react";

const DEFAULT_WORKSPACE_ID = "a0000000-0000-0000-0000-000000000001";

export function DecisionsPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workspaceId = workspaces[0]?.id ?? DEFAULT_WORKSPACE_ID;

  function load() {
    Promise.all([
      workspaceService.getWorkspaces(supabase),
      userService.getProfiles(supabase),
      keyResultService.getKeyResults(supabase),
      decisionService.getDecisions(supabase, { workspace_id: DEFAULT_WORKSPACE_ID }),
    ])
      .then(([w, p, k, d]) => {
        setWorkspaces(w);
        setProfiles(p);
        setKeyResults(k);
        setDecisions(d);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }

  useEffect(() => {
    load();
  }, []);

  const profileMap = new Map(profiles.map((p) => [p.id, p.full_name ?? p.email]));
  const krMap = new Map(keyResults.map((kr) => [kr.id, kr.title]));
  const rows: DecisionRow[] = decisions.map((d) => ({
    ...d,
    ownerName: d.decided_by ? profileMap.get(d.decided_by) ?? null : null,
    krImpactedTitle: d.kr_impacted_id ? krMap.get(d.kr_impacted_id) ?? null : null,
  }));

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Decisions" description="Decision log and escalations" />
        <p className="text-sm text-critical-foreground">{error}</p>
        <Button variant="outline" onClick={() => load()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Decisions"
        description="Log decisions, assign owners, and track due dates."
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Log decision
          </Button>
        }
      />
      <DecisionsTable decisions={rows} />
      <CreateDecisionDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) load();
        }}
        workspaces={workspaces.length > 0 ? workspaces : [{ id: DEFAULT_WORKSPACE_ID, name: "Test Workspace", slug: "test", created_at: "", updated_at: "" }]}
        profiles={profiles}
        keyResults={keyResults}
      />
    </div>
  );
}
