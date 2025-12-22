import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const status = body.status;

  let plan = await prisma.plan.findUnique({ where: { id: Number(params.id) } });
  if (!plan) {
    plan = await prisma.plan.findUnique({ where: { sessionId: params.id } });
  }
  if (!plan) return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });

  const updated = await prisma.plan.update({
    where: { id: plan.id },
    data: { status }
  });

  await prisma.session.update({
    where: { id: plan.sessionId },
    data: {
      status:
        status === "APROBADO"
          ? "APROBADO"
          : status === "ENVIADO"
            ? "ENVIADO"
            : status === "RECHAZADO"
              ? "RECHAZADO"
              : "PENDIENTE_REVISION"
    }
  });

  await prisma.planLog.create({
    data: {
      planId: plan.id,
      message: `Estado cambiado a ${status} (acción manual)`
    }
  });

  return NextResponse.json({ plan: updated });
}
