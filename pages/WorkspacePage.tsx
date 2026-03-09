import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase-browser";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { getIsAppAdmin, getIsCEO } from "@/lib/role-utils";
import {
  okrService,
  keyResultService,
  decisionService,
  userService,
  dailyLeaderScorecardService,
} from "@/services";
import { getDecisionEscalation } from "@/utils/decision-escalation";
import { getKeyResultProgressStatus } from "@/utils/key-result-status";
import { PageHeader, StatGrid, ProgressBar, AlertCard } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Users, CheckCircle2, ClipboardCheck, Gauge, MessageSquare } from "lucide-react";
import type { OKR, KeyResult, Decision, UserProfile } from "@/types";

const DEFAULT_WORKSPACE_ID = "a0000000-0000-0000-0000-000000000001";

export function WorkspacePage() {
  const { user } = useAuth();
  const { profile, role } = useProfile();
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [myDailySubmitted, setMyDailySubmitted] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAppAdmin = getIsAppAdmin(role, profile);
  const isCEO = getIsCEO(role);
  const isHR = role?.slug === "hr";
  const pageTitle = isCEO ? "CEO Dashboard" : isHR ? "HR Dashboard" : "My Dashboard";
  const pageDescription = isCEO
    ? "Company-wide OKRs, key results, and decision log."
    : isHR
      ? "Hiring pipeline, performance system, and execution culture. Daily scorecard and decisions."
      : "Your scorecards, key results you own, and decisions assigned to you.";

  useEffect(() => {
    if (isAppAdmin) return;
    (async () => {
      try {
        const [o, k, d, p] = await Promise.all([
          okrService.getOkrs(supabase),
          keyResultService.getKeyResults(supabase),
          decisionService.getDecisions(supabase, { workspace_id: DEFAULT_WORKSPACE_ID }),
          userService.getProfiles(supabase),
        ]);
        setOkrs(o);
        setKeyResults(k);
        setDecisions(d);
        setProfiles(p);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      }
    })();
  }, [isAppAdmin]);

  useEffect(() => {
    if (isAppAdmin || !user || isCEO) return;
    dailyLeaderScorecardService
      .getTodayScorecard(supabase, user.id)
      .then((sc) => setMyDailySubmitted(!!sc?.submitted_at))
      .catch(() => setMyDailySubmitted(false));
  }, [isAppAdmin, isCEO, user?.id]);

  if (isAppAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader title={pageTitle} description={pageDescription} />
        <AlertCard
          variant="critical"
          title="Database not ready"
          description={error}
        />
      </div>
    );
  }

  const activeOkrs = okrs.filter((o) => o.status === "active");
  const completedOkrs = okrs.filter((o) => o.status === "completed");
  const krStatuses = keyResults.map((kr) =>
    getKeyResultProgressStatus(kr.current_value, kr.target_value)
  );
  const onTrackKrs = krStatuses.filter((s) => s.status === "green" || s.status === "amber").length;
  const atRiskKrs = keyResults.filter((kr) => kr.status === "at_risk" || kr.status === "behind");
  const overdueDecisions = decisions.filter((d) => {
    const esc = getDecisionEscalation(d.status, d.due_date);
    return esc.isOverdue;
  });
  const topOkrs = activeOkrs.slice(0, 5);

  const isLeaderOrCEO = role?.slug === "leader" || role?.slug === "ceo";
  const myKRs = user ? keyResults.filter((kr) => kr.dri_id === user.id) : [];
  const myDecisions = user ? decisions.filter((d) => d.decided_by === user.id) : [];
  const myOpenDecisions = myDecisions.filter((d) => d.status === "open");
  const myOverdueDecisions = myDecisions.filter((d) => {
    const esc = getDecisionEscalation(d.status, d.due_date);
    return esc.isOverdue;
  });
  const myKrStatuses = myKRs.map((kr) => getKeyResultProgressStatus(kr.current_value, kr.target_value));
  const myOnTrackKRs = myKrStatuses.filter((s) => s.status === "green" || s.status === "amber").length;

  const statsForMyDashboard = [
    {
      label: "Daily scorecard",
      value: myDailySubmitted === true ? "Done" : myDailySubmitted === false ? "Pending" : "—",
      subtitle: "Today",
      icon: <ClipboardCheck className="size-4" />,
    },
    ...(isLeaderOrCEO
      ? [
          {
            label: "My key results",
            value: myKRs.length,
            subtitle: myKRs.length > 0 ? `${myOnTrackKRs} on track` : undefined,
            icon: <Gauge className="size-4" />,
          },
          {
            label: "Weekly scorecard",
            value: "—",
            subtitle: "Update in Weekly Scorecard",
            icon: <TrendingUp className="size-4" />,
          },
        ]
      : []),
    ...(isHR
      ? [
          { label: "Open roles", value: "—", subtitle: "Hiring pipeline", icon: <Users className="size-4" /> },
          { label: "Key hires (week)", value: "—", subtitle: "Closed", icon: <CheckCircle2 className="size-4" /> },
          { label: "Perf. reviews %", value: "—", subtitle: "Completion", icon: <ClipboardCheck className="size-4" /> },
        ]
      : []),
    {
      label: "Decisions I own",
      value: myOpenDecisions.length,
      subtitle: myOverdueDecisions.length > 0 ? `${myOverdueDecisions.length} overdue` : undefined,
      icon: <MessageSquare className="size-4" />,
    },
  ];

  if (!isCEO && user) {
    return (
      <div className="space-y-8">
        <PageHeader
          title={pageTitle}
          description={pageDescription}
          actions={
            <Button size="sm" asChild>
              <Link to="/daily-scorecard">
                {myDailySubmitted ? "Edit today's scorecard" : "Submit daily scorecard"}
              </Link>
            </Button>
          }
        />
        <StatGrid columns={Math.min(4, Math.max(2, statsForMyDashboard.length)) as 2 | 3 | 4} stats={statsForMyDashboard} />
        <div className={isLeaderOrCEO || isHR ? "grid gap-6 lg:grid-cols-2" : "space-y-6"}>
          {isHR && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-foreground">Hiring & HR</h2>
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Open roles, key hires closed, performance reviews completion %, pipeline (candidates in final round), quality (attrition, offer-to-join ratio, hiring SLA breaches). Update via Daily scorecard.
              </p>
              <Button size="sm" variant="outline" asChild>
                <Link to="/daily-scorecard">{myDailySubmitted ? "Edit today's scorecard" : "Submit daily scorecard"}</Link>
              </Button>
            </div>
          </div>
          )}
          {isLeaderOrCEO && (
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-foreground">My key results</h2>
            {myKRs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
                <Gauge className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No key results assigned to you yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myKRs.slice(0, 5).map((kr) => {
                  const status = getKeyResultProgressStatus(kr.current_value, kr.target_value);
                  return (
                    <div key={kr.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <Link
                          to="/scorecards"
                          className="text-sm font-medium text-foreground hover:underline underline-offset-4 line-clamp-1"
                        >
                          {kr.title}
                        </Link>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {kr.current_value} / {kr.target_value} {kr.unit ?? ""}
                        </span>
                      </div>
                      <ProgressBar
                        value={kr.target_value ? (kr.current_value / kr.target_value) * 100 : 0}
                        max={100}
                        variant={
                          status.status === "green" ? "success" : status.status === "amber" ? "default" : "warning"
                        }
                      />
                    </div>
                  );
                })}
                {myKRs.length > 5 && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/scorecards">View all ({myKRs.length})</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
          )}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-foreground">My decisions</h2>
            {myOverdueDecisions.length > 0 && (
              <AlertCard
                variant="critical"
                title={`${myOverdueDecisions.length} overdue decision${myOverdueDecisions.length !== 1 ? "s" : ""}`}
                description="Decisions you own that are past due."
                action={
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/decisions">View decisions</Link>
                  </Button>
                }
              />
            )}
            {myOpenDecisions.length === 0 && myOverdueDecisions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
                <MessageSquare className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">No decisions assigned to you.</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link to="/decisions">View all decisions</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {myOpenDecisions.slice(0, 5).map((d) => (
                  <Link
                    key={d.id}
                    to={`/decisions/${d.id}`}
                    className="block rounded-lg border border-border bg-card p-3 text-sm font-medium text-foreground hover:bg-muted/50"
                  >
                    {d.title}
                  </Link>
                ))}
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/decisions">View all</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        actions={
          <Button size="sm" asChild>
            <Link to="/okrs">Add objective</Link>
          </Button>
        }
      />

      <StatGrid
        columns={4}
        stats={[
          {
            label: "Active OKRs",
            value: activeOkrs.length,
            subtitle: okrs.length > 0 ? `${okrs.length} total` : undefined,
            icon: <Target className="size-4" />,
          },
          {
            label: "KRs on track",
            value: onTrackKrs,
            subtitle: keyResults.length > 0 ? `of ${keyResults.length}` : undefined,
            trend: onTrackKrs > 0 ? "up" : undefined,
            icon: <TrendingUp className="size-4" />,
          },
          {
            label: "Team members",
            value: profiles.length,
            icon: <Users className="size-4" />,
          },
          {
            label: "Completed OKRs",
            value: completedOkrs.length,
            subtitle: "all time",
            icon: <CheckCircle2 className="size-4" />,
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-foreground">Active OKR progress</h2>
          {topOkrs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
              <Target className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                No active OKRs. <Link to="/okrs" className="text-primary underline-offset-4 hover:underline">Create one</Link>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topOkrs.map((okr) => (
                <div key={okr.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Link to={`/okrs/${okr.id}`} className="text-sm font-medium text-foreground hover:underline underline-offset-4 line-clamp-1">
                      {okr.title}
                    </Link>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {Math.round(okr.progress_percent)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={okr.progress_percent}
                    max={100}
                    variant={
                      okr.progress_percent >= 80 ? "success" : okr.progress_percent >= 50 ? "default" : "warning"
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-medium text-foreground">Alerts</h2>
          {atRiskKrs.length > 0 ? (
            <AlertCard
              variant="warning"
              title={`${atRiskKrs.length} key result${atRiskKrs.length !== 1 ? "s" : ""} at risk or behind`}
              description="Review and update before the next check-in."
              action={
                <Button size="sm" variant="outline" asChild>
                  <Link to="/key-results">Review</Link>
                </Button>
              }
            />
          ) : keyResults.length > 0 ? (
            <AlertCard variant="success" title="All key results on track" description="Great execution — keep it up." />
          ) : null}
          {overdueDecisions.length > 0 ? (
            <AlertCard
              variant="critical"
              title={`${overdueDecisions.length} overdue decision${overdueDecisions.length !== 1 ? "s" : ""}`}
              description="These decisions have passed their due date."
              action={
                <Button size="sm" variant="outline" asChild>
                  <Link to="/decisions">View decisions</Link>
                </Button>
              }
            />
          ) : decisions.filter((d) => d.status === "open").length > 0 ? (
            <AlertCard
              variant="neutral"
              title={`${decisions.filter((d) => d.status === "open").length} open decisions`}
              description="Track decisions and their outcomes in the Decision Log."
            />
          ) : null}
          {okrs.length === 0 && (
            <AlertCard
              variant="neutral"
              title="No OKRs yet"
              description="Set up your objectives and key results to start tracking execution."
              action={
                <Button size="sm" variant="outline" asChild>
                  <Link to="/okrs">Create OKR</Link>
                </Button>
              }
            />
          )}
          {completedOkrs.length > 0 && (
            <AlertCard
              variant="success"
              title={`${completedOkrs.length} completed OKR${completedOkrs.length !== 1 ? "s" : ""}`}
              description="Well done on completing your objectives."
            />
          )}
        </div>
      </div>
    </div>
  );
}
