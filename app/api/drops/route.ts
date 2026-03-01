import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUTCNextWeekStart, getUTCWeekEnd, getUTCWeekStart } from "@/lib/date";
import { DEMO_LAUNCHES, getDemoWeekRange } from "@/lib/demo-launches";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const weekStart = getUTCWeekStart();
    const nextWeekStart = getUTCNextWeekStart();
    const weekEnd = getUTCWeekEnd();

    const [products, voteGroups, userVotes] = await Promise.all([
      prisma.product.findMany({
        where: { launch_date: { gte: weekStart, lt: nextWeekStart } },
        include: {
          brandProfile: { select: { brand_name: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { launch_date: "asc" },
      }),
      prisma.vote.groupBy({
        by: ["product_id"],
        where: { vote_date: { gte: weekStart, lt: nextWeekStart } },
        _count: { _all: true },
      }),
      session?.user?.id && session.user.role === "USER"
        ? prisma.vote.findMany({
            where: {
              user_id: session.user.id,
              vote_date: { gte: weekStart, lt: nextWeekStart },
            },
            select: { product_id: true },
          })
        : Promise.resolve([]),
    ]);

    const voteMap = new Map(
      voteGroups.map((group: { product_id: string; _count: { _all: number } }) => [
        group.product_id,
        group._count._all,
      ])
    );

    const userVotedSet = new Set(userVotes.map((vote: { product_id: string }) => vote.product_id));

    const drops = products
      .map((product: (typeof products)[number]) => ({
        id: product.id,
        name: product.name,
        imageUrl: product.image_url,
        tagline: product.tagline,
        brandName: product.brandProfile.brand_name,
        voteCount: voteMap.get(product.id) ?? 0,
        commentCount: product._count.comments,
        hasVoted: userVotedSet.has(product.id),
      }))
      .sort((a, b) => b.voteCount - a.voteCount);

    const weeklyWinnerId = drops[0]?.voteCount ? drops[0].id : null;

    return NextResponse.json({
      drops,
      weeklyWinnerId,
      weekStart,
      weekEnd,
      role: session?.user?.role ?? null,
      isLoggedIn: Boolean(session?.user),
    });
  } catch {
    const { weekStart, weekEnd } = getDemoWeekRange();
    const drops = DEMO_LAUNCHES.map((launch) => ({
      id: launch.id,
      name: launch.name,
      imageUrl: launch.imageUrl,
      tagline: launch.tagline,
      brandName: launch.brandName,
      voteCount: launch.voteCount,
      commentCount: launch.commentCount,
      hasVoted: false,
    }));

    return NextResponse.json({
      drops,
      weeklyWinnerId: drops[0]?.id ?? null,
      weekStart,
      weekEnd,
      role: null,
      isLoggedIn: false,
      usingDemoData: true,
    });
  }
}
