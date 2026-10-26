export const WRITING_MODES = [
  { id: "improve", label: "Polish" },
  { id: "shorten", label: "Shorten" },
  { id: "expand", label: "Expand" },
  { id: "formal", label: "Formal" },
  { id: "casual", label: "Casual" },
] as const;

export type WritingMode = (typeof WRITING_MODES)[number]["id"];

export const modeLabel = (id: string) => WRITING_MODES.find((m) => m.id === id)?.label ?? id;
