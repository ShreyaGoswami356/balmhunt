import { NextResponse } from "next/server";
import { getUTCDateOffset } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") === "week" ? "week" : "all";

  const voteGroups = await prisma.vote.groupBy({
    by: ["product_id"],
    where: range === "week" ? { vote_date: { gte: getUTCDateOffset(-6) } } : undefined,
    _count: { _all: true },
  });

  const productIds = voteGroups.map(
    (group: { product_id: string; _count: { _all: number } }) => group.product_id
  );
  if (productIds.length === 0) {
    return NextResponse.json({ entries: [] });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      brandProfile: { select: { brand_name: true } },
    },
  });

  const productMap = new Map<string, (typeof products)[number]>(
    products.map((product: (typeof products)[number]) => [product.id, product])
  );
  const entries = voteGroups
    .map((group: { product_id: string; _count: { _all: number } }) => {
      const product = productMap.get(group.product_id);
      if (!product) return null;
      return {
        productId: product.id,
        productName: product.name,
        brandName: product.brandProfile.brand_name,
        totalVotes: group._count._all,
      };
    })
    .filter(
      (
        entry: {
          productId: string;
          productName: string;
          brandName: string;
          totalVotes: number;
        } | null
      ): entry is NonNullable<typeof entry> => Boolean(entry)
    )
    .sort((a: { totalVotes: number }, b: { totalVotes: number }) => b.totalVotes - a.totalVotes);

  return NextResponse.json({ entries });
}
