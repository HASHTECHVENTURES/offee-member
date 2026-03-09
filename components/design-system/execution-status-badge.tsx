"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ExecutionStatus =
  | "on_track"
  | "at_risk"
  | "behind"
  | "completed"
  | "not_started";

const statusConfig: Record<
  ExecutionStatus,
  { label: string; className: string }
> = {
  on_track: {
    label: "On track",
    className: "bg-success/15 text-success border-success/30",
  },
  at_risk: {
    label: "At risk",
    className: "bg-warning/15 text-warning-foreground border-warning/30",
  },
  behind: {
    label: "Behind",
    className: "bg-critical/15 text-critical-foreground border-critical/30",
  },
  completed: {
    label: "Completed",
    className: "bg-success/15 text-success border-success/30",
  },
  not_started: {
    label: "Not started",
    className: "bg-neutral text-neutral-foreground border-border",
  },
};

interface ExecutionStatusBadgeProps {
  status: ExecutionStatus;
  className?: string;
}

export function ExecutionStatusBadge({ status, className }: ExecutionStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </motion.span>
  );
}
