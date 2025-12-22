import { GoogleGenerativeAI } from "@google/generative-ai";
import { AdapterInput, AiAdapter } from "../types.js";
import { formatPrompt } from "../utils/parsing.js";

export function createGeminiAdapter(apiKey: string, model: string): AiAdapter {
  const genAI = new GoogleGenerativeAI(apiKey);
  const client = genAI.getGenerativeModel({ model });

  return {
    async generate({ prompt, mode, userCode }: AdapterInput): Promise<string> {
      const systemPrompt = formatPrompt(mode, userCode);
      const result = await client.generateContent({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n${prompt}` }] },
        ],
      });

      return result.response.text();
    },
  };
}
