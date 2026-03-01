import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUTCDateOnly, getUTCNextWeekStart, getUTCWeekStart } from "@/lib/date";
import { prisma } from "@/lib/prisma";

type VoteBody = { productId?: string };

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "USER") {
    return NextResponse.json({ error: "Only logged-in users can vote." }, { status: 403 });
  }

  const body = (await request.json()) as VoteBody;
  const productId = body.productId?.trim();
  if (!productId) {
    return NextResponse.json({ error: "Missing product ID." }, { status: 400 });
  }

  const today = getUTCDateOnly();
  const weekStart = getUTCWeekStart();
  const nextWeekStart = getUTCNextWeekStart();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, launch_date: true },
  });

  if (!product || product.launch_date < weekStart || product.launch_date >= nextWeekStart) {
    return NextResponse.json({ error: "You can only vote on this week's launches." }, { status: 400 });
  }

  const existingWeeklyVote = await prisma.vote.findFirst({
    where: {
      user_id: session.user.id,
      product_id: productId,
      vote_date: { gte: weekStart, lt: nextWeekStart },
    },
    select: { id: true },
  });

  if (existingWeeklyVote) {
    return NextResponse.json({ error: "You already voted for this product this week." }, { status: 409 });
  }

  await prisma.vote.create({
    data: {
      user_id: session.user.id,
      product_id: productId,
      vote_date: today,
    },
  });

  const voteCount = await prisma.vote.count({
    where: { product_id: productId, vote_date: { gte: weekStart, lt: nextWeekStart } },
  });

  return NextResponse.json({ voteCount });
}