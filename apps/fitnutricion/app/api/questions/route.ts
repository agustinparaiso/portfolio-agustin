import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function GET() {
  const questions = await prisma.question.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ questions });
}
