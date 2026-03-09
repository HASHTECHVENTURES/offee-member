import { supabase } from "@/lib/supabase-browser";
import { okrService } from "@/services";
import type { OKRInsert } from "@/types";

export async function createOkrAction(payload: OKRInsert) {
  const okr = await okrService.createOkr(supabase, payload);
  return { okr, error: null };
}

export async function updateOkrAction(
  id: string,
  payload: Partial<OKRInsert>
) {
  const okr = await okrService.updateOkr(supabase, id, payload);
  return { okr, error: null };
}

export async function deleteOkrAction(id: string) {
  await okrService.deleteOkr(supabase, id);
  return { error: null };
}
