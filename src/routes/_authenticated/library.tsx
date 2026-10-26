import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { filterItems, itemKeys, listItems } from "@/lib/items";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({
    meta: [
      { title: "Library — Stash" },
      { name: "description", content: "Your personal knowledge library: save and find useful information in one place." },
      { property: "og:title", content: "Library — Stash" },
      { property: "og:description", content: "Save and find useful information in one place." },
    ],
  }),
  component: Library,
});

function Library() {
  const [q, setQ] = useState("");
  const { data, isPending, error, refetch } = useQuery({ queryKey: itemKeys.all, queryFn: listItems });
  const items = data ? filterItems(data, q) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Library</h1>
        <Button asChild size="sm"><Link to="/new"><Plus className="h-4 w-4" /> Add</Link></Button>
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" placeholder="Search title, content or URL" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" aria-label="Search items" />
      </div>

      {isPending ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : error ? (
        <div className="rounded-md border border-destructive/40 p-4 text-sm">
          <p className="text-destructive">{error.message}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nothing saved yet. <Link to="/new" className="text-primary underline">Add your first item</Link>.
        </div>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No items match “{q}”.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.id}>
              <Link to="/items/$id" params={{ id: i.id }} className="block rounded-md border bg-card p-4 transition-colors hover:bg-accent">
                <p className="font-medium">{i.title}</p>
                {i.content && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{i.content}</p>}
                {i.url && <p className="mt-1 truncate text-xs text-primary">{i.url}</p>}
                <p className="mt-2 text-xs text-muted-foreground">{new Date(i.created_at).toLocaleDateString()}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
