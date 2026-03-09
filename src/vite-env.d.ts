/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** Set per deployment for "4 different websites": admin | ceo | leader | member. */
  readonly VITE_APP_ROLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
