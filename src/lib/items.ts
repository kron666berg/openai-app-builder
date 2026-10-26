// Data layer for saved items. Keep all storage access here so
// file uploads and semantic search can be added without touching the UI.
// Rows are scoped to the signed-in user by RLS (owner_id = auth.uid()).
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Item = Tables<"items">;

export const itemSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be under 200 characters"),
  content: z.string().trim().max(20000, "Content must be under 20,000 characters"),
  url: z
    .string()
    .trim()
    .max(2000, "URL is too long")
    .refine((v) => v === "" || /^https?:\/\/\S+\.\S+/i.test(v), "Enter a valid URL starting with http:// or https://")
    .transform((v) => (v === "" ? null : v)),
});
export type ItemInput = z.input<typeof itemSchema>;

export const itemKeys = { all: ["items"] as const, one: (id: string) => ["items", id] as const };

export async function listItems(): Promise<Item[]> {
  const { data, error } = await supabase.from("items").select("*").order("created_at", { ascending: false });
  if (error) throw new Error("Could not load your library.");
  return data;
}

export async function getItem(id: string): Promise<Item | null> {
  const { data, error } = await supabase.from("items").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("Could not load this item.");
  return data;
}

export async function createItem(input: ItemInput): Promise<Item> {
  const values = itemSchema.parse(input);
  const { data, error } = await supabase.from("items").insert(values).select().single();
  if (error) throw new Error("Could not save the item.");
  return data;
}

export async function updateItem(id: string, input: ItemInput): Promise<Item> {
  const values = itemSchema.parse(input);
  const { data, error } = await supabase.from("items").update(values).eq("id", id).select().single();
  if (error) throw new Error("Could not update the item.");
  return data;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw new Error("Could not delete the item.");
}

/** Client-side text filter; swap for semantic search later. */
export function filterItems(items: Item[], query: string): Item[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((i) =>
    [i.title, i.content, i.url ?? ""].some((f) => f.toLowerCase().includes(q)),
  );
}
