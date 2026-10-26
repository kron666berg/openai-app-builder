import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Stash" },
      { name: "description", content: "Sign in to your personal knowledge library." },
      { property: "og:title", content: "Sign in — Stash" },
      { property: "og:description", content: "Sign in to your personal knowledge library." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/library", replace: true });
    });
  }, [navigate]);

  async function signInWithGoogle() {
    setPending(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Could not sign in with Google. Please try again.");
      setPending(false);
      return;
    }
    if (result.redirected) return; // browser is navigating to Google
    navigate({ to: "/library" });
  }

  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Sign in to Stash</h1>
        <p className="text-sm text-muted-foreground">
          Your library is private — sign in to save and find your items.
        </p>
      </div>
      <Button onClick={signInWithGoogle} disabled={pending} size="lg">
        {pending ? "Redirecting to Google…" : "Continue with Google"}
      </Button>
    </div>
  );
}
