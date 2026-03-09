import type { User as SupabaseUser } from "@supabase/supabase-js";

export type { SupabaseUser as AuthUser };

export interface AuthSession {
  user: SupabaseUser;
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}
