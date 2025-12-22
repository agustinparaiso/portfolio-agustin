import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "../../../../lib/db";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie");
  const token = cookie?.split(";").find((c) => c.trim().startsWith("fitnutricion_admin="))?.split("=")[1];
  if (!token) return NextResponse.json({ user: null });
  try {
    const secret = new TextEncoder().encode(process.env.MASTER_KEY || "fitnutricion-demo");
    const { payload } = await jwtVerify(token, secret);
    const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });
    return NextResponse.json({ user: user ? { id: user.id, role: user.role, email: user.email } : null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
