import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { generatePlan } from "../../../../lib/planGenerator";
import { getOpenAIClient } from "../../../../lib/openai";
import { planJsonSchema } from "../../../../lib/planSchema";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await prisma.session.findUnique({ where: { id: params.id } });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const settings = await prisma.setting.findFirst({ where: { id: 1 } });

  let openai = null;
  if (settings?.useOpenAI) {
    try {
      openai = await getOpenAIClient();
    } catch {
      openai = null;
    }
  }

  const planJson = await generatePlan({
    answers: { ...(session.responses as any), planJsonSchemaOverride: planJsonSchema },
    useOpenAI: Boolean(settings?.useOpenAI),
    settings: {
      model: settings?.model,
      promptSystem: settings?.promptSystem,
      promptUser: settings?.promptUser,
      temperature: settings?.temperature,
      maxTokens: settings?.maxTokens
    },
    openaiClient: openai
  });

  const plan = await prisma.plan.upsert({
    where: { sessionId: session.id },
    update: {
      planJson,
      rawResponse: planJson,
      status: "PENDIENTE"
    },
    create: {
      sessionId: session.id,
      planJson,
      rawResponse: planJson,
      status: "PENDIENTE",
      warnings: openai ? undefined : "OpenAI desactivado o con fallback"
    }
  });

  await prisma.session.update({
    where: { id: session.id },
    data: { status: "PENDIENTE_REVISION" }
  });

  await prisma.planLog.create({
    data: {
      planId: plan.id,
      message: "Plan generado y enviado a estado pendiente de revisión humana"
    }
  });

  return NextResponse.json({ plan });
}
