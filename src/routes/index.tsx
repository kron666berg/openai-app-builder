import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stash — personal knowledge library" },
      { name: "description", content: "Save and find useful information in one place. Your private knowledge library." },
      { property: "og:title", content: "Stash — personal knowledge library" },
      { property: "og:description", content: "Save and find useful information in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Stash</h1>
        <p className="mx-auto max-w-md text-muted-foreground">
          Your personal knowledge library. Save notes and links, find them instantly — private to your account.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild size="lg"><Link to="/library">Open your library</Link></Button>
        <Button asChild variant="outline" size="lg"><Link to="/auth">Sign in</Link></Button>
      </div>
    </div>
  );
}
