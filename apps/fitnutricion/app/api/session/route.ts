import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export async function POST() {
  const session = await prisma.session.create({
    data: { responses: {}, status: "INICIADA" }
  });
  return NextResponse.json({ id: session.id });
}
