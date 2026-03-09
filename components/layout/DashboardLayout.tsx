import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { AppShell } from "@/components/layout/app-shell";
import { SidebarClient } from "@/components/layout/sidebar-client";

export function DashboardLayout() {
  const { user } = useAuth();
  const { profile } = useProfile();

  const displayName = profile?.full_name ?? null;
  const email = user?.email ?? null;

  const sidebar = (
    <SidebarClient
      displayName={displayName}
      email={email}
    />
  );

  return (
    <AppShell sidebar={sidebar}>
      <Outlet />
    </AppShell>
  );
}
