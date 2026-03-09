import { supabase } from "@/lib/supabase-browser";
import { decisionService } from "@/services";
import type { DecisionInsert } from "@/types";

export async function createDecisionAction(payload: DecisionInsert) {
  const enriched = {
    ...payload,
    decided_at:
      payload.status === "decided"
        ? payload.decided_at ?? new Date().toISOString()
        : payload.decided_at ?? null,
  };
  const decision = await decisionService.createDecision(supabase, enriched);
  return { decision, error: null };
}

export async function updateDecisionAction(
  id: string,
  payload: Partial<DecisionInsert>
) {
  const enriched: Partial<DecisionInsert> = { ...payload };
  if (payload.status === "decided" && !payload.decided_at) {
    const existing = await decisionService.getDecisionById(supabase, id);
    enriched.decided_at = existing.decided_at ?? new Date().toISOString();
  }
  const decision = await decisionService.updateDecision(supabase, id, enriched);
  return { decision, error: null };
}

export async function deleteDecisionAction(id: string) {
  await decisionService.deleteDecision(supabase, id);
  return { error: null };
}
