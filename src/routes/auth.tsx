import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signIn, signUp } from "@/lib/supabase/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Clarity" }] }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signin") {
        const { user, error: authError } = await signIn(email, password);
        if (authError) {
          setError(authError.message);
        } else if (user) {
          navigate({ to: "/dashboard" });
        }
      } else {
        const { user, error: authError } = await signUp(email, password, fullName);
        if (authError) {
          setError(authError.message);
        } else if (user) {
          setError("Check your email to confirm your account");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left panel — brand */}
      <div className="hidden md:flex flex-col justify-between p-10 bg-primary text-primary-foreground">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="size-6 bg-primary-foreground rounded flex items-center justify-center">
            <div className="size-2 bg-primary rounded-full" />
          </div>
          <span className="font-semibold tracking-tight text-lg">Clarity</span>
        </Link>

        <div className="space-y-6 max-w-md">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">
            A work OS for remote professionals
          </p>
          <h1 className="text-3xl md:text-4xl font-light leading-tight">
            Every meeting automatically becomes organized work.
          </h1>
          <p className="text-sm opacity-80 leading-relaxed">
            Transcripts, decisions, action items, and follow-up drafts — sorted
            into the right drawer, quietly, in one calm workspace.
          </p>
        </div>

        <p className="text-xs opacity-60">© Clarity 2026</p>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <h2 className="text-2xl font-medium tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "signin"
                ? "Sign in to keep your meetings organized."
                : "Get started free. No credit card required."}
            </p>
          </div>

          <button className="w-full inline-flex items-center justify-center gap-2 py-2.5 border border-border rounded-full text-sm font-medium bg-background hover:bg-surface transition-colors">
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              or
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" ? (
              <Input
                label="Full name"
                type="text"
                placeholder="Sarah Chen"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            ) : null}
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Loading..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            {mode === "signin" ? "New to Clarity?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-foreground underline underline-offset-4"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  type,
  placeholder,
  value,
  onChange,
  required = false,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-foreground/30 transition-colors"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
