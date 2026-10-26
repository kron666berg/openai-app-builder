import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Trash2, LogOut, Feather } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { rewriteText } from "@/lib/writer.functions";
import { WRITING_MODES, modeLabel, type WritingMode } from "@/lib/writing-modes";

const draftsQuery = queryOptions({
  queryKey: ["drafts"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("drafts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data;
  },
});

export const Route = createFileRoute("/_authenticated/write")({
  head: () => ({
    meta: [
      { title: "Write — Quill" },
      { name: "description", content: "Polish, shorten, expand or change the tone of your writing." },
      { property: "og:title", content: "Write — Quill" },
      { property: "og:description", content: "Your AI writing desk." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(draftsQuery),
  component: WritePage,
});

function WritePage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: drafts } = useSuspenseQuery(draftsQuery);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<WritingMode>("improve");
  const [result, setResult] = useState("");

  const rewrite = useMutation({
    mutationFn: () => rewriteText({ data: { mode, text } }),
    onSuccess: (row) => {
      setResult(row.output);
      qc.invalidateQueries({ queryKey: ["drafts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("drafts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drafts"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const copy = (s: string) => navigator.clipboard.writeText(s).then(() => toast.success("Copied"));

  return (
    <div className="paper-bg min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <span className="flex items-center gap-2 font-display text-3xl text-foreground">
          <Feather className="h-6 w-6 text-primary" /> Quill
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-5 pb-16 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <Textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or write something…"
            className="min-h-48 bg-card text-base leading-relaxed"
          />
          <div className="flex flex-wrap gap-2">
            {WRITING_MODES.map((m) => (
              <Button
                key={m.id}
                size="sm"
                variant={mode === m.id ? "default" : "outline"}
                onClick={() => setMode(m.id)}
              >
                {m.label}
              </Button>
            ))}
          </div>
          <Button
            className="w-full sm:w-auto"
            size="lg"
            disabled={!text.trim() || rewrite.isPending}
            onClick={() => rewrite.mutate()}
          >
            {rewrite.isPending ? "Rewriting…" : `${modeLabel(mode)} my text`}
          </Button>

          {result && (
            <article className="rounded-lg border bg-card p-5 shadow-paper">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-primary">Result</span>
                <Button variant="ghost" size="sm" onClick={() => copy(result)}>
                  <Copy className="h-4 w-4" /> Copy
                </Button>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-card-foreground">{result}</p>
            </article>
          )}
        </section>

        <aside>
          <h2 className="mb-3 font-display text-2xl text-foreground">History</h2>
          {drafts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your rewrites will appear here.</p>
          ) : (
            <ul className="space-y-3">
              {drafts.map((d) => (
                <li key={d.id} className="rounded-md border bg-card p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="text-primary">{modeLabel(d.mode)}</span>
                    <span>{new Date(d.created_at).toLocaleDateString()}</span>
                  </div>
                  <button
                    type="button"
                    className="mt-1 line-clamp-3 text-left text-sm text-card-foreground"
                    onClick={() => {
                      setText(d.input);
                      setResult(d.output);
                    }}
                  >
                    {d.output}
                  </button>
                  <div className="mt-2 flex justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label="Copy" onClick={() => copy(d.output)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove.mutate(d.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </main>
    </div>
  );
}
