import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

type SignupBody = {
  name?: string;
  email?: string;
  password?: string;
  role?: "USER" | "BRAND";
};

export async function POST(request: Request) {
  const body = (await request.json()) as SignupBody;
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const role = body.role;

  if (!name || !email || !password || (role !== "USER" && role !== "BRAND")) {
    return NextResponse.json({ error: "Invalid signup data." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
    },
  });

  return NextResponse.json({ user });
}
