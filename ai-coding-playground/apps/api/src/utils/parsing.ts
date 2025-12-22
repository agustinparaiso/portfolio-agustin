import { StructuredAiOutput, structuredAiOutputSchema } from "@ai-playground/shared";
import { AiMode } from "../types.js";

function cleanJson(text: string): string {
  return text
    // Replace unescaped newlines inside quotes
    .replace(/(?<=[:,"\[])\s*"(.*?)"(?=\s*[,\]\}])/gs, (match, content) => {
      return `"${content.replace(/\n/g, "\\n").replace(/\r/g, "\\r")}"`;
    })
    // Remove potential trailing commas
    .replace(/,\s*([\]\}])/g, "$1")
    .trim();
}

export function parseStructuredOutput(raw: string | StructuredAiOutput): StructuredAiOutput {
  if (typeof raw !== "string") {
    return structuredAiOutputSchema.parse(raw);
  }

  const normalized = raw.trim();

  const tryParse = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      // Normalize complexity if it's an object (common Gemini behavior)
      if (parsed.complexity && typeof parsed.complexity === "object") {
        const { time, space } = parsed.complexity;
        parsed.complexity = `Time: ${time || "?"}, Space: ${space || "?"}`;
      }
      return structuredAiOutputSchema.parse(parsed);
    } catch {
      try {
        // Second attempt with cleaning
        const parsed = JSON.parse(cleanJson(text));
        if (parsed.complexity && typeof parsed.complexity === "object") {
          const { time, space } = parsed.complexity;
          parsed.complexity = `Time: ${time || "?"}, Space: ${space || "?"}`;
        }
        return structuredAiOutputSchema.parse(parsed);
      } catch {
        return null;
      }
    }
  };

  // 1. Try direct parse
  const direct = tryParse(normalized);
  if (direct) return direct;

  // 2. Try to extract from markdown blocks (handle nested or multiple blocks)
  const blockMatches = [...normalized.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)];
  for (const match of blockMatches) {
    const fromBlock = tryParse(match[1].trim());
    if (fromBlock) return fromBlock;
  }

  // 3. Try generic brace match (greediest block)
  const braceMatch = normalized.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    const fromBrace = tryParse(braceMatch[0]);
    if (fromBrace) return fromBrace;
  }

  return toStructuredFallback(normalized, "No se pudo extraer JSON válido de la respuesta.");
}

export function toStructuredFallback(explanation: string, note: string): StructuredAiOutput {
  return structuredAiOutputSchema.parse({
    code: "",
    explanation,
    tests: [],
    complexity: "desconocida",
    notes: [note],
  });
}

export function formatPrompt(mode: AiMode, userCode?: string): string {
  const base = `Eres un asistente experto en programación JavaScript para un entorno interactivo (playground).
Debes responder SIEMPRE con un objeto JSON estructurado que contenga:
- code: Implementación en JavaScript (ES6+).
- explanation: Explicación clara en ESPAÑOL.
- tests: Array de strings con pruebas usando 'assert(condicion, mensaje)'.
- complexity: Cadena de texto breve (ej. "Time: O(n), Space: O(1)").
- notes: Array de consideraciones técnicas en ESPAÑOL.

### REGLAS CRÍTICAS:
1. ¡NUNCA traduzcas palabras clave de JavaScript! (ej. NO uses 'en lugar de', 'para', 'devolver'). Mantén 'for', 'let', 'const', 'return', etc.
2. Si la solicitud es una NUEVA tarea no relacionada con el código previo, ignora el código previo y enfócate en lo nuevo.
3. Responde ÚNICAMENTE con el objeto JSON, preferiblemente sin bloques de markdown adicionales.
4. Asegúrate de que el JSON sea válido y esté bien formado.`;

  const modeHint = {
    generate: "Objetivo: Implementar o mejorar según las instrucciones.",
    explain_failure: "Objetivo: Depurar el código del usuario, explicar el error y proporcionar corrección.",
  }[mode];

  const codeBlock = userCode ? `\n\n### Código actual del usuario (Contexto):\n${userCode}\n` : "";

  return `${base}\n\nMODO: ${modeHint}${codeBlock}`;
}
