import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function GET() {
  const items = await prisma.pricingPlan.findMany({ orderBy: { weeks: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const body = await req.json();
  const item = await prisma.pricingPlan.create({
    data: {
      name: body.name,
      weeks: body.weeks,
      priceTotal: body.priceTotal,
      pricePerDay: body.pricePerDay,
      badge: body.badge,
      trialDays: body.trialDays,
      popular: Boolean(body.popular)
    }
  });
  return NextResponse.json({ item });
}
