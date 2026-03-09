"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";

type AlertVariant = "success" | "warning" | "critical" | "neutral";

const variantConfig: Record<
  AlertVariant,
  { icon: typeof CheckCircle2; container: string; iconClass: string }
> = {
  success: {
    icon: CheckCircle2,
    container: "border-success/30 bg-success/5",
    iconClass: "text-success",
  },
  warning: {
    icon: AlertTriangle,
    container: "border-warning/30 bg-warning/5",
    iconClass: "text-warning-foreground",
  },
  critical: {
    icon: AlertCircle,
    container: "border-critical/30 bg-critical/5",
    iconClass: "text-critical-foreground",
  },
  neutral: {
    icon: Info,
    container: "border-border bg-muted/30",
    iconClass: "text-muted-foreground",
  },
};

interface AlertCardProps {
  variant?: AlertVariant;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function AlertCard({
  variant = "neutral",
  title,
  description,
  action,
  className,
}: AlertCardProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex gap-4 rounded-xl border p-4 shadow-sm",
        config.container,
        className
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          config.iconClass,
          variant === "success" && "bg-success/15",
          variant === "warning" && "bg-warning/15",
          variant === "critical" && "bg-critical/15",
          variant === "neutral" && "bg-muted"
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </motion.div>
  );
}
