"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RightInsightsPanelProps {
  children?: React.ReactNode;
  className?: string;
  /** When false, panel is hidden (e.g. on small screens). Still in DOM for layout. */
  visible?: boolean;
}

export function RightInsightsPanel({
  children,
  className,
  visible = true,
}: RightInsightsPanelProps) {
  return (
    <motion.aside
      initial={false}
      animate={{
        width: visible ? 320 : 0,
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "flex h-full shrink-0 flex-col border-l border-border bg-card/50 backdrop-blur-sm",
        !visible && "overflow-hidden",
        className
      )}
    >
      {visible && (
        <>
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="size-4 text-primary" />
            </span>
            <span className="text-sm font-semibold text-foreground">
              AI Insights
            </span>
          </div>
          <ScrollArea className="flex-1 p-4">
            {children ?? (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  AI Insights
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Insights and recommendations will appear here as you use OKRs, decisions, and scorecards.
                </p>
              </div>
            )}
          </ScrollArea>
        </>
      )}
    </motion.aside>
  );
}
