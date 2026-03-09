import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase-browser";
import { useProfile } from "@/contexts/ProfileContext";
import { getCanManageOKRs } from "@/lib/role-utils";
import { workspaceService, userService, okrService, keyResultService } from "@/services";
import { PageHeader } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { OKRCard } from "@/components/features/okrs/okr-card";
import { CreateOKRDialog } from "@/components/features/okrs/create-okr-dialog";
import type { OKR, Workspace, UserProfile, KeyResult } from "@/types";
import { Plus } from "lucide-react";

const DEFAULT_WORKSPACE_ID = "a0000000-0000-0000-0000-000000000001";

export function OKRsPage() {
  const { profile, role } = useProfile();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManage = getCanManageOKRs(role, profile);
  if (profile && !canManage) {
    return <Navigate to="/workspace" replace />;
  }

  function load() {
    Promise.all([
      workspaceService.getWorkspaces(supabase),
      userService.getProfiles(supabase),
      okrService.getOkrs(supabase, { workspace_id: DEFAULT_WORKSPACE_ID }),
      keyResultService.getKeyResults(supabase),
    ])
      .then(([w, p, o, k]) => {
        setWorkspaces(w);
        setProfiles(p);
        setOkrs(o);
        setKeyResults(k);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }

  useEffect(() => {
    load();
  }, []);

  const profileMap = new Map(profiles.map((p) => [p.id, p.full_name ?? p.email]));
  const krCountByOkr = keyResults.reduce<Record<string, number>>((acc, kr) => {
    acc[kr.okr_id] = (acc[kr.okr_id] ?? 0) + 1;
    return acc;
  }, {});

  const workspacesList = workspaces.length > 0 ? workspaces : [{ id: DEFAULT_WORKSPACE_ID, name: "Test Workspace", slug: "test", created_at: "", updated_at: "" }];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="OKRs" description="Objectives and key results" />
        <p className="text-sm text-critical-foreground">{error}</p>
        <Button variant="outline" onClick={() => load()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="OKRs"
        description="Company objectives and key results."
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add OKR
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {okrs.map((okr) => (
          <OKRCard
            key={okr.id}
            okr={okr}
            ownerName={okr.owner_id ? profileMap.get(okr.owner_id) ?? null : null}
            krCount={krCountByOkr[okr.id] ?? 0}
          />
        ))}
      </div>
      {okrs.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-sm text-muted-foreground">No OKRs yet.</p>
          <Button variant="outline" className="mt-3" onClick={() => setCreateOpen(true)}>Create your first OKR</Button>
        </div>
      )}
      <CreateOKRDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) load();
        }}
        workspaces={workspacesList}
        profiles={profiles}
      />
    </div>
  );
}
