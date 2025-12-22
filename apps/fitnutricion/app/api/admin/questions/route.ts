import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { cleanHtml } from "../../../../lib/sanitize";

export async function GET() {
  const items = await prisma.question.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const body = await req.json();
  const payload = {
    key: body.key,
    title: body.title,
    description: body.description,
    type: body.type,
    order: body.order || 1,
    options: body.options || [],
    validations: body.validations || {},
    isSkippable: body.isSkippable || false,
    helpHtml: body.helpHtml ? cleanHtml(body.helpHtml) : null,
    footerHtml: body.footerHtml ? cleanHtml(body.footerHtml) : null,
    uiVariant: body.uiVariant || null
  };
  const item = await prisma.question.upsert({
    where: { key: payload.key },
    update: payload,
    create: payload
  });
  return NextResponse.json({ item });
}
