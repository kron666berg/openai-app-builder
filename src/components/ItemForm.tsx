import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { itemSchema, type ItemInput } from "@/lib/items";

type Props = {
  initial?: ItemInput;
  submitLabel: string;
  pending: boolean;
  onSubmit: (values: ItemInput) => void;
  onCancel?: () => void;
};

export function ItemForm({ initial, submitLabel, pending, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<ItemInput>(initial ?? { title: "", content: "", url: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof ItemInput, string>>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = itemSchema.safeParse(values);
    if (!r.success) {
      const errs: typeof errors = {};
      for (const issue of r.error.issues) errs[issue.path[0] as keyof ItemInput] ??= issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    onSubmit(values);
  }

  const set = (k: keyof ItemInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues({ ...values, [k]: e.target.value });

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={values.title} onChange={set("title")} maxLength={200} aria-invalid={!!errors.title} />
        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" value={values.content} onChange={set("content")} className="min-h-40" aria-invalid={!!errors.content} />
        {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="url">URL (optional)</Label>
        <Input id="url" type="url" inputMode="url" placeholder="https://" value={values.url ?? ""} onChange={set("url")} aria-invalid={!!errors.url} />
        {errors.url && <p className="text-sm text-destructive">{errors.url}</p>}
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}
