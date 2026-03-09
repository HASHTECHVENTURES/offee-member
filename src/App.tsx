import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";
import { getIsAppAdmin } from "@/lib/role-utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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

function DefaultRedirect() {
  const { profile, role, loading } = useProfile();
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  const isAppAdmin = getIsAppAdmin(role, profile);
  return <Navigate to={isAppAdmin ? "/admin" : "/workspace"} replace />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/" element={<ProtectedRoute><ProfileProvider><ErrorBoundary><DashboardLayout /></ErrorBoundary></ProfileProvider></ProtectedRoute>}>
          <Route index element={<DefaultRedirect />} />
          <Route path="workspace" element={<WorkspacePage />} />
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
