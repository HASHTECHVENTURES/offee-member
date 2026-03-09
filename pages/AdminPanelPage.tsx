import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase-browser";
import { useProfile } from "@/contexts/ProfileContext";
import { getIsAppAdmin } from "@/lib/role-utils";
import { roleService, workspaceMemberService } from "@/services";
import { PageHeader } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import type { Role } from "@/types";
import type { MemberWithProfile } from "@/types";
import { UserPlus, Users } from "lucide-react";

const CREATE_MEMBER_API = "/api/create-member";

/** Default role options shown in Add member when DB has no roles (or as fallback). */
const DEFAULT_ROLE_OPTIONS = [
  { slug: "admin", name: "Admin" },
  { slug: "ceo", name: "CEO" },
  { slug: "leader", name: "Leader" },
  { slug: "hr", name: "HR" },
  { slug: "member", name: "Member" },
] as const;

/** Seed the 5 default roles for the workspace when none exist (matches migrations + doc). */
const DEFAULT_ROLES_TO_SEED = [
  { name: "Admin", slug: "admin", can_access_admin_panel: true, can_manage_okrs: false, can_manage_key_results: false, dashboard_type: "ceo" as const },
  { name: "CEO", slug: "ceo", can_access_admin_panel: false, can_manage_okrs: true, can_manage_key_results: true, dashboard_type: "ceo" as const },
  { name: "Leader", slug: "leader", can_access_admin_panel: false, can_manage_okrs: false, can_manage_key_results: false, dashboard_type: "my" as const },
  { name: "HR", slug: "hr", can_access_admin_panel: false, can_manage_okrs: false, can_manage_key_results: false, dashboard_type: "my" as const },
  { name: "Member", slug: "member", can_access_admin_panel: false, can_manage_okrs: false, can_manage_key_results: false, dashboard_type: "my" as const },
];

