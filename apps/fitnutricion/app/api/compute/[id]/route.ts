import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { computeMetrics, computeMacros } from "../../../../lib/calculations";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await prisma.session.findUnique({ where: { id: params.id } });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const responses = session.responses as any;
  const metrics = computeMetrics({
    heightCm: Number(responses.height) || 0,
    weightKg: Number(responses.weight) || 0,
    age: Number(responses.age) || 28,
    sex: responses.sex,
    activityLevel: responses.steps
  });
  const macros = computeMacros(responses.goal || "perder_grasa", Number(responses.weight) || 70, metrics.tdee);
  await prisma.session.update({
    where: { id: params.id },
    data: {
      computedMetrics: { ...metrics, ...macros },
      goal: responses.goal,
      dietType: responses.dietType,
      level: responses.level,
      place: responses.place,
      status: "COMPUTADA"
    }
  });
  return NextResponse.json({ metrics });
}
