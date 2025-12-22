import { z } from "zod";

export const structuredAiOutputSchema = z.object({
  code: z.string().default(""),
  explanation: z.string().default(""),
  tests: z.array(z.string()).default([]),
  complexity: z.string().default(""),
  notes: z.array(z.string()).default([]),
});

export type StructuredAiOutput = z.infer<typeof structuredAiOutputSchema>;

export const aiRequestSchema = z.object({
  provider: z.enum(["openai", "gemini"]),
  mode: z.enum(["generate", "compare", "explain_failure"]),
  prompt: z.string().min(1),
  userCode: z.string().optional(),
  language: z.literal("javascript"),
  stream: z.boolean().default(false),
});

export type AiRequestBody = z.infer<typeof aiRequestSchema>;

export const runRequestSchema = z.object({
  code: z.string().min(1),
  tests: z.array(z.string()).optional(),
});

export type RunRequestBody = z.infer<typeof runRequestSchema>;

export const sandboxTestResultSchema = z.object({
  name: z.string(),
  passed: z.boolean(),
  error: z.string().nullable(),
});

export const sandboxResponseSchema = z.object({
  stdout: z.string(),
  stderr: z.string(),
  tests: z.array(sandboxTestResultSchema),
  runtimeMs: z.number(),
});

export type SandboxResponse = z.infer<typeof sandboxResponseSchema>;
export type SandboxTestResult = z.infer<typeof sandboxTestResultSchema>;

export const errorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export const envConfigSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  PORT: z.string().default("4000"),
  WEB_ORIGIN: z.string().default("http://localhost:5173"),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  GEMINI_MODEL: z.string().default("gemini-1.5-flash"),
});

export type EnvConfig = z.infer<typeof envConfigSchema>;
