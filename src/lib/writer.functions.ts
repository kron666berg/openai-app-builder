import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { WRITING_MODES, type WritingMode } from "./writing-modes";

const PROMPTS: Record<WritingMode, string> = {
  improve: "Improve clarity, flow and grammar while keeping the author's voice and meaning.",
  shorten: "Make the text noticeably shorter and tighter without losing key points.",
  expand: "Expand the text with richer detail and supporting sentences, staying on topic.",
  formal: "Rewrite the text in a polished, professional, formal tone.",
  casual: "Rewrite the text in a warm, friendly, conversational tone.",
};

export const rewriteText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        mode: z.enum(WRITING_MODES.map((m) => m.id) as [WritingMode, ...WritingMode[]]),
        text: z.string().trim().min(1).max(8000),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    let output = "";
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: `You are a skilled writing editor. ${PROMPTS[data.mode]} Reply with only the rewritten text, no preamble or quotes.`,
        input: data.text,
      });
      for (const item of res.output) {
        if (item.type === "message") {
          for (const c of item.content) if (c.type === "output_text") output += c.text;
        }
      }
    } catch (e) {
      if (e instanceof GatewayError) {
        console.error("AI error", e.code, e.ids);
        if (e.httpStatus === 429) throw new Error("Too many requests right now. Please wait a moment.");
        if (e.httpStatus === 402) throw new Error("AI credits have run out for this app.");
        throw new Error("The writing assistant couldn't respond. Please try again.");
      }
      throw e;
    }
    output = output.trim();
    if (!output) throw new Error("The assistant returned an empty result. Please try again.");

    const { data: row, error } = await context.supabase
      .from("drafts")
      .insert({ user_id: context.userId, mode: data.mode, input: data.text, output })
      .select()
      .single();
    if (error) {
      console.error(error);
      throw new Error("Rewrite worked, but saving to your history failed.");
    }
    return row;
  });
