import { StructuredAiOutput, structuredAiOutputSchema } from "@ai-playground/shared";
import { AiMode } from "../types.js";

export function parseStructuredOutput(raw: string | StructuredAiOutput): StructuredAiOutput {
  if (typeof raw !== "string") {
    return structuredAiOutputSchema.parse(raw);
  }

  const normalized = raw.trim();

  const tryParse = (text: string) => {
    try {
      return structuredAiOutputSchema.parse(JSON.parse(text));
    } catch {
      return null;
    }
  };

  const direct = tryParse(normalized);
  if (direct) return direct;

  const match = normalized.match(/\{[\s\S]*\}/);
  if (match) {
    const fallback = tryParse(match[0]);
    if (fallback) return fallback;
  }

  return toStructuredFallback(normalized, "Failed to parse AI response");
}

export function toStructuredFallback(explanation: string, note: string): StructuredAiOutput {
  return structuredAiOutputSchema.parse({
    code: "",
    explanation,
    tests: [],
    complexity: "unknown",
    notes: [note],
  });
}

export function formatPrompt(mode: AiMode, userCode?: string): string {
  const base = `You are an AI coding assistant for a JavaScript playground. Always respond with JSON containing keys: code (string), explanation (string), tests (array of strings), complexity (string), notes (array of strings). If you cannot comply, still return valid JSON.`;

  const modeHint = {
    generate: "Generate an improved solution.",
    compare: "Compare the provided user code with best practices and propose improvements.",
    explain_failure: "Explain why the provided user code fails and propose fixes.",
  }[mode];

  const codeBlock = userCode ? `\nUser code:\n${userCode}\n` : "";

  return `${base}\nMode: ${modeHint}${codeBlock}`;
}
