import { motion } from "framer-motion";
import { SidebarNavigation } from "@/components/design-system/sidebar-navigation";
import { Link } from "react-router-dom";

interface SidebarClientProps {
  displayName: string | null;
  email: string | null;
}

export function SidebarClient({ displayName, email }: SidebarClientProps) {
  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border px-4"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20">
          O
        </div>
        <span className="font-semibold tracking-tight text-sidebar-foreground">
          Offee
        </span>
      </motion.div>

      <SidebarNavigation />

      {(displayName || email) && (
        <Link
          to="/settings"
          className="flex shrink-0 items-center border-t border-sidebar-border px-4 py-3 transition-colors hover:bg-sidebar-accent/50"
        >
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-sidebar-foreground">
              {displayName || email?.split("@")[0]}
            </p>
            {displayName && email && (
              <p className="truncate text-[11px] text-sidebar-foreground/50">
                {email}
              </p>
            )}
          </div>
        </Link>
      )}
    </aside>
  );
}
