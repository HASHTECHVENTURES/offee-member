import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditLog, AuditLogInsert } from "@/types";

const TABLE = "audit_logs";

export async function getAuditLogs(
  supabase: SupabaseClient,
  filters?: {
    workspace_id?: string;
    entity_type?: string;
    entity_id?: string;
    user_id?: string;
    limit?: number;
    since?: string;
  }
) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.workspace_id) {
    query = query.eq("workspace_id", filters.workspace_id);
  }
  if (filters?.entity_type) {
    query = query.eq("entity_type", filters.entity_type);
  }
  if (filters?.entity_id) {
    query = query.eq("entity_id", filters.entity_id);
  }
  if (filters?.user_id) {
    query = query.eq("user_id", filters.user_id);
  }
  if (filters?.since) {
    query = query.gte("created_at", filters.since);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load audit logs");
  return (data ?? []) as AuditLog[];
}

export async function createAuditLog(
  supabase: SupabaseClient,
  payload: AuditLogInsert
) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) {
    console.error("Failed to create audit log:", error);
    return null;
  }
  return data as AuditLog;
}

export async function logCreate(
  supabase: SupabaseClient,
  workspaceId: string | null,
  userId: string | null,
  entityType: string,
  entityId: string,
  newData: Record<string, unknown>
) {
  return createAuditLog(supabase, {
    workspace_id: workspaceId,
    user_id: userId,
    action: "create",
    entity_type: entityType,
    entity_id: entityId,
    old_data: null,
    new_data: newData,
  });
}

export async function logUpdate(
  supabase: SupabaseClient,
  workspaceId: string | null,
  userId: string | null,
  entityType: string,
  entityId: string,
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
) {
  return createAuditLog(supabase, {
    workspace_id: workspaceId,
    user_id: userId,
    action: "update",
    entity_type: entityType,
    entity_id: entityId,
    old_data: oldData,
    new_data: newData,
  });
}

export async function logDelete(
  supabase: SupabaseClient,
  workspaceId: string | null,
  userId: string | null,
  entityType: string,
  entityId: string,
  oldData: Record<string, unknown>
) {
  return createAuditLog(supabase, {
    workspace_id: workspaceId,
    user_id: userId,
    action: "delete",
    entity_type: entityType,
    entity_id: entityId,
    old_data: oldData,
    new_data: null,
  });
}
