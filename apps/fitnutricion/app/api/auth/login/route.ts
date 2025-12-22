import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  const body = await req.json();
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) return NextResponse.json({ error: "Invalid" }, { status: 401 });
  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Invalid" }, { status: 401 });
  const secret = new TextEncoder().encode(process.env.MASTER_KEY || "fitnutricion-demo");
  const token = await new SignJWT({ sub: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("12h")
    .sign(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("fitnutricion_admin", token, { httpOnly: true, secure: true, path: "/" });
  return res;
}
