import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { storeEncryptedApiKey } from "../../../../lib/openai";

export async function GET() {
  const settings = await prisma.setting.findFirst({ where: { id: 1 } });
  return NextResponse.json({ settings });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  if (body.apiKey && process.env.MASTER_KEY) {
    await storeEncryptedApiKey(body.apiKey, process.env.MASTER_KEY);
  }
  const settings = await prisma.setting.update({
    where: { id: 1 },
    data: {
      useOpenAI: body.useOpenAI ?? false,
      model: body.model,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
      promptSystem: body.promptSystem,
      promptUser: body.promptUser
    }
  });
  return NextResponse.json({ settings, note: "API key cifrada si se proporcionó." });
}
