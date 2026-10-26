import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { filterItems, itemSchema, type Item } from "@/lib/items";

const mk = (title: string, content = "", url: string | null = null) =>
  ({ id: title, title, content, url, owner_id: null, created_at: "", updated_at: "" }) as Item;

describe("items", () => {
  const items = [mk("Recipes", "pasta"), mk("Docs", "", "https://react.dev")];
  it("searches title", () => expect(filterItems(items, "recip").map((i) => i.id)).toEqual(["Recipes"]));
  it("searches content", () => expect(filterItems(items, "PASTA").map((i) => i.id)).toEqual(["Recipes"]));
  it("searches url", () => expect(filterItems(items, "react.dev").map((i) => i.id)).toEqual(["Docs"]));
  it("requires a title", () => expect(itemSchema.safeParse({ title: "  ", content: "", url: "" }).success).toBe(false));
  it("rejects invalid url", () => expect(itemSchema.safeParse({ title: "a", content: "", url: "nope" }).success).toBe(false));
  it("empty url becomes null", () => expect(itemSchema.parse({ title: "a", content: "", url: "" }).url).toBeNull());
});
