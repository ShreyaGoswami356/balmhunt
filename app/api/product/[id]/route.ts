import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUTCNextWeekStart, getUTCWeekStart } from "@/lib/date";
import { findDemoLaunchById } from "@/lib/demo-launches";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await getServerSession(authOptions);
    const weekStart = getUTCWeekStart();
    const nextWeekStart = getUTCNextWeekStart();

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brandProfile: {
          select: {
            brand_name: true,
            user_id: true,
          },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, role: true },
            },
          },
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const [voteCount, userVote] = await Promise.all([
      prisma.vote.count({
        where: { product_id: product.id, vote_date: { gte: weekStart, lt: nextWeekStart } },
      }),
      session?.user?.id && session.user.role === "USER"
        ? prisma.vote.findFirst({
            where: {
              user_id: session.user.id,
              product_id: product.id,
              vote_date: { gte: weekStart, lt: nextWeekStart },
            },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    const comments = product.comments.map((comment: (typeof product.comments)[number]) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      userName: comment.user.name,
      userRole: comment.user.role,
      isOfficialBrand: comment.user.role === "BRAND" && comment.user.id === product.brandProfile.user_id,
    }));

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.image_url,
        tagline: product.tagline,
        description: product.description,
        brandName: product.brandProfile.brand_name,
        voteCount,
        comments,
        hasVoted: Boolean(userVote),
      },
      role: session?.user?.role ?? null,
      isLoggedIn: Boolean(session?.user),
    });
  } catch {
    const product = findDemoLaunchById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        tagline: product.tagline,
        description: product.description,
        brandName: product.brandName,
        voteCount: product.voteCount,
        comments: [],
        hasVoted: false,
      },
      role: null,
      isLoggedIn: false,
      usingDemoData: true,
    });
  }
}
