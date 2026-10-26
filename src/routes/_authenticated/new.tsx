import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ItemForm } from "@/components/ItemForm";
import { createItem, itemKeys } from "@/lib/items";

export const Route = createFileRoute("/_authenticated/new")({
  head: () => ({
    meta: [
      { title: "Add item — Stash" },
      { name: "description", content: "Save a new note or link to your knowledge library." },
      { property: "og:title", content: "Add item — Stash" },
      { property: "og:description", content: "Save a new note or link." },
    ],
  }),
  component: NewItem,
});

function NewItem() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: itemKeys.all });
      toast.success("Saved");
      navigate({ to: "/library" });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Add item</h1>
      <ItemForm submitLabel="Save" pending={m.isPending} onSubmit={(v) => m.mutate(v)} onCancel={() => navigate({ to: "/library" })} />
    </div>
  );
}
