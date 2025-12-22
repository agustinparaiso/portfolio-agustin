# AI Coding Playground

Parque de pruebas aislado para crear prototipos de soluciones en JavaScript con ayuda de IA. El proyecto vive totalmente dentro de `apps/ai-coding-playground` y se distribuye como un mini monorepo con frontend Vite + React, backend Fastify y tipos TypeScript compartidos.

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

## Por qué el cliente nunca ve las API keys
Todas las llamadas a OpenAI y Gemini se hacen a través del backend. Las claves se leen desde variables de entorno en el servidor y nunca se exponen al navegador. El frontend solo habla con `/api/ai` y `/api/run` en el mismo origen durante el desarrollo.

## Inicio rápido

```bash
cd apps/ai-coding-playground
pnpm install
cp .env.example .env   # fill your keys
pnpm dev               # starts api (4000) + web (5173)
```

### Scripts
- `pnpm dev` – ejecuta API y web en modo watch
- `pnpm build` – construye paquete compartido, API y web
- `pnpm lint` – revisa tipos del frontend
- `pnpm --filter @ai-playground/api dev` – ejecuta solo la API
- `pnpm --filter @ai-playground/web dev` – ejecuta solo la web

## Variables de entorno
Consulta `.env.example` para la lista completa.

- `OPENAI_API_KEY` – clave de OpenAI Responses
- `GEMINI_API_KEY` – clave de Gemini
- `OPENAI_MODEL` / `GEMINI_MODEL` – nombres de modelo (hay valores por defecto)
- `PORT` – puerto de la API (por defecto `4000`)
- `WEB_ORIGIN` – origen permitido para CORS (por defecto `http://localhost:5173`)

Las variables de entorno se validan al iniciar mediante Zod; configuraciones inválidas detienen el servidor con un error descriptivo.

## Arquitectura y contratos de datos

Flujo ASCII:
```
Frontend (Vite) --> API Fastify --> (OpenAI Responses | Gemini generateContent)
                   \\-> Sandbox runner (vm + timeout)
```

### Contrato compartido (siempre JSON)
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

La respuesta es **siempre** estructurada:
```json
{
  "code": "string",
  "explanation": "string",
  "tests": ["string"],
  "complexity": "string",
  "notes": ["string"]
}
```

Si un proveedor devuelve algo que no es JSON, el backend repara o extrae el JSON; de lo contrario envuelve el texto en la estructura con notas de parsing.

### Ejecución de código
`POST /api/run`
```json
{
  "code": "string",
  "tests": ["string"]
}
```

Respuesta
```json
{
  "stdout": "string",
  "stderr": "string",
  "tests": [ { "name": "string", "passed": true, "error": "string|null" } ],
  "runtimeMs": 123
}
```

El sandbox usa `vm` de Node con un timeout estricto y sin APIs de sistema de archivos o red en el contexto.

## Seguridad, protección y límites
- **Rate limiting:** por IP usando el plugin de rate-limit de Fastify.
- **CORS:** restringido a `WEB_ORIGIN` para desarrollo local.
- **Sandbox:** contexto `vm` con timeout limitado, sin `require`, globals mínimos.
- **Higiene de entrada:** límite de tamaño de prompts y código; envoltura de errores JSON consistente `{ "error": { message, code } }`.
- **Streaming:** SSE para OpenAI cuando `stream=true` (`event: chunk` + `event: final`). Gemini responde sin streaming pero respeta el contrato JSON.
- **Logging:** logger de Fastify con IDs de request y metadata del proveedor.

## Funciones del frontend
- Editor Monaco para "Mi solución" y solución de la IA en modo solo lectura.
- Panel de IA con selector de proveedor, modo, toggle de streaming y vista previa en vivo.
- Panel de consola con stdout/stderr y resultados de tests en línea.
- Panel de comparación con diff de Monaco, checklist básica (tests, edge cases, complejidad) y ejecución dual de tests (tu código vs código de la IA).

## Detalles del backend
- Rutas Fastify: `/api/ai`, `/api/run`, `/api/health`.
- Adaptadores de proveedor:
  - **OpenAI:** API de Responses con `response_format` JSON y streaming SSE.
  - **Gemini:** `generateContent` con enforcement de JSON basado en prompt.
- Parsing estructurado para garantizar salida JSON; reparación de respaldo cuando falla el parseo.
- Sandbox ejecuta el código del usuario y los tests propuestos por la IA dentro de `vm` con timeout de 1s.

## Lo que aprendí / decisiones
- Mantener los adaptadores delgados: un formateador de prompt compartido aplica el contrato JSON una sola vez.
- Validación estructurada en un paquete compartido mantiene frontend y backend alineados.
- Un parseo SSE sencillo basta para las previsualizaciones de streaming sin dependencias extra.
- Un mini runner de tests en el backend evita frameworks pesados y soporta tests sugeridos por la IA.

## Próximos pasos
- Persistir prompts/historial y enlaces compartibles.
- Auth + cuotas por usuario.
- Aislamiento más fuerte del sandbox (límites de memoria, ejecución basada en inspector).
- Añadir telemetría y un scoring de diff más rico.
