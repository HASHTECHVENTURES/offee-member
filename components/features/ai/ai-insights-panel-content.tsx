import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type AIRoute = "dashboard" | "followups" | "analysis" | "risk_alerts";

function getRouteForPath(pathname: string): AIRoute {
  if (pathname === "/ai-dashboard") return "dashboard";
  if (pathname === "/follow-ups") return "followups";
  if (
    pathname === "/okrs" ||
    pathname.startsWith("/okrs/") ||
    pathname === "/targets" ||
    pathname === "/leader-performance" ||
    pathname === "/weekly-board"
  ) return "analysis";
  if (
    pathname === "/decisions" ||
    pathname.startsWith("/decisions/") ||
    pathname === "/notifications" ||
    pathname.startsWith("/key-results")
  ) return "risk_alerts";
  return "dashboard";
}

function getApiUrl(route: AIRoute): string {
  const map: Record<AIRoute, string> = {
    dashboard: "/api/ai/dashboard",
    followups: "/api/ai/followups",
    analysis: "/api/ai/analysis",
    risk_alerts: "/api/ai/risk-alerts",
  };
  return map[route];
}

function getContextLabel(pathname: string): string {
  if (pathname === "/ai-dashboard") return "CEO Dashboard";
  if (pathname === "/follow-ups") return "Follow-ups";
  if (pathname.startsWith("/okrs")) return "OKR Analysis";
  if (pathname === "/targets") return "Target Analysis";
  if (pathname === "/leader-performance") return "Leader Analysis";
  if (pathname === "/weekly-board") return "Weekly Analysis";
  if (pathname.startsWith("/decisions")) return "Risk Alerts";
  if (pathname.startsWith("/key-results")) return "Risk Alerts";
  if (pathname === "/notifications") return "Risk Alerts";
  return "Executive Summary";
}

export function AIInsightsPanelContent() {
  const pathname = useLocation().pathname;
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const route = getRouteForPath(pathname);
  const label = getContextLabel(pathname);

  function load(bust = false) {
    setLoading(true);
    setError(null);
    const url = getApiUrl(route) + (bust ? "?bust=1" : "");
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404 || res.status === 500) {
            setError("AI insights API is not available in this build.");
            setLoading(false);
            return null;
          }
          throw new Error(res.statusText);
        }
        return res.json().catch(() => null);
      })
      .then((data) => {
        if (data) {
          setContent(data.content ?? "");
          setCached(!!data.cached);
        }
      })
      .catch((err) => setError(err?.message ?? "Failed to load insights"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [route]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Generating {label} insights…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-critical/30 bg-critical/5 p-4">
          <p className="text-xs text-critical-foreground">{error}</p>
        </div>
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => load()}>
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background/50 p-6 text-center">
        <p className="text-xs text-muted-foreground">No insights yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        {cached && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            title="Refresh insights"
            onClick={() => load(true)}
          >
            <RefreshCw className="size-3" />
          </Button>
        )}
      </div>
      <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}
