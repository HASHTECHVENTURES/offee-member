import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDecisionEscalation, type EscalationLevel } from "@/utils/decision-escalation";
import { cn } from "@/lib/utils";
import type { Decision } from "@/types";

const ESCALATION_BG: Record<EscalationLevel, string> = {
  on_track: "bg-success/15 text-success border-success/30",
  late: "bg-warning/15 text-warning-foreground border-warning/30",
  critical: "bg-critical/15 text-critical-foreground border-critical/30",
  escalated: "bg-critical/20 text-critical-foreground border-critical font-semibold",
  na: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABELS: Record<Decision["status"], string> = {
  open: "Open",
  decided: "Decided",
  archived: "Archived",
};

export interface DecisionRow extends Decision {
  ownerName?: string | null;
  krImpactedTitle?: string | null;
}

interface DecisionsTableProps {
  decisions: DecisionRow[];
  className?: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DecisionsTable({ decisions, className }: DecisionsTableProps) {
  if (decisions.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-card p-12 text-center text-muted-foreground",
          className
        )}
      >
        No decisions yet.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden",
        className
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="font-medium">Decision</TableHead>
            <TableHead className="font-medium">Owner</TableHead>
            <TableHead className="font-medium">KR impacted</TableHead>
            <TableHead className="font-medium">Due date</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Escalation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {decisions.map((d) => {
            const escalation = getDecisionEscalation(d.status, d.due_date);
            const escalationLabel =
              escalation.level === "na"
                ? "—"
                : escalation.level === "on_track" && !escalation.isOverdue
                  ? "On track"
                  : escalation.level === "late"
                    ? `${d.due_date ? "Late" : ""} (${escalation.daysOverdue}d)`
                    : escalation.level === "critical"
                      ? `Critical (${escalation.daysOverdue}d)`
                      : `Escalated (${escalation.daysOverdue}d)`;
            return (
              <TableRow key={d.id} className="border-border">
                <TableCell>
                  <Link
                    to={`/decisions/${d.id}`}
                    className="font-medium text-foreground hover:underline line-clamp-2"
                  >
                    {d.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {d.ownerName ?? "—"}
                </TableCell>
                <TableCell>
                  {d.kr_impacted_id ? (
                    <Link
                      to={`/key-results/${d.kr_impacted_id}`}
                      className="text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {d.krImpactedTitle ?? "KR"}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {formatDate(d.due_date)}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {STATUS_LABELS[d.status]}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
                      ESCALATION_BG[escalation.level]
                    )}
                  >
                    {escalationLabel}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </motion.div>
  );
}
