# AI Coding Playground

Sandboxed playground to prototype JavaScript solutions with AI guidance. The project is fully isolated inside `apps/ai-coding-playground` and ships a mini monorepo with a Vite + React frontend, Fastify backend, and shared TypeScript types.

```
apps/ai-coding-playground
├─ apps/
│  ├─ api/         # Fastify proxy + sandbox runner
│  └─ web/         # Vite + React + Monaco UI
├─ packages/
│  └─ shared/      # Schemas, DTOs, env validation
├─ README.md
└─ .env.example
```

## Why the client never touches API keys
All calls to OpenAI and Gemini are proxied through the backend. Keys are read from server-side environment variables and never exposed to the browser. The frontend only talks to `/api/ai` and `/api/run` over the same origin during development.

## Quickstart

```bash
cd apps/ai-coding-playground
pnpm install
cp .env.example .env   # fill your keys
pnpm dev               # starts api (4000) + web (5173)
```

### Scripts
- `pnpm dev` – run API and web in watch mode
- `pnpm build` – build shared package, API, and web
- `pnpm lint` – type-check the frontend
- `pnpm --filter @ai-playground/api dev` – run only the API
- `pnpm --filter @ai-playground/web dev` – run only the web

## Environment variables
See `.env.example` for a full list.

- `OPENAI_API_KEY` – OpenAI Responses API key
- `GEMINI_API_KEY` – Gemini key
- `OPENAI_MODEL` / `GEMINI_MODEL` – model names (defaults provided)
- `PORT` – API port (default `4000`)
- `WEB_ORIGIN` – allowed origin for CORS (default `http://localhost:5173`)

Environment variables are validated on boot via Zod; invalid configs stop the server with a descriptive error.

## Architecture & data contracts

ASCII flow:
```
Frontend (Vite) --> Fastify API --> (OpenAI Responses | Gemini generateContent)
                  \-> Sandbox runner (vm + timeout)
```

### Shared contract (JSON always)
`POST /api/ai`
```json
{
  "provider": "openai" | "gemini",
  "mode": "generate" | "compare" | "explain_failure",
  "prompt": "string",
  "userCode": "string optional",
  "language": "javascript",
  "stream": true | false
}
```

Response is **always** structured:
```json
{
  "code": "string",
  "explanation": "string",
  "tests": ["string"],
  "complexity": "string",
  "notes": ["string"]
}
```

If a provider returns non-JSON, the backend repairs/extracts JSON; otherwise it wraps the raw text into the structure with parsing notes.

### Code execution
`POST /api/run`
```json
{
  "code": "string",
  "tests": ["string"]
}
```

Response
```json
{
  "stdout": "string",
  "stderr": "string",
  "tests": [ { "name": "string", "passed": true, "error": "string|null" } ],
  "runtimeMs": 123
}
```

The sandbox uses Node's `vm` with a strict timeout and no filesystem/network APIs in the context.

## Security, safety, and limits
- **Rate limiting:** IP-based using Fastify's rate-limit plugin.
- **CORS:** Locked to `WEB_ORIGIN` for local dev.
- **Sandbox:** `vm` context with capped timeout, no `require`, minimal globals.
- **Input hygiene:** prompt size cap and code size checks; consistent JSON error envelope `{ "error": { message, code } }`.
- **Streaming:** SSE for OpenAI when `stream=true` (`event: chunk` + `event: final`). Gemini currently responds non-streaming but still honors the JSON contract.
- **Logging:** Fastify logger with request IDs and provider metadata.

## Frontend features
- Monaco editor for "My solution" and read-only AI solution.
- AI panel with provider switch, mode selector, streaming toggle, and live preview.
- Console panel showing stdout/stderr and inline test results.
- Compare panel with Monaco diff, basic score checklist (tests, edge cases, complexity), and dual test execution (your code vs AI code).

## Backend details
- Fastify routes: `/api/ai`, `/api/run`, `/api/health`.
- Provider adapters:
  - **OpenAI:** Responses API with JSON response_format and SSE streaming.
  - **Gemini:** `generateContent` with prompt-based JSON enforcement.
- Structured parsing to guarantee JSON output; repair fallback when parsing fails.
- Sandbox runner executes user code and AI-proposed tests inside `vm` with 1s timeout.

## Things I learned / decisions
- Keep adapters thin: shared prompt formatter enforces the JSON contract once.
- Structured validation in a shared package keeps frontend and backend aligned.
- Simple SSE parsing is enough for streaming previews without extra deps.
- Mini test runner in the backend avoids heavy test frameworks while supporting AI-suggested tests.

## Next steps
- Persist prompts/history and shareable links.
- Auth + per-user quotas.
- Stronger sandbox isolation (memory limits, inspector-based execution).
- Add telemetry and richer diff scoring.
