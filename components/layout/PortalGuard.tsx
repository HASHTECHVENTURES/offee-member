import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { getAppRolePortal, ROLE_LOGIN_PATHS } from "@/lib/role-utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PORTAL_LABELS: Record<string, string> = {
  admin: "Admin",
  ceo: "CEO",
  leader: "Leader",
  member: "Member",
  hr: "HR",
};

/**
 * When VITE_APP_ROLE is set (4-website mode), only that role can use this deployment.
 * Others see "Wrong portal" and can sign out.
 */
export function PortalGuard({ children }: { children: React.ReactNode }) {
  const portal = getAppRolePortal();
  const { role, loading } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  if (!portal || loading) {
    return <>{children}</>;
  }

  const userSlug = role?.slug ?? null;
  if (userSlug === portal) {
    return <>{children}</>;
  }

  const portalLabel = PORTAL_LABELS[portal] ?? portal;
  const userLabel = userSlug ? (PORTAL_LABELS[userSlug] ?? userSlug) : "unknown";

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Wrong portal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is the <strong>{portalLabel}</strong> portal. You’re signed in as <strong>{userLabel}</strong>.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign out and open your role’s link to continue.
        </p>
        <Button onClick={handleSignOut} className="mt-6">
          Sign out
        </Button>
      </div>
    </div>
  );
}
