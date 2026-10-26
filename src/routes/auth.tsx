import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import "@lovable.dev/cloud-auth-js/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Quill" },
      { name: "description", content: "Sign in to Quill to rewrite text and keep your history." },
      { property: "og:title", content: "Sign in — Quill" },
      { property: "og:description", content: "Sign in to Quill, your AI writing helper." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "up") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/write" },
      });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return toast.error(error.message);
      navigate({ to: "/write" });
    }
  }

  async function social(provider: "google" | "lovable") {
    const r = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (r.error) return toast.error(r.error.message ?? "Sign-in failed");
    if (r.redirected) return;
    navigate({ to: "/write" });
  }

  return (
    <main className="paper-bg flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display text-4xl text-foreground">Quill</Link>
        <h1 className="mt-6 font-display text-3xl text-foreground">
          {mode === "in" ? "Welcome back" : "Create your account"}
        </h1>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === "in" ? "Sign in" : "Sign up"}
          </Button>
        </form>
        <div className="my-5 text-center text-xs uppercase tracking-widest text-muted-foreground">or</div>
        <div className="space-y-3">
          <Button variant="outline" className="w-full" onClick={() => social("google")}>Continue with Google</Button>
          <button type="button" className="lovable-auth-button w-full" onClick={() => social("lovable")}>
            Continue with Lovable
          </button>
        </div>
        <button
          type="button"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="mt-6 text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
