import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ItemForm } from "@/components/ItemForm";
import { deleteItem, getItem, itemKeys, updateItem, type ItemInput } from "@/lib/items";

export const Route = createFileRoute("/items/$id")({
  head: () => ({
    meta: [
      { title: "Item — Stash" },
      { name: "description", content: "View and edit a saved item." },
      { property: "og:title", content: "Item — Stash" },
      { property: "og:description", content: "A saved item in your knowledge library." },
    ],
  }),
  component: ItemPage,
});

function ItemPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const { data: item, isPending, error, refetch } = useQuery({ queryKey: itemKeys.one(id), queryFn: () => getItem(id) });

  const save = useMutation({
    mutationFn: (v: ItemInput) => updateItem(id, v),
    onSuccess: (row) => {
      qc.setQueryData(itemKeys.one(id), row);
      qc.invalidateQueries({ queryKey: itemKeys.all, exact: true });
      setEditing(false);
      toast.success("Updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: () => deleteItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemKeys.all });
      toast.success("Deleted");
      navigate({ to: "/" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const back = (
    <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="h-4 w-4" /> Library
    </Link>
  );

  if (isPending) return <div className="space-y-3">{back}<Skeleton className="h-8 w-2/3" /><Skeleton className="h-40 w-full" /></div>;
  if (error)
    return (
      <div className="space-y-3">{back}
        <p className="text-destructive">{error.message}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
      </div>
    );
  if (!item) return <div className="space-y-3">{back}<p className="text-muted-foreground">This item doesn't exist or was deleted.</p></div>;

  if (editing)
    return (
      <div className="space-y-4">{back}
        <h1 className="text-2xl font-semibold">Edit item</h1>
        <ItemForm
          initial={{ title: item.title, content: item.content, url: item.url ?? "" }}
          submitLabel="Save changes"
          pending={save.isPending}
          onSubmit={(v) => save.mutate(v)}
          onCancel={() => setEditing(false)}
        />
      </div>
    );

  return (
    <article className="space-y-4">
      {back}
      <h1 className="break-words text-2xl font-semibold">{item.title}</h1>
      {item.url && (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="block break-all text-sm text-primary underline">
          {item.url}
        </a>
      )}
      {item.content ? (
        <p className="whitespace-pre-wrap break-words leading-relaxed">{item.content}</p>
      ) : (
        <p className="text-sm text-muted-foreground">No content.</p>
      )}
      <p className="text-xs text-muted-foreground">
        Added {new Date(item.created_at).toLocaleString()}
        {item.updated_at !== item.created_at && ` · Edited ${new Date(item.updated_at).toLocaleString()}`}
      </p>
      <div className="flex gap-2">
        <Button onClick={() => setEditing(true)}>Edit</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="destructive" disabled={del.isPending}>Delete</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this item?</AlertDialogTitle>
              <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => del.mutate()}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  );
}
