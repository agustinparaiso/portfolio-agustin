import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function GET() {
  const items = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const body = await req.json();
  const item = await prisma.testimonial.create({
    data: {
      name: body.name,
      quote: body.quote,
      age: body.age,
      metric: body.metric,
      avatar: body.avatar || "AA"
    }
  });
  return NextResponse.json({ item });
}
