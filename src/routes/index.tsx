import { createFileRoute, Link } from "@tanstack/react-router";
import { Feather } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quill — AI writing helper" },
      { name: "description", content: "Polish, shorten, expand or re-tone your writing with AI. Every rewrite saved." },
      { property: "og:title", content: "Quill — AI writing helper" },
      { property: "og:description", content: "Better words, in one click. Every rewrite saved to your history." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="paper-bg flex min-h-screen flex-col px-6 py-8">
      <span className="flex items-center gap-2 font-display text-3xl text-foreground">
        <Feather className="h-6 w-6 text-primary" /> Quill
      </span>
      <div className="mx-auto my-auto max-w-2xl py-16 text-center">
        <h1 className="font-display text-6xl leading-[0.95] text-foreground sm:text-8xl">
          Better words, <em className="text-primary">one click</em>.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-muted-foreground">
          Paste your draft. Polish it, shorten it, expand it, or change its tone. Every version is kept.
        </p>
        <Button asChild size="lg" className="mt-10">
          <Link to="/write">Start writing</Link>
        </Button>
      </div>
    </main>
  );
}
