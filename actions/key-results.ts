import { supabase } from "@/lib/supabase-browser";
import { keyResultService, okrService } from "@/services";
import type { KeyResult, KeyResultInsert } from "@/types";

function deriveKRStatus(
  currentValue: number,
  targetValue: number,
  existingStatus: KeyResult["status"]
): KeyResult["status"] {
  if (!targetValue || targetValue === 0) return existingStatus;
  const pct = (Number(currentValue) / Number(targetValue)) * 100;
  if (pct >= 100) return "completed";
  if (pct >= 80) return "on_track";
  if (pct >= 50) return "at_risk";
  if (pct > 0) return "behind";
  return existingStatus === "completed" ? "not_started" : existingStatus;
}

async function recalcOkrProgress(okrId: string) {
  try {
    const krs = await keyResultService.getKeyResults(supabase, { okr_id: okrId });
    if (krs.length === 0) {
      await okrService.updateOkr(supabase, okrId, { progress_percent: 0 });
      return;
    }
    const total = krs.reduce((sum, kr) => {
      if (!kr.target_value || kr.target_value === 0) return sum;
      const pct = Math.min(100, (Number(kr.current_value) / Number(kr.target_value)) * 100);
      return sum + pct;
    }, 0);
    const validKrs = krs.filter((kr) => kr.target_value && kr.target_value !== 0);
    const avg = validKrs.length > 0 ? Math.round(total / validKrs.length) : 0;
    const allCompleted = validKrs.length > 0 && krs.every((kr) => kr.status === "completed");
    await okrService.updateOkr(supabase, okrId, {
      progress_percent: avg,
      ...(allCompleted ? { status: "completed" } : {}),
    });
  } catch {
    // Non-fatal
  }
}

export async function createKeyResultAction(payload: KeyResultInsert) {
  const kr = await keyResultService.createKeyResult(supabase, payload);
  await recalcOkrProgress(kr.okr_id);
  return { keyResult: kr, error: null };
}

export async function updateKeyResultAction(
  id: string,
  payload: Partial<KeyResultInsert>
) {
  const existing = await keyResultService.getKeyResultById(supabase, id);
  let enrichedPayload = { ...payload };
  if (payload.current_value !== undefined || payload.target_value !== undefined) {
    const currentValue = payload.current_value ?? existing.current_value;
    const targetValue = payload.target_value ?? existing.target_value;
    const autoStatus = deriveKRStatus(
      Number(currentValue),
      Number(targetValue),
      existing.status
    );
    if (!payload.status) {
      enrichedPayload = { ...enrichedPayload, status: autoStatus };
    }
  }
  const kr = await keyResultService.updateKeyResult(supabase, id, enrichedPayload);
  await recalcOkrProgress(kr.okr_id);
  return { keyResult: kr, error: null };
}

export async function deleteKeyResultAction(id: string) {
  const kr = await keyResultService.getKeyResultById(supabase, id);
  await keyResultService.deleteKeyResult(supabase, id);
  if (kr?.okr_id) await recalcOkrProgress(kr.okr_id);
  return { error: null };
}
