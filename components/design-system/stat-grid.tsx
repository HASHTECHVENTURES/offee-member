"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MetricCard } from "./metric-card";

interface StatItem {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
}

interface StatGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatGrid({
  stats,
  columns = 4,
  className,
}: StatGridProps) {
  const gridClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columns];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
        hidden: {},
      }}
      className={cn("grid gap-4", gridClass, className)}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 12 },
          }}
        >
          <MetricCard
            label={stat.label}
            value={stat.value}
            subtitle={stat.subtitle}
            trend={stat.trend}
            trendValue={stat.trendValue}
            icon={stat.icon}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
