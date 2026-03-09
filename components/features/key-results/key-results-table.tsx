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
import { getKeyResultProgressStatus, type KRProgressStatus } from "@/utils/key-result-status";
import { cn } from "@/lib/utils";
import type { KeyResult } from "@/types";

const STATUS_STYLE: Record<KRProgressStatus, string> = {
  green: "bg-success/15 text-success border-success/30",
  amber: "bg-warning/15 text-warning-foreground border-warning/30",
  red: "bg-critical/15 text-critical-foreground border-critical/30",
  black: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABEL: Record<KRProgressStatus, string> = {
  green: "On Track",
  amber: "At Risk",
  red: "Behind",
  black: "No Data",
};

const KR_STATUS_STYLE: Record<KeyResult["status"], string> = {
  not_started: "bg-muted text-muted-foreground",
  on_track: "bg-success/15 text-success",
  at_risk: "bg-warning/15 text-warning-foreground",
  behind: "bg-critical/15 text-critical-foreground",
  completed: "bg-success/20 text-success",
};

const KR_STATUS_LABEL: Record<KeyResult["status"], string> = {
  not_started: "Not Started",
  on_track: "On Track",
  at_risk: "At Risk",
  behind: "Behind",
  completed: "Completed",
};

export interface KeyResultRow extends KeyResult {
  okrTitle?: string | null;
  driName?: string | null;
}

interface KeyResultsTableProps {
  rows: KeyResultRow[];
  className?: string;
}

function formatValue(value: number, unit: string | null): string {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return unit ? `${n} ${unit}` : String(n);
}

export function KeyResultsTable({ rows, className }: KeyResultsTableProps) {
  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-card p-12 text-center text-muted-foreground",
          className
        )}
      >
        No key results match the current filters.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="font-medium">KR name</TableHead>
            <TableHead className="font-medium">OKR</TableHead>
            <TableHead className="font-medium text-right">Target</TableHead>
            <TableHead className="font-medium text-right">Actual</TableHead>
            <TableHead className="font-medium text-right">Progress</TableHead>
            <TableHead className="font-medium">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((kr) => {
            const { status: ragStatus, progressPercent, hasNumbers } = getKeyResultProgressStatus(
              kr.current_value,
              kr.target_value
            );
            const progressLabel = hasNumbers
              ? `${Math.round(progressPercent)}%`
              : "—";
            return (
              <TableRow key={kr.id} className="border-border">
                <TableCell>
                  <Link
                    to={`/key-results/${kr.id}`}
                    className="font-medium text-foreground hover:underline underline-offset-4"
                  >
                    {kr.title}
                  </Link>
                  {kr.driName && (
                    <p className="text-xs text-muted-foreground mt-0.5">{kr.driName}</p>
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    to={`/okrs/${kr.okr_id}`}
                    className="text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
                  >
                    {kr.okrTitle ?? "—"}
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatValue(kr.target_value, kr.unit)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatValue(kr.current_value, kr.unit)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {progressLabel}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
                      kr.status === "not_started" || kr.status === "on_track" || kr.status === "at_risk" || kr.status === "behind" || kr.status === "completed"
                        ? KR_STATUS_STYLE[kr.status]
                        : STATUS_STYLE[ragStatus]
                    )}
                  >
                    {KR_STATUS_LABEL[kr.status] ?? STATUS_LABEL[ragStatus]}
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
