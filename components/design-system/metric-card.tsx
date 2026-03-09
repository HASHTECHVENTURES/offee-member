"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  className,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-all duration-200 hover:border-primary/15 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary [&>svg]:size-4">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums text-foreground sm:text-3xl">
        {value}
      </p>
      {(subtitle ?? trendValue) && (
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          {trend === "up" && (
            <span className="text-success">↑</span>
          )}
          {trend === "down" && (
            <span className="text-critical">↓</span>
          )}
          {trendValue && (
            <span
              className={
                trend === "up"
                  ? "text-success"
                  : trend === "down"
                    ? "text-critical"
                    : "text-muted-foreground"
              }
            >
              {trendValue}
            </span>
          )}
          {subtitle && (
            <span className="text-muted-foreground">{subtitle}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
