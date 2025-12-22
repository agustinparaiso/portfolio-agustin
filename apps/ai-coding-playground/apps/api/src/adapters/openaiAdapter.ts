import OpenAI from "openai";
import { StructuredAiOutput } from "@ai-playground/shared";
import { AdapterInput, AiAdapter } from "../types.js";
import { formatPrompt, toStructuredFallback } from "../utils/parsing.js";

export function createOpenAiAdapter(apiKey: string, model: string): AiAdapter {
  const client = new OpenAI({ apiKey });

  return {
    async generate({ prompt, mode, userCode, stream = false, onChunk }: AdapterInput): Promise<string> {
      const systemPrompt = formatPrompt(mode, userCode);

      if (stream) {
        const streamResponse = await client.responses.create({
          model,
          input: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          stream: true,
        });

        let aggregated = "";
        for await (const event of streamResponse) {
          if (event.type === "response.output_text.delta" && event.delta) {
            aggregated += event.delta;
            onChunk?.(event.delta);
          }
          if (event.type === "response.output_text" && event.output_text) {
            aggregated += event.output_text;
            onChunk?.(event.output_text);
          }
          if (event.type === "response.completed" && event.response?.output_text) {
            aggregated += event.response.output_text;
          }
        }

        return aggregated || JSON.stringify(toStructuredFallback("", "No streaming output" as unknown as StructuredAiOutput));
      }

      const response = await client.responses.create({
        model,
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });

      const output = (response as any).output_text
        ? (response as any).output_text
        : JSON.stringify((response as any).output?.[0]?.content ?? response);

      return output;
    },
  };
}
