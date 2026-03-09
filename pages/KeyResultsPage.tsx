import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase-browser";
import { useProfile } from "@/contexts/ProfileContext";
import { getCanManageKeyResults } from "@/lib/role-utils";
import { keyResultService, okrService, userService } from "@/services";
import { PageHeader } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { KeyResultsTable, type KeyResultRow } from "@/components/features/key-results/key-results-table";
import { CreateKeyResultDialog } from "@/components/features/key-results/create-key-result-dialog";
import type { KeyResult, OKR, UserProfile } from "@/types";
import { Plus } from "lucide-react";

const DEFAULT_WORKSPACE_ID = "a0000000-0000-0000-0000-000000000001";

export function KeyResultsPage() {
  const { profile, role } = useProfile();
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManage = getCanManageKeyResults(role, profile);
  if (profile && !canManage) {
    return <Navigate to="/workspace" replace />;
  }

  function load() {
    Promise.all([
      keyResultService.getKeyResults(supabase),
      okrService.getOkrs(supabase, { workspace_id: DEFAULT_WORKSPACE_ID }),
      userService.getProfiles(supabase),
    ])
      .then(([k, o, p]) => {
        setKeyResults(k);
        setOkrs(o);
        setProfiles(p);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }

  useEffect(() => {
    load();
  }, []);

  const okrMap = new Map(okrs.map((o) => [o.id, o.title]));
  const profileMap = new Map(profiles.map((p) => [p.id, p.full_name ?? p.email]));
  const rows: KeyResultRow[] = keyResults.map((kr) => ({
    ...kr,
    okrTitle: okrMap.get(kr.okr_id) ?? null,
    driName: kr.dri_id ? profileMap.get(kr.dri_id) ?? null : null,
  }));

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Key Results" description="Measurable outcomes for each OKR" />
        <p className="text-sm text-critical-foreground">{error}</p>
        <Button variant="outline" onClick={() => load()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Key Results"
        description="Track progress on each key result."
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)} disabled={okrs.length === 0}>
            <Plus className="size-4" />
            Add key result
          </Button>
        }
      />
      <KeyResultsTable rows={rows} />
      <CreateKeyResultDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) load();
        }}
        okrs={okrs}
        profiles={profiles}
      />
    </div>
  );
}
