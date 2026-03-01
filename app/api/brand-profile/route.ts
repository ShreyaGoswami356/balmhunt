import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type BrandProfileBody = {
  brandName?: string;
  website?: string;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "BRAND") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const brandProfile = await prisma.brandProfile.findUnique({
    where: { user_id: session.user.id },
  });

  return NextResponse.json({ brandProfile });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "BRAND") {
    return NextResponse.json({ error: "Only brands can create a brand profile." }, { status: 403 });
  }

  const body = (await request.json()) as BrandProfileBody;
  const brandName = body.brandName?.trim();
  const website = body.website?.trim();

  if (!brandName) {
    return NextResponse.json({ error: "Brand name is required." }, { status: 400 });
  }

  const existing = await prisma.brandProfile.findUnique({
    where: { user_id: session.user.id },
  });

  if (existing) {
    return NextResponse.json({ error: "Brand profile already exists." }, { status: 409 });
  }

  const brandProfile = await prisma.brandProfile.create({
    data: {
      user_id: session.user.id,
      brand_name: brandName,
      website: website || null,
    },
  });

  return NextResponse.json({ brandProfile }, { status: 201 });
}
