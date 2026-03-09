import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ezjmjuldhhimtekkpkwm.supabase.co";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!anon) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(url, anon);

const { data, error } = await supabase.auth.signInWithPassword({
  email: "admin@test.com",
  password: "Test1234",
});

if (error) {
  console.error("Login FAILED:", error.message);
  process.exit(1);
}

console.log("Login OK: user id =", data.user?.id ?? "—");
process.exit(0);
