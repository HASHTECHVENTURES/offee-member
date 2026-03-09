import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupportRequest, SupportRequestInsert } from "@/types";

const TABLE = "support_requests";

const SLA_HOURS = 24;

export async function getSupportRequests(
  supabase: SupabaseClient,
  filters?: {
    workspace_id?: string;
    requester_id?: string;
    support_owner_id?: string;
    status?: SupportRequest["status"];
  }
) {
  let query = supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.workspace_id) query = query.eq("workspace_id", filters.workspace_id);
  if (filters?.requester_id) query = query.eq("requester_id", filters.requester_id);
  if (filters?.support_owner_id) query = query.eq("support_owner_id", filters.support_owner_id);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message ?? "Failed to load support requests");
  return (data ?? []) as SupportRequest[];
}

export async function createSupportRequest(
  supabase: SupabaseClient,
  payload: SupportRequestInsert
) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create request");
  return data as SupportRequest;
}

export async function respondToRequest(
  supabase: SupabaseClient,
  id: string,
  response: {
    response_type: SupportRequest["response_type"];
    response_evidence_link?: string;
    response_committed_date?: string;
    response_reject_reason?: string;
    response_alternative?: string;
  }
) {
  const now = new Date();
  
  // Check SLA breach
  const existing = await supabase.from(TABLE).select("created_at").eq("id", id).single();
  let slaBr = false;
  if (existing.data) {
    const created = new Date(existing.data.created_at);
    const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    slaBr = hoursDiff > SLA_HOURS;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      ...response,
      responded_at: now.toISOString(),
      sla_breached: slaBr,
      status: "responded",
      updated_at: now.toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message ?? "Failed to respond to request");
  return data as SupportRequest;
}

export async function closeRequest(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status: "closed", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to close request");
  return data as SupportRequest;
}

export async function getOwnerSLAStats(
  supabase: SupabaseClient,
  ownerId: string,
  monthStart: string
) {
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);
  monthEnd.setDate(0);

  const { data, error } = await supabase
    .from(TABLE)
    .select("id, sla_breached, responded_at")
    .eq("support_owner_id", ownerId)
    .gte("created_at", monthStart)
    .lte("created_at", monthEnd.toISOString());

  if (error) throw new Error(error.message ?? "Failed to load SLA stats");

  const requests = data ?? [];
  const total = requests.length;
  const responded = requests.filter((r) => r.responded_at).length;
  const breached = requests.filter((r) => r.sla_breached).length;
  const slaPct = total > 0 ? Math.round((responded - breached) / total * 100) : 100;

  return { total, responded, breached, slaPct };
}
