import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await prisma.session.findUnique({
    where: { id: params.id },
    include: { plan: true }
  });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: session.id,
    responses: session.responses,
    computedMetrics: session.computedMetrics,
    status: session.status,
    plan: session.plan?.planJson
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const session = await prisma.session.findUnique({ where: { id: params.id } });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const responses = { ...(session.responses as any), ...(body.answers || {}) };
  await prisma.session.update({
    where: { id: params.id },
    data: { responses, currentStep: body.currentStep || session.currentStep }
  });
  return NextResponse.json({ ok: true });
}
