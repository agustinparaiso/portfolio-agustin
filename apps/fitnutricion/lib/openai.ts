import OpenAI from "openai";
import { decrypt, encrypt } from "./secrets";
import { prisma } from "./db";

export async function getOpenAIClient() {
  const settings = await prisma.setting.findFirst({ where: { id: 1 } });
  const apiKey =
    process.env.OPENAI_API_KEY ||
    (settings?.apiKeyEncrypted && process.env.MASTER_KEY
      ? decrypt(settings.apiKeyEncrypted, process.env.MASTER_KEY)
      : null);

  if (!apiKey) {
    throw new Error("OpenAI desactivado o sin API Key");
  }
  return new OpenAI({ apiKey });
}

export async function storeEncryptedApiKey(key: string, master: string) {
  const cipher = encrypt(key, master);
  await prisma.setting.upsert({
    where: { id: 1 },
    update: { apiKeyEncrypted: cipher },
    create: {
      id: 1,
      apiKeyEncrypted: cipher,
      useOpenAI: false,
      model: "gpt-4.1-mini",
      promptSystem: defaultSystemPrompt,
      promptUser: defaultUserPrompt
    }
  });
}

export const defaultSystemPrompt = `Eres un entrenador y nutricionista digital que genera planes seguros y orientativos. NO eres médico.
Devuelve SIEMPRE JSON válido que cumpla el esquema proporcionado. Añade avisos de que la información es orientativa y requiere revisión humana.`;

export const defaultUserPrompt = `Datos del usuario y respuestas del quiz en JSON:
{{answers}}

Genera un plan de 4 semanas de entrenamiento y 7 días de nutrición. Incluye lista de compra y hábitos diarios.`;
