import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import {
  aiRequestSchema,
  runRequestSchema,
  structuredAiOutputSchema,
  errorResponseSchema,
} from "@ai-playground/shared";
import { createOpenAiAdapter } from "./adapters/openaiAdapter.js";
import { createGeminiAdapter } from "./adapters/geminiAdapter.js";
import { loadEnv } from "./utils/env.js";
import { parseStructuredOutput, toStructuredFallback } from "./utils/parsing.js";
import { runInSandbox, SandboxError } from "./utils/sandbox.js";
import { ProviderConfig } from "./types.js";
import { randomUUID } from "node:crypto";

const env = loadEnv();

const app = Fastify({
  logger: {
    level: "info",
  },
  genReqId: () => randomUUID(),
});

await app.register(cors, {
  origin: env.WEB_ORIGIN,
  credentials: true,
});

await app.register(rateLimit, {
  max: 50,
  timeWindow: "1 minute",
});

const providers: Record<string, ProviderConfig> = {
  openai: {
    name: "openai",
    supportsStreaming: true,
    adapter: createOpenAiAdapter(env.OPENAI_API_KEY, env.OPENAI_MODEL),
  },
  gemini: {
    name: "gemini",
    supportsStreaming: false,
    adapter: createGeminiAdapter(env.GEMINI_API_KEY, env.GEMINI_MODEL),
  },
};

app.get("/api/health", async () => ({ status: "ok" }));

app.post("/api/run", async (request, reply) => {
  const parsed = runRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    reply.status(400);
    return { error: { message: parsed.error.message, code: "INVALID_BODY" } };
  }

  try {
    const result = runInSandbox(parsed.data);
    return result;
  } catch (error: any) {
    const code = error instanceof SandboxError ? error.code : "SANDBOX_ERROR";
    reply.status(400);
    return { error: { message: error.message, code } };
  }
});

app.post("/api/ai", async (request, reply) => {
  const parsed = aiRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    reply.status(400);
    return { error: { message: parsed.error.message, code: "INVALID_BODY" } };
  }

  const { provider, prompt, mode, userCode, stream } = parsed.data;
  const providerConfig = providers[provider];

  if (!providerConfig) {
    reply.status(400);
    return { error: { message: "Unknown provider", code: "PROVIDER_UNKNOWN" } };
  }

  if (prompt.length > 8000) {
    reply.status(413);
    return { error: { message: "Prompt too large", code: "PAYLOAD_TOO_LARGE" } };
  }

  const adapterInput = { prompt, mode, userCode, stream: stream && providerConfig.supportsStreaming };

  if (stream && providerConfig.supportsStreaming) {
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const sendEvent = (event: string, data: string) => {
      reply.raw.write(`event: ${event}\ndata: ${data}\n\n`);
    };

    try {
      const raw = await providerConfig.adapter.generate({
        ...adapterInput,
        onChunk: (text) => sendEvent("chunk", JSON.stringify({ text })),
      });
      const structured = parseStructuredOutput(raw);
      sendEvent("final", JSON.stringify(structured));
      reply.raw.end();
    } catch (error: any) {
      const fallback = errorResponseSchema.parse({
        error: { message: error.message ?? "AI provider failed", code: "AI_ERROR" },
      });
      sendEvent("error", JSON.stringify(fallback));
      reply.raw.end();
    }

    return reply; // already sent
  }

  try {
    const raw = await providerConfig.adapter.generate(adapterInput);
    return parseStructuredOutput(raw);
  } catch (error: any) {
    reply.status(500);
    return toStructuredFallback(error?.message ?? "AI provider failed", "AI provider error");
  }
});

app.setErrorHandler((error, request, reply) => {
  request.log.error({ err: error }, "Unhandled error");
  reply.status(500).send({ error: { message: "Unexpected error", code: "UNHANDLED" } });
});

const port = Number(env.PORT ?? 4000);
app.listen({ port, host: "0.0.0.0" }).then(() => {
  app.log.info(`API listening on http://localhost:${port}`);
});
