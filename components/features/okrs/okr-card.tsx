import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gauge, User, Calendar, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/design-system";
import type { OKR } from "@/types";

const MIN_KRS = 3;
const MAX_KRS = 5;

const STATUS_LABELS: Record<OKR["status"], string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_CLASS: Record<OKR["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-success/15 text-success",
  completed: "bg-success/15 text-success",
  cancelled: "bg-neutral text-neutral-foreground",
};

interface OKRCardProps {
  okr: OKR;
  ownerName?: string | null;
  krCount: number;
  className?: string;
}

export function OKRCard({ okr, ownerName, krCount, className }: OKRCardProps) {
  const timeline = [okr.quarter, okr.year].filter(Boolean).join(" ") || "—";
  const progressVariant =
    okr.progress_percent >= 100
      ? "success"
      : okr.progress_percent >= 50
        ? "default"
        : "warning";
  
  const hasKRWarning = krCount < MIN_KRS || krCount > MAX_KRS;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Link
        to={`/okrs/${okr.id}`}
        className={cn(
          "block rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground line-clamp-2">
              {okr.title}
            </h3>
            {okr.description && (
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                {okr.description}
              </p>
            )}
          </div>
          <span
            className={cn(
              "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
              STATUS_CLASS[okr.status]
            )}
          >
            {STATUS_LABELS[okr.status]}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {ownerName !== undefined && (
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" />
              {ownerName || "Unassigned"}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {timeline}
          </span>
          <span
            className={cn(
              "flex items-center gap-1.5",
              hasKRWarning && "text-warning-foreground font-medium"
            )}
            title={hasKRWarning ? `Best practice: ${MIN_KRS}-${MAX_KRS} KRs per OKR` : undefined}
          >
            {hasKRWarning ? (
              <AlertTriangle className="size-3.5" />
            ) : (
              <Gauge className="size-3.5" />
            )}
            {krCount} KR{krCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="mt-4">
          <ProgressBar
            value={okr.progress_percent}
            max={100}
            variant={progressVariant}
            showLabel
          />
        </div>
      </Link>
    </motion.article>
  );
}
