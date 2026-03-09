import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { getIsAppAdmin, getIsCEO, getCanManageOKRs, getCanManageKeyResults } from "@/lib/role-utils";
import { keyResultService } from "@/services";
import { supabase } from "@/lib/supabase-browser";
import type { NavItem } from "@/components/layout/nav-config";
import { mainNav, bottomNav, adminOnlyNav } from "@/components/layout/nav-config";

interface SidebarNavigationProps {
  className?: string;
  onNavigate?: () => void;
}

function NavSection({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {items.map((item, i) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href + "/"));
        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02, duration: 0.2 }}
          >
            <Link
              to={item.href}
              onClick={onNavigate}
              className="relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-sidebar-accent shadow-sm"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex items-center gap-2.5 transition-colors",
                  isActive
                    ? "text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="size-4 shrink-0 opacity-90" />
                {item.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}

export function SidebarNavigation({
  className,
  onNavigate,
}: SidebarNavigationProps) {
  const pathname = useLocation().pathname;
  const { user } = useAuth();
  const { profile, role } = useProfile();
  const [hasDriKeyResults, setHasDriKeyResults] = useState<boolean | null>(null);

  const isAppAdmin = getIsAppAdmin(role, profile);
  const isCEO = getIsCEO(role);
  const canManageOKRs = getCanManageOKRs(role, profile);
  const canManageKRs = getCanManageKeyResults(role, profile);
  const canAccessAdmin = isAppAdmin;

  useEffect(() => {
    if (!user?.id) {
      setHasDriKeyResults(false);
      return;
    }
    keyResultService
      .hasKeyResultsAsDri(supabase, user.id)
      .then(setHasDriKeyResults)
      .catch(() => setHasDriKeyResults(false));
  }, [user?.id]);

  if (isAppAdmin) {
    return (
      <ScrollArea className={cn("flex-1 py-3", className)}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/50"
        >
          Admin
        </motion.div>
        <NavSection items={adminOnlyNav} pathname={pathname} onNavigate={onNavigate} />
      </ScrollArea>
    );
  }

  const mainFiltered = mainNav.filter((item) => {
    if (item.adminOnly) {
      if (item.href === "/okrs") return canManageOKRs;
      if (item.href === "/key-results") return canManageKRs;
      return canAccessAdmin;
    }
    if (item.href === "/scorecards") {
      return hasDriKeyResults === true;
    }
    return true;
  });
  const navItems = mainFiltered.map((item, i) =>
    i === 0 && item.href === "/workspace"
      ? { ...item, label: isCEO ? "CEO Dashboard" : "My Dashboard" }
      : item
  );
  const bottomFiltered = bottomNav.filter(
    (item) => !item.adminOnly || (item.href === "/admin" ? canAccessAdmin : true)
  );

  return (
    <ScrollArea className={cn("flex-1 py-3", className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/50"
      >
        Execution
      </motion.div>
      <NavSection items={navItems} pathname={pathname} onNavigate={onNavigate} />
      <Separator className="my-3 bg-sidebar-border/80" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/50"
      >
        Account
      </motion.div>
      <NavSection items={bottomFiltered} pathname={pathname} onNavigate={onNavigate} />
    </ScrollArea>
  );
}
