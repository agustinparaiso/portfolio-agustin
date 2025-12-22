# FitNutricion

Aplicación Next.js (App Router) orientada a generar planes de entrenamiento y nutrición con revisión humana.

## Requisitos

- Node 18.18+
- npm
- Variables de entorno:
  - `MASTER_KEY` (obligatoria para cifrar API keys)
  - `OPENAI_API_KEY` (opcional si se activa OpenAI)

## Puesta en marcha

```bash
cd apps/fitnutricion
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

## Flujo de prueba

1. Crear sesión: abrir `/quiz` y completar algunos pasos (se guarda en localStorage).
2. Generar cálculos: el flujo llama a `/api/compute/:id`.
3. Generar borrador: el flujo llama a `/api/generate-plan/:id` (usa OpenAI si está activado, sino fallback rule-based).
4. Revisar en `/admin/revision`, aprobar y simular envío.
5. Explorar CRUD de preguntas, plantillas, pricing, testimonios y ajustes.

## Avisos éticos

- La información es orientativa y no sustituye consejo médico.
- Sin dark patterns: el opt-in de marketing no está preseleccionado.
- Las keys de OpenAI se cifran con AES-GCM usando `MASTER_KEY` y nunca se devuelven al cliente.
