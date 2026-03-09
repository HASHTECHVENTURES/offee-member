import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase-browser";
import { userService, workspaceMemberService, roleService } from "@/services";
import {
  getIsAppAdmin,
  getIsCEO,
  getCanManageOKRs,
  getCanManageKeyResults,
} from "@/lib/role-utils";
import type { UserProfile, WorkspaceMember, Role } from "@/types";

/** Fallback only when user has no workspace memberships (e.g. new account). */
const FALLBACK_WORKSPACE_ID = "a0000000-0000-0000-0000-000000000001";

export interface ProfileContextValue {
  profile: UserProfile | null;
  membership: WorkspaceMember | null;
  role: Role | null;
  loading: boolean;
  workspaceId: string;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  membership: null,
  role: null,
  loading: true,
  workspaceId: FALLBACK_WORKSPACE_ID,
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [membership, setMembership] = useState<WorkspaceMember | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string>(FALLBACK_WORKSPACE_ID);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setMembership(null);
      setRole(null);
      setWorkspaceId(FALLBACK_WORKSPACE_ID);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      userService.getProfileById(supabase, user.id),
      workspaceMemberService.getMembers(supabase, { user_id: user.id }),
    ])
      .then(([p, memberships]) => {
        setProfile(p);
        const first = memberships?.[0] ?? null;
        setMembership(first);
        setWorkspaceId(first?.workspace_id ?? FALLBACK_WORKSPACE_ID);
        if (first?.role_id) {
          return roleService.getRoleById(supabase, first.role_id).then(setRole);
        }
        setRole(null);
      })
      .catch(() => {
        setProfile(null);
        setMembership(null);
        setRole(null);
        setWorkspaceId(FALLBACK_WORKSPACE_ID);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        membership,
        role,
        loading,
        workspaceId,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}

/** True if user can access Admin panel. Uses role-utils. */
export function useCanAccessAdmin() {
  const { profile, role } = useProfile();
  return getIsAppAdmin(role, profile);
}

/** True if user sees CEO dashboard and can manage OKRs (CEO role). Uses role-utils. */
export function useIsCEOOrCanManageOKRs() {
  const { profile, role } = useProfile();
  return getIsCEO(role) || getCanManageOKRs(role, profile);
}

/** True if app admin (sees only Admin panel nav). Uses role-utils. */
export function useIsAppAdmin() {
  const { profile, role } = useProfile();
  return getIsAppAdmin(role, profile);
}

/** True if CEO dashboard type. Uses role-utils. */
export function useIsCEO() {
  const { role } = useProfile();
  return getIsCEO(role);
}

/** Can manage OKRs. Uses role-utils. */
export function useCanManageOKRs() {
  const { profile, role } = useProfile();
  return getCanManageOKRs(role, profile);
}

/** Can manage Key Results. Uses role-utils. */
export function useCanManageKeyResults() {
  const { profile, role } = useProfile();
  return getCanManageKeyResults(role, profile);
}
