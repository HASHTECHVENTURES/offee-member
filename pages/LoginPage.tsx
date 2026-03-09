import { useState } from "react";
import { supabase, hasSupabaseConfig } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCard } from "@/components/design-system/alert-card";
import { Loader2, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_DEMO_EMAIL = "admin@test.com";

type LoginMode = "admin" | "normal";

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<LoginMode>("normal");
  const [email, setEmail] = useState("");

  function switchMode(newMode: LoginMode) {
    setMode(newMode);
    setError(null);
    setEmail(newMode === "admin" ? ADMIN_DEMO_EMAIL : "");
    setTimeout(() => {
      if (newMode === "admin") document.getElementById("password")?.focus();
      else document.getElementById("email")?.focus();
    }, 0);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const emailValue = email.trim() || (form.querySelector('[name="email"]') as HTMLInputElement)?.value?.trim() || "";
    const password = (form.querySelector('[name="password"]') as HTMLInputElement).value;

    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: emailValue, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      const isAdminLogin = emailValue.toLowerCase() === ADMIN_DEMO_EMAIL.toLowerCase();
      window.location.href = isAdminLogin ? "/admin" : "/workspace";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">
            O
          </div>
          <h1 className="text-xl font-bold text-foreground">Offee</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue</p>
        </div>

        {!hasSupabaseConfig && (
          <AlertCard
            variant="warning"
            title="Supabase not configured"
            description="Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local (copy from env.example). Sign-in will not work until then."
          />
        )}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {/* Admin vs Normal login toggle */}
          <div className="mb-6 flex rounded-lg border border-border bg-muted/50 p-1">
            <button
              type="button"
              onClick={() => switchMode("normal")}
              disabled={!hasSupabaseConfig}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-colors",
                mode === "normal"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="size-4" />
              Team member
            </button>
            <button
              type="button"
              onClick={() => switchMode("admin")}
              disabled={!hasSupabaseConfig}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-colors",
                mode === "admin"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Shield className="size-4" />
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={mode === "admin" ? ADMIN_DEMO_EMAIL : "you@company.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={mode === "admin"}
                required
                autoComplete="email"
                autoFocus={mode === "normal"}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="h-11"
              />
            </div>

            {error && (
              <AlertCard
                variant="critical"
                title="Sign in failed"
                description={error}
              />
            )}

            <Button type="submit" className="w-full h-11" disabled={loading || !hasSupabaseConfig}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : mode === "admin" ? (
                "Sign in as admin"
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
