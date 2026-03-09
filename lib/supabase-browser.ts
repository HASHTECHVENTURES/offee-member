import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL ?? "").trim();
const supabaseAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY ?? "").trim();

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

// Use placeholder values when env is missing so the app loads; show setup message in UI
const url = supabaseUrl || "https://replace-me.supabase.co";
const key = supabaseAnonKey || "replace-with-your-anon-key-in-env-local";

if (!hasSupabaseConfig) {
  console.warn(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy env.example to .env.local and add your Supabase project URL and anon key."
  );
}

export const supabase: SupabaseClient = createClient(url, key);
