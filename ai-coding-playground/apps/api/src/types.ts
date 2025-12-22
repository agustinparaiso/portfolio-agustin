import { StructuredAiOutput } from "@ai-playground/shared";

export type AiMode = "generate" | "compare" | "explain_failure";

export interface AdapterInput {
  prompt: string;
  mode: AiMode;
  userCode?: string;
  stream?: boolean;
  onChunk?: (text: string) => void;
}

export interface AiAdapter {
  generate(input: AdapterInput): Promise<string>;
}

export interface ProviderConfig {
  name: "openai" | "gemini";
  supportsStreaming: boolean;
  adapter: AiAdapter;
}
