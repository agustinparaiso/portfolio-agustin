import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { cleanHtml } from "../../../../../lib/sanitize";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const item = await prisma.question.findUnique({ where: { id: Number(params.id) } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const item = await prisma.question.update({
    where: { id: Number(params.id) },
    data: {
      ...body,
      helpHtml: body.helpHtml ? cleanHtml(body.helpHtml) : null,
      footerHtml: body.footerHtml ? cleanHtml(body.footerHtml) : null
    }
  });
  return NextResponse.json({ item });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.question.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
