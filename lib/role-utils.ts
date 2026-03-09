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
  return role?.dashboard_type === "ceo" ?? false;
}

export function getCanManageOKRs(role: Role | null, profile: UserProfile | null): boolean {
  if (role) return role.can_manage_okrs === true;
  return profile?.role === "admin";
}

export function getCanManageKeyResults(role: Role | null, profile: UserProfile | null): boolean {
  if (role) return role.can_manage_key_results === true;
  return profile?.role === "admin";
}
