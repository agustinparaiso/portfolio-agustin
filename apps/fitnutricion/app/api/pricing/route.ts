import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET() {
  const plans = await prisma.pricingPlan.findMany({ orderBy: { weeks: "asc" } });
  return NextResponse.json({ plans });
}
