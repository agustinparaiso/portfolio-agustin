import { GoogleGenerativeAI } from "@google/generative-ai";
import { AdapterInput, AiAdapter } from "../types.js";
import { formatPrompt } from "../utils/parsing.js";

export function createGeminiAdapter(apiKey: string, model: string): AiAdapter {
  const genAI = new GoogleGenerativeAI(apiKey);
  const client = genAI.getGenerativeModel({ model });

  return {
    async generate({ prompt, mode, userCode, onChunk, stream }: AdapterInput): Promise<string> {
      const systemPrompt = formatPrompt(mode, userCode);
      const contents = [
        { role: "user", parts: [{ text: `${systemPrompt}\n${prompt}` }] },
      ];

      if (stream && onChunk) {
        const result = await client.generateContentStream({ contents });
        let fullText = "";
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
          onChunk(chunkText);
        }
        return fullText;
      }

      const result = await client.generateContent({ contents });
      return result.response.text();
    },
  };
}
