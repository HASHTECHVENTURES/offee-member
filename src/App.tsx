import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";
import { getDefaultHomeForRole, getAppRolePortal, ROLE_HOME_PATHS } from "@/lib/role-utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PortalGuard } from "@/components/layout/PortalGuard";
import { LoginPage } from "@/pages/LoginPage";
import { WorkspacePage } from "@/pages/WorkspacePage";
import { DailyScorecardPage } from "@/pages/DailyScorecardPage";
import { WeeklyScorecardPage } from "@/pages/WeeklyScorecardPage";
import { DecisionsPage } from "@/pages/DecisionsPage";
import { DecisionDetailPage } from "@/pages/DecisionDetailPage";
import { OKRsPage } from "@/pages/OKRsPage";
import { KeyResultsPage } from "@/pages/KeyResultsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { AdminPanelPage } from "@/pages/AdminPanelPage";
import { TeamPage } from "@/pages/TeamPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

/** One authentication gate → redirect to role-specific home (or portal home when 4-website mode). */
function DefaultRedirect() {
  const portal = getAppRolePortal();
  const { profile, role, loading } = useProfile();
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  const home = portal ? ROLE_HOME_PATHS[portal] : getDefaultHomeForRole(role, profile);
  return <Navigate to={home} replace />;
}

/** /workspace → redirect to the role-specific link (or portal home in 4-website mode). */
function WorkspaceRedirect() {
  const portal = getAppRolePortal();
  const { profile, role, loading } = useProfile();
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  const home = portal ? ROLE_HOME_PATHS[portal] : getDefaultHomeForRole(role, profile);
  return <Navigate to={home} replace />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/login/admin" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/login/ceo" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/login/leader" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/login/member" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/login/hr" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/" element={<ProtectedRoute><ProfileProvider><ErrorBoundary><PortalGuard><DashboardLayout /></PortalGuard></ErrorBoundary></ProfileProvider></ProtectedRoute>}>
          <Route index element={<DefaultRedirect />} />
          <Route path="workspace" element={<WorkspaceRedirect />} />
          <Route path="ceo" element={<WorkspacePage />} />
          <Route path="leader" element={<WorkspacePage />} />
          <Route path="member" element={<WorkspacePage />} />
          <Route path="hr" element={<WorkspacePage />} />
          <Route path="daily-scorecard" element={<DailyScorecardPage />} />
          <Route path="scorecards" element={<WeeklyScorecardPage />} />
          <Route path="decisions" element={<DecisionsPage />} />
          <Route path="decisions/:id" element={<DecisionDetailPage />} />
          <Route path="okrs" element={<OKRsPage />} />
          <Route path="key-results" element={<KeyResultsPage />} />
          <Route path="support-sla" element={<PlaceholderPage title="Support SLA" />} />
          <Route path="products" element={<PlaceholderPage title="Products" />} />
          <Route path="teams" element={<PlaceholderPage title="Teams" />} />
          <Route path="kras" element={<PlaceholderPage title="KRAs" />} />
          <Route path="quarters" element={<PlaceholderPage title="Quarters" />} />
          <Route path="leader-performance" element={<PlaceholderPage title="Leader Performance" />} />
          <Route path="audit-log" element={<PlaceholderPage title="Audit Log" />} />
          <Route path="notifications" element={<PlaceholderPage title="Notifications" />} />
          <Route path="activity" element={<PlaceholderPage title="Activity" />} />
          <Route path="admin" element={<AdminPanelPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}
