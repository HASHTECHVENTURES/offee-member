import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { getAppRolePortal, getLoginPathForRole } from "@/lib/role-utils";
import { PageHeader } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { profile, role } = useProfile();
  const navigate = useNavigate();
  const roleDisplay = role?.name ?? profile?.role ?? null;
  const portal = getAppRolePortal();

  async function handleSignOut() {
    await signOut();
    const loginPath = portal ? "/login" : getLoginPathForRole(role, profile);
    navigate(loginPath, { replace: true });
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Your account and preferences" />
      <div className="rounded-xl border border-border bg-card p-6 max-w-md space-y-6">
        <h3 className="text-sm font-semibold text-foreground">Profile</h3>
        <div className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">Name</span><br /><span className="text-foreground">{profile?.full_name ?? "—"}</span></div>
          <div><span className="text-muted-foreground">Email</span><br /><span className="text-foreground">{user?.email ?? "—"}</span></div>
          {roleDisplay && (
            <div><span className="text-muted-foreground">Role</span><br /><span className="text-foreground">{roleDisplay}</span></div>
          )}
        </div>
        <Button variant="outline" onClick={handleSignOut} className="gap-2">
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