export function AdminPanelPage() {
  const { profile, role, workspaceId } = useProfile();
  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMemberName, setAddMemberName] = useState("");
  const [addMemberDesignation, setAddMemberDesignation] = useState("admin");
  const [addMemberRoleId, setAddMemberRoleId] = useState<string>("slug:admin");
  const [addMemberEmail, setAddMemberEmail] = useState("");
  const [addMemberPassword, setAddMemberPassword] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleSlug, setNewRoleSlug] = useState("");
  const [newRoleAdminPanel, setNewRoleAdminPanel] = useState(false);
  const [newRoleOKRs, setNewRoleOKRs] = useState(false);
  const [newRoleKRs, setNewRoleKRs] = useState(false);
  const [newRoleDashboard, setNewRoleDashboard] = useState<"ceo" | "my">("my");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const hasTriedSeedRef = useRef(false);

  const canAccess = getIsAppAdmin(role, profile);

  async function seedDefaultRoles(force = false) {
    if (!workspaceId || (!force && hasTriedSeedRef.current)) return;
    if (!force) hasTriedSeedRef.current = true;
    setSeeding(true);
    try {
      for (const r of DEFAULT_ROLES_TO_SEED) {
        await roleService.createRole(supabase, { workspace_id: workspaceId, ...r });
      }
      toast.success("Created 5 default roles: Admin, CEO, Leader, HR, Member.");
      load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("unique constraint") || msg.includes("duplicate key")) {
        load();
      } else {
        if (!force) hasTriedSeedRef.current = false;
        toast.error(msg || "Could not create roles. Check database permissions.");
      }
    } finally {
      setSeeding(false);
    }
  }

  function load() {
    setRolesLoaded(false);
    roleService.getRoles(supabase, { workspace_id: workspaceId })
      .then((r) => {
        setRoles(r);
        setError(null);
        setRolesLoaded(true);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load");
        setRolesLoaded(true);
      });
  }

  function loadMembers() {
    workspaceMemberService
      .getMembersWithProfilesAndRoles(supabase, workspaceId)
      .then((m) => {
        setMembers(m);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load members"));
  }

  useEffect(() => {
    load();
    loadMembers();
  }, [workspaceId]);

  // Only seed when we've actually loaded roles and the list is empty (avoids duplicate-key race on login)
  useEffect(() => {
    if (rolesLoaded && roles.length === 0 && workspaceId) seedDefaultRoles();
  }, [rolesLoaded, roles.length, workspaceId]);

  // When roles load, default role selection to admin by id so the Select can show it
  useEffect(() => {
    if (roles.length === 0) return;
    const adminRole = roles.find((r) => r.slug === "admin");
    if (adminRole) setAddMemberRoleId((prev) => (prev === "slug:admin" ? adminRole.id : prev));
  }, [roles]);


  async function handleAddMember() {
    if (!addMemberEmail.trim()) {
      toast.error("Email is required");
      return;
    }
    const passwordToSend = addMemberPassword && addMemberPassword.length >= 6 ? addMemberPassword : undefined;
    setSaving(true);
    try {
      const res = await fetch(CREATE_MEMBER_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: addMemberEmail.trim(),
          full_name: addMemberName.trim() || undefined,
          designation: addMemberDesignation.trim() || undefined,
          password: passwordToSend,
          workspace_id: workspaceId,
          role_id: addMemberRoleId.startsWith("slug:") ? null : (addMemberRoleId.trim() || null),
          role_slug: addMemberRoleId.startsWith("slug:") ? addMemberRoleId.slice(5) : null,
        }),
      });
      const raw = await res.text();
      const data = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;
      const errMsg = data?.error ?? (data && typeof data === "object" ? null : raw?.slice(0, 200) || null);
      if (!res.ok) {
        const msg = errMsg || (res.status === 500 ? "Server error — check terminal running create-member server" : "Failed to create member");
        toast.error(msg);
        setSaving(false);
        return;
      }
      toast.success("Member added to workspace. If they're new, they can sign in with the password you set.");
      setAddMemberOpen(false);
      setAddMemberName("");
      setAddMemberDesignation("admin");
      setAddMemberRoleId(roles.find((r) => r.slug === "admin")?.id ?? "slug:admin");
      setAddMemberEmail("");
      setAddMemberPassword("");
      load();
      loadMembers();
    } catch (e) {
      toast.error("Cannot reach create-member API. Run: node --env-file=.env.local server/create-member-server.mjs");
    } finally {
      setSaving(false);
    }
  }

  async function handleMemberRoleChange(member: MemberWithProfile, roleId: string) {
    if (!roleId.trim()) return;
    try {
      await workspaceMemberService.updateMemberRoleId(
        supabase,
        workspaceId,
        member.user_id,
        roleId
      );
      toast.success("Role updated");
      loadMembers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update role");
    }
  }

  async function handleCreateRole() {
    if (!newRoleName.trim()) return;
    setSaving(true);
    try {
      await roleService.createRole(supabase, {
        workspace_id: workspaceId,
        name: newRoleName.trim(),
        slug: newRoleSlug.trim() || newRoleName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        can_access_admin_panel: newRoleAdminPanel,
        can_manage_okrs: newRoleOKRs,
        can_manage_key_results: newRoleKRs,
        dashboard_type: newRoleDashboard,
      });
      toast.success(`Role "${newRoleName}" created`);
      setCreateRoleOpen(false);
      setNewRoleName("");
      setNewRoleSlug("");
      setNewRoleAdminPanel(false);
      setNewRoleOKRs(false);
      setNewRoleKRs(false);
      setNewRoleDashboard("my");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create role");
    } finally {
      setSaving(false);
    }
  }

  if (!canAccess) {
    return <Navigate to="/workspace" replace />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin panel"
        description="Manage team members, roles, and who can see what. Only admins can access this area."
        actions={
          <Button
            size="sm"
            onClick={() => {
              const adminRoleId = roles.find((r) => r.slug === "admin")?.id ?? "slug:admin";
              setAddMemberDesignation("admin");
              setAddMemberRoleId(adminRoleId);
              setAddMemberOpen(true);
            }}
          >
            <UserPlus className="size-4" />
            Add member
          </Button>
        }
      />

      {error && (
        <p className="text-sm text-critical-foreground">{error}</p>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Users className="size-5" />
          Team members
        </h2>
        <p className="text-sm text-muted-foreground">
          All workspace members. Change role in the table to control what each person can see and do.
        </p>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No members yet. Use &quot;Add member&quot; to invite someone.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m) => {
                  const designation =
                    (m.profile as { leader_title?: string } | null)?.leader_title ||
                    (m.role === "admin" ? "Admin" : null) ||
                    "—";
                  const effectiveRoleId =
                    m.role_id ?? roles.find((r) => r.slug === m.role)?.id ?? "";
                  return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      {m.profile?.full_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.profile?.email ?? m.user_id}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {designation}
                    </TableCell>
                    <TableCell className="align-middle">
                      <Select
                        key={`role-${m.id}`}
                        value={
                          effectiveRoleId && roles.some((r) => r.id === effectiveRoleId)
                            ? effectiveRoleId
                            : undefined
                        }
                        onValueChange={(value) => handleMemberRoleChange(m, value)}
                      >
                        <SelectTrigger className="w-[180px] h-8" onClick={(e) => e.stopPropagation()}>
                          <SelectValue placeholder="Assign role" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={4} className="z-[100]">
                          {roles.length === 0 ? (
                            <div className="px-2 py-3 text-sm text-muted-foreground">
                              No roles yet. Create one below.
                            </div>
                          ) : (
                            roles.map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          (m.status ?? "active") === "pending"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground"
                        }
                      >
                        {(m.status ?? "active") === "pending" ? "Pending" : "Active"}
                      </span>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby="create-role-desc">
          <DialogHeader>
            <DialogTitle>Create role</DialogTitle>
          </DialogHeader>
          <p id="create-role-desc" className="sr-only">Define a new role with dashboard and permission options.</p>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Role name</Label>
              <Input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g. Finance lead"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug (optional)</Label>
              <Input
                value={newRoleSlug}
                onChange={(e) => setNewRoleSlug(e.target.value)}
                placeholder="e.g. finance-lead"
              />
            </div>
            <div className="space-y-2">
              <Label>Dashboard</Label>
              <Select
                value={newRoleDashboard}
                onValueChange={(v: "ceo" | "my") => setNewRoleDashboard(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ceo">CEO (full company view)</SelectItem>
                  <SelectItem value="my">My dashboard (own data only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newRoleAdminPanel}
                  onChange={(e) => setNewRoleAdminPanel(e.target.checked)}
                />
                Admin panel
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newRoleOKRs}
                  onChange={(e) => setNewRoleOKRs(e.target.checked)}
                />
                Manage OKRs
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newRoleKRs}
                  onChange={(e) => setNewRoleKRs(e.target.checked)}
                />
                Manage key results
              </label>
            </div>
            <Button onClick={handleCreateRole} disabled={saving || !newRoleName.trim()}>
              {saving ? "Creating…" : "Create role"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby="add-member-desc">
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
          </DialogHeader>
          <p id="add-member-desc" className="text-sm text-muted-foreground">
            They will sign in via Team member login with the email and password you set, and see the dashboard for the role you select.
          </p>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={addMemberName}
                onChange={(e) => setAddMemberName(e.target.value)}
                placeholder="e.g. Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input
                value={addMemberDesignation}
                onChange={(e) => setAddMemberDesignation(e.target.value)}
                placeholder="e.g. Product Manager, Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={addMemberRoleId || undefined} onValueChange={setAddMemberRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.length > 0
                    ? roles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))
                    : DEFAULT_ROLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.slug} value={`slug:${opt.slug}`}>
                          {opt.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={addMemberEmail}
                onChange={(e) => setAddMemberEmail(e.target.value)}
                placeholder="colleague@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Password (optional for existing users)</Label>
              <Input
                type="password"
                value={addMemberPassword}
                onChange={(e) => setAddMemberPassword(e.target.value)}
                placeholder="Min 6 characters for new users"
              />
              <p className="text-xs text-muted-foreground">
                Required for new users. Leave blank to add someone who already has an account.
              </p>
            </div>
            <Button
              onClick={handleAddMember}
              disabled={saving || !addMemberEmail.trim() || !addMemberRoleId.trim()}
            >
              {saving ? "Adding…" : "Add member"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
