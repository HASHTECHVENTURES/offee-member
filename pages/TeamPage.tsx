import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { useProfile } from "@/contexts/ProfileContext";
import { workspaceMemberService } from "@/services";
import { PageHeader } from "@/components/design-system";
import type { MemberWithProfile } from "@/types";
import { Users } from "lucide-react";

export function TeamPage() {
  const { workspaceId } = useProfile();
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    workspaceMemberService
      .getMembersWithProfilesAndRoles(supabase, workspaceId)
      .then(setMembers)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load team"));
  }, [workspaceId]);

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Team" description="Everyone in your workspace" />
        <p className="text-sm text-critical-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Everyone in your workspace. You're all interconnected—same OKRs, same decision log."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-border bg-card p-4 flex items-center gap-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {(m.profile?.full_name ?? m.profile?.email ?? "?")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">
                {m.profile?.full_name ?? "—"}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {m.profile?.email ?? m.user_id}
              </p>
              {m.roleRecord && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {m.roleRecord.name}
                  {(m.status ?? "active") === "pending" && " · Pending"}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {members.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <Users className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No team members yet.</p>
        </div>
      )}
    </div>
  );
}
