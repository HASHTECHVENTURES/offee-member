/**
 * Single source of truth for permission and dashboard logic.
 * All checks derive from Role (workspace_members.role_id); profile.role is fallback only when role is null.
 */
import type { Role } from "@/types";
import type { UserProfile } from "@/types";

export function getIsAppAdmin(role: Role | null, profile: UserProfile | null): boolean {
  if (role) return role.can_access_admin_panel === true;
  return profile?.role === "admin";
}

export function getIsCEO(role: Role | null): boolean {
  return role?.dashboard_type === "ceo";
}

export function getCanManageOKRs(role: Role | null, profile: UserProfile | null): boolean {
  if (role) return role.can_manage_okrs === true;
  return profile?.role === "admin";
}

export function getCanManageKeyResults(role: Role | null, profile: UserProfile | null): boolean {
  if (role) return role.can_manage_key_results === true;
  return profile?.role === "admin";
}

/** Separate link per role: Admin, CEO, Leader, Member, HR. */
export const ROLE_HOME_PATHS = {
  admin: "/admin",
  ceo: "/ceo",
  leader: "/leader",
  member: "/member",
  hr: "/hr",
} as const;

export type RoleSlug = keyof typeof ROLE_HOME_PATHS;

/**
 * One gate (auth) → one default link per role. Used after login and for "/" redirect.
 */
export function getDefaultHomeForRole(role: Role | null, profile: UserProfile | null): string {
  if (getIsAppAdmin(role, profile)) return ROLE_HOME_PATHS.admin;
  const slug = role?.slug as RoleSlug | undefined;
  if (slug && slug in ROLE_HOME_PATHS) return ROLE_HOME_PATHS[slug];
  return ROLE_HOME_PATHS.member;
}

/** Paths that are role-specific dashboards (not /admin). Used to guard access. */
export const DASHBOARD_ROLE_PATHS = ["/ceo", "/leader", "/member", "/hr"] as const;

/** Get the role slug expected for a path, or null if path is not role-specific. */
export function getRoleSlugForPath(pathname: string): RoleSlug | null {
  if (pathname === "/admin") return "admin";
  if (pathname === "/ceo") return "ceo";
  if (pathname === "/leader") return "leader";
  if (pathname === "/member") return "member";
  if (pathname === "/hr") return "hr";
  return null;
}

/** Login path for each role (for sign-out redirect). */
export const ROLE_LOGIN_PATHS: Record<RoleSlug, string> = {
  admin: "/login/admin",
  ceo: "/login/ceo",
  leader: "/login/leader",
  member: "/login/member",
  hr: "/login/hr",
};

export function getLoginPathForRole(role: Role | null, profile: UserProfile | null): string {
  if (getIsAppAdmin(role, profile)) return ROLE_LOGIN_PATHS.admin;
  const slug = role?.slug as RoleSlug | undefined;
  if (slug && slug in ROLE_LOGIN_PATHS) return ROLE_LOGIN_PATHS[slug];
  return ROLE_LOGIN_PATHS.member;
}

/**
 * When set (e.g. VITE_APP_ROLE=admin), this deployment is a single-role "website".
 * Fallback: detect from hostname (e.g. offee-ceo.vercel.app -> ceo) so CEO/Leader/Member repos show the right login.
 */
const PORTAL_SLUGS: RoleSlug[] = ["admin", "ceo", "leader", "member", "hr"];

export function getAppRolePortal(): RoleSlug | null {
  const v = ((typeof import.meta !== "undefined" && import.meta.env?.VITE_APP_ROLE) ?? "") as string;
  const slug = v.trim().toLowerCase();
  if (PORTAL_SLUGS.includes(slug as RoleSlug)) return slug as RoleSlug;
  if (typeof window !== "undefined" && window.location?.hostname) {
    const h = window.location.hostname.toLowerCase();
    if (h.includes("ceo")) return "ceo";
    if (h.includes("leader")) return "leader";
    if (h.includes("offeemember") || h.includes("offee-member")) return "member";
    if (h.includes("member")) return "member";
    if (h.includes("admin")) return "admin";
    if (h.includes("hr")) return "hr";
  }
  return null;
}
