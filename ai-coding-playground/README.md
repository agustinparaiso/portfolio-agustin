# AI Coding Playground

Un entorno de **prototipado rápido y seguro** para soluciones en JavaScript con la guía de una IA. Este proyecto es un monorepo que combina un frontend moderno en **React + Vite** con un backend robusto en **Fastify**, diseñados para ofrecer una experiencia de desarrollo asistido fluida y segura.

El objetivo es permitir al usuario iterar código, recibir feedback inteligente y ejecutar pruebas en un entorno aislado (sandbox), todo con una interfaz premium y herramientas de productividad avanzadas.

```
apps/ai-coding-playground
├─ apps/
│  ├─ api/         # Fastify (Proxy IA + Runner Sandbox)
│  └─ web/         # Vite + React + Monaco Editor (UI Premium)
├─ packages/
│  └─ shared/      # Tipos, esquemas y validación compartida
├─ README.md
└─ .env.example
```

## Características Principales

### 1. Interfaz Premium y Productiva
- **Barra de Acción Fija (Sticky):** Botones de acción principales ("Nueva Tarea", "Ejecutar mi código", "Ejecutar IA") siempre accesibles en la parte superior.
- **Layout Optimizado:** 
  - Panel de IA de ancho completo en la parte superior.
  - Fila del Usuario: Editor + Consola propios.
  - Fila de la IA: Solución propuesta + Resultados de ejecución.
- **Tooltips Informativos:** Ayuda contextual en selectores de modo para entender mejor las capacidades de la IA.
- **Gestión de Contexto:** Botón "Nueva Tarea" para limpiar instantáneamente el estado y comenzar de cero sin "ruido" de conversaciones anteriores.

### 2. Integración de IA Avanzada
- **Proveedores Múltiples:** Soporte para **OpenAI** y **Google Gemini**.
- **Streaming en Tiempo Real:** Visualiza la respuesta de la IA mientras se genera.
- **Respuestas Estructuradas (JSON):** Garantía de formato para código, explicaciones, pruebas y análisis de complejidad.
- **Manejo de Errores Robusto:** El frontend captura y muestra errores reales del proveedor (ej. límites de cuota) en lugar de fallos genéricos.
- **Limpieza de Datos:** Algoritmos avanzados en el backend para normalizar respuestas de la IA (ej. convertir objetos de complejidad a texto legible).

### 3. Ejecución Segura (Sandbox)
- **Entorno Aislado:** El código se ejecuta en un sandbox `vm` de Node.js.
- **Pruebas Automatizadas:** Runner de pruebas ligero integrado que soporta aserciones estilo `assert(condición, mensaje)`.
- **timeout Estricto:** Protección contra bucles infinitos.

## Seguridad
- **Protección de API Keys:** Las claves de OpenAI/Gemini nunca tocan el navegador; todas las llamadas se hacen desde el backend.
- **Input Hygiene:** Validación estricta de payloads con Zod en frontend y backend.
- **Rate Limiting:** Protección contra abuso mediante `@fastify/rate-limit`.

## Inicio Rápido

1. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

2. **Configurar entorno:**
   ```bash
   cp .env.example .env
   # Rellenar OPENAI_API_KEY y/g GEMINI_API_KEY
   ```

3. **Iniciar desarrollo:**
   ```bash
   pnpm dev
   # Inicia API en http://localhost:4000
   # Inicia Web en http://localhost:5173
   ```

## Arquitectura y Flujo de Datos

```
Frontend (React/Vite) --> Fastify API --> (IA Adapter) --> OpenAI/Gemini
                           |
                           \--> Sandbox Runner (VM)
```

### Endpoints Clave
- `POST /api/ai`: Solicita código/ayuda a la IA. Soporta Streaming (SSE).
- `POST /api/run`: Ejecuta código JavaScript y pruebas en el sandbox.
- `GET /api/health`: Comprobación de estado.

## Decisiones Técnicas y Aprendizajes
- **Adaptadores Ligeros:** La lógica de formateo de prompts está centralizada, lo que facilita añadir nuevos modelos.
- **Validación Compartida:** El uso de un paquete `shared` asegura que frontend y backend hablen el mismo idioma.
- **Manejo de Streaming:** La implementación de SSE permite una UX superior sin dependencias pesadas de WebSockets.
- **Feedback de Usuario:** La adición de estados de carga (`isThinking`) y tooltips mejora significativamente la usabilidad.

## Próximos Pasos
- Persistencia de historial de sesiones.
- Soporte para más lenguajes en el sandbox.
- Autenticación de usuarios.
