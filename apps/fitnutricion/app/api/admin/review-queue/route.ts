import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function GET() {
  const items = await prisma.plan.findMany({
    where: { status: { in: ["PENDIENTE", "EN_REVISION"] } },
    include: { session: true },
    orderBy: { updatedAt: "desc" }
  });
  return NextResponse.json({ items });
}
