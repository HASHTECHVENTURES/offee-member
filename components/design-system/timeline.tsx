"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TimelineItemProps {
  title: React.ReactNode;
  description?: string;
  date?: string;
  variant?: "default" | "success" | "warning" | "critical";
  icon?: React.ReactNode;
}

const variantDot: Record<string, string> = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  critical: "bg-critical",
};

export function TimelineItem({
  title,
  description,
  date,
  variant = "default",
  icon,
}: TimelineItemProps) {
  return (
    <div className="timeline-item relative flex gap-4 pb-6 last:pb-0">
      <div className="relative flex flex-col items-center">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "flex h-3 w-3 shrink-0 rounded-full border-2 border-background shadow-sm",
            variantDot[variant]
          )}
        />
        <div
          className="timeline-connector absolute left-1/2 top-4 h-full w-px -translate-x-1/2 bg-border [.timeline>.timeline-item:last-child_&]:hidden"
        />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-medium text-foreground">{title}</p>
          {date && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {date}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
        {icon && <div className="mt-2">{icon}</div>}
      </div>
    </div>
  );
}

interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn("timeline relative", className)}
    >
      {children}
    </motion.div>
  );
}
