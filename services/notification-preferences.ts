import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationPreferences, NotificationPreferencesInsert } from "@/types";

const TABLE = "notification_preferences";

export async function getPreferences(
  supabase: SupabaseClient,
  userId: string
): Promise<NotificationPreferences | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message ?? "Failed to load preferences");
  return data as NotificationPreferences | null;
}

export async function upsertPreferences(
  supabase: SupabaseClient,
  userId: string,
  prefs: Partial<NotificationPreferencesInsert>
) {
  const existing = await getPreferences(supabase, userId);

  if (existing) {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ ...prefs, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw new Error(error.message ?? "Failed to update preferences");
    return data as NotificationPreferences;
  } else {
    const defaults: NotificationPreferencesInsert = {
      user_id: userId,
      email_overdue_decisions: true,
      email_weekly_digest: true,
      email_scorecard_reminder: true,
      email_kr_at_risk: true,
      ...prefs,
    };
    const { data, error } = await supabase
      .from(TABLE)
      .insert(defaults)
      .select()
      .single();
    if (error) throw new Error(error.message ?? "Failed to create preferences");
    return data as NotificationPreferences;
  }
}

export async function getOrCreatePreferences(
  supabase: SupabaseClient,
  userId: string
): Promise<NotificationPreferences> {
  const existing = await getPreferences(supabase, userId);
  if (existing) return existing;

  const defaults: NotificationPreferencesInsert = {
    user_id: userId,
    email_overdue_decisions: true,
    email_weekly_digest: true,
    email_scorecard_reminder: true,
    email_kr_at_risk: true,
  };
  const { data, error } = await supabase
    .from(TABLE)
    .insert(defaults)
    .select()
    .single();
  if (error) throw new Error(error.message ?? "Failed to create preferences");
  return data as NotificationPreferences;
}
