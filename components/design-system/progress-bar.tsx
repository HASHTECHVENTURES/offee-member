"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ProgressVariant = "default" | "success" | "warning" | "critical";

const variantStyles: Record<
  ProgressVariant,
  { track: string; fill: string }
> = {
  default: { track: "bg-muted", fill: "bg-primary" },
  success: { track: "bg-muted", fill: "bg-success" },
  warning: { track: "bg-muted", fill: "bg-warning" },
  critical: { track: "bg-muted", fill: "bg-critical" },
};

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = "default",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const styles = variantStyles[variant];

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn("h-2.5 w-full overflow-hidden rounded-full", styles.track)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <motion.div
          className={cn(
            "h-full rounded-full",
            variant === "success" && "bg-gradient-to-r from-success to-success/80",
            variant !== "success" && styles.fill
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      {showLabel && (
        <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
}
