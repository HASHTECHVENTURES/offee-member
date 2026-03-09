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
import type { WeeklyKRRow, WeeklyKRCalculated, RAGStatus } from "@/utils/weekly-scoreboard";
import { calculateWeeklyCatchUp } from "@/utils/weekly-scoreboard";
import { cn } from "@/lib/utils";

const RAG_BG: Record<RAGStatus, string> = {
  green: "bg-success/15 text-success border-success/30",
  amber: "bg-warning/15 text-warning-foreground border-warning/30",
  red: "bg-critical/15 text-critical-foreground border-critical/30",
  black: "bg-neutral text-neutral-foreground border-border",
};

function formatNum(value: number, unit: string | null): string {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  const s = n % 1 === 0 ? String(Math.round(n)) : n.toFixed(2);
  return unit ? `${s} ${unit}` : s;
}

interface WeeklyKRScoreboardProps {
  rows: WeeklyKRRow[];
  className?: string;
}

export function WeeklyKRScoreboard({ rows, className }: WeeklyKRScoreboardProps) {
  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-card p-12 text-center text-muted-foreground",
          className
        )}
      >
        No key results to show. Add OKRs and key results to see the weekly scoreboard.
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
            <TableHead className="font-medium">KR</TableHead>
            <TableHead className="font-medium">OKR</TableHead>
            <TableHead className="font-medium text-right">Weekly target</TableHead>
            <TableHead className="font-medium text-right">Actual progress</TableHead>
            <TableHead className="font-medium text-right">Gap</TableHead>
            <TableHead className="font-medium text-right">Next target</TableHead>
            <TableHead className="font-medium">RAG</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const calc = calculateWeeklyCatchUp(row);
            return (
              <TableRow key={row.krId} className="border-border">
                <TableCell>
                  <Link
                    to={`/key-results/${row.krId}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {row.krTitle}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/okrs/${row.okrId}`}
                    className="text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {row.okrTitle}
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNum(calc.weeklyTarget, row.unit)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNum(calc.actualProgress, row.unit)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNum(calc.gap, row.unit)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNum(calc.nextTarget, row.unit)}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium uppercase",
                      RAG_BG[calc.ragStatus]
                    )}
                  >
                    {calc.ragStatus}
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
