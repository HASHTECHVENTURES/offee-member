import type { LucideIcon } from "lucide-react";
import {
  Target,
  Gauge,
  Crosshair,
  ClipboardList,
  CalendarDays,
  MessageSquare,
  Sparkles,
  CheckSquare,
  Trophy,
  Bell,
  Activity,
  Settings,
  Building2,
  Briefcase,
  Calendar,
  Users,
  FileText,
  Zap,
  ClipboardCheck,
  Box,
  Handshake,
  Shield,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** If true, item is shown only when user has the relevant permission (OKRs/key results: canManage*; Admin: canAccessAdmin) */
  adminOnly?: boolean;
}

export const mainNav: NavItem[] = [
  { label: "Workspace", href: "/workspace", icon: Zap },
  { label: "Daily Scorecard", href: "/daily-scorecard", icon: ClipboardCheck },
  { label: "Weekly Scorecard", href: "/scorecards", icon: ClipboardList },
  { label: "OKRs", href: "/okrs", icon: Target, adminOnly: true },
  { label: "Key Results", href: "/key-results", icon: Gauge, adminOnly: true },
  { label: "Decisions", href: "/decisions", icon: MessageSquare },
  { label: "Team", href: "/team", icon: Users },
];

export const bottomNav: NavItem[] = [
  { label: "Admin panel", href: "/admin", icon: Shield, adminOnly: true },
  { label: "Settings", href: "/settings", icon: Settings },
];

/** Sidebar nav for app admins only: no execution/scorecards/OKRs, just admin + team + settings */
export const adminOnlyNav: NavItem[] = [
  { label: "Admin panel", href: "/admin", icon: Shield },
  { label: "Team", href: "/team", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];
