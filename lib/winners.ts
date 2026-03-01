import { formatMonthYearUTC, getUTCMonthStart, getUTCWeekStart } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export type WeeklyWinner = {
  weekStart: Date;
  weekEnd: Date;
  productId: string;
  productName: string;
  brandName: string;
  totalVotes: number;
};

export type MonthlyWinner = {
  monthStart: Date;
  monthLabel: string;
  productId: string;
  productName: string;
  brandName: string;
  totalVotes: number;
  sourcedFromWeeks: number;
};

export async function getWeeklyWinners(): Promise<WeeklyWinner[]> {
  const votes = await prisma.vote.findMany({
    select: {
      product_id: true,
      vote_date: true,
    },
  });

  if (votes.length === 0) return [];

  const voteCountByWeekAndProduct = new Map<string, number>();

  for (const vote of votes) {
    const weekStart = getUTCWeekStart(vote.vote_date).toISOString().slice(0, 10);
    const key = `${weekStart}|${vote.product_id}`;
    voteCountByWeekAndProduct.set(key, (voteCountByWeekAndProduct.get(key) ?? 0) + 1);
  }

  const bestByWeek = new Map<string, { productId: string; totalVotes: number }>();

  for (const [key, totalVotes] of voteCountByWeekAndProduct) {
    const [weekStart, productId] = key.split("|");
    const current = bestByWeek.get(weekStart);

    if (!current || totalVotes > current.totalVotes || (totalVotes === current.totalVotes && productId < current.productId)) {
      bestByWeek.set(weekStart, { productId, totalVotes });
    }
  }

  const productIds = Array.from(new Set(Array.from(bestByWeek.values()).map((entry) => entry.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
      brandProfile: { select: { brand_name: true } },
    },
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  const winners: WeeklyWinner[] = [];

  for (const [weekStartIso, winner] of bestByWeek) {
    const product = productMap.get(winner.productId);
    if (!product) continue;

    const weekStart = new Date(`${weekStartIso}T00:00:00.000Z`);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

    winners.push({
      weekStart,
      weekEnd,
      productId: product.id,
      productName: product.name,
      brandName: product.brandProfile.brand_name,
      totalVotes: winner.totalVotes,
    });
  }

  return winners.sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());
}

export function getMonthlyWinners(weeklyWinners: WeeklyWinner[]): MonthlyWinner[] {
  if (weeklyWinners.length === 0) return [];

  const winnersByMonth = new Map<string, { monthStart: Date; winner: WeeklyWinner; sourcedFromWeeks: number }>();

  for (const weeklyWinner of weeklyWinners) {
    const monthStart = getUTCMonthStart(weeklyWinner.weekStart);
    const monthKey = monthStart.toISOString().slice(0, 7);
    const existing = winnersByMonth.get(monthKey);

    if (!existing) {
      winnersByMonth.set(monthKey, {
        monthStart,
        winner: weeklyWinner,
        sourcedFromWeeks: 1,
      });
      continue;
    }

    if (weeklyWinner.totalVotes > existing.winner.totalVotes) {
      existing.winner = weeklyWinner;
    }

    existing.sourcedFromWeeks += 1;
  }

  return Array.from(winnersByMonth.values())
    .map((entry) => ({
      monthStart: entry.monthStart,
      monthLabel: formatMonthYearUTC(entry.monthStart),
      productId: entry.winner.productId,
      productName: entry.winner.productName,
      brandName: entry.winner.brandName,
      totalVotes: entry.winner.totalVotes,
      sourcedFromWeeks: entry.sourcedFromWeeks,
    }))
    .sort((a, b) => b.monthStart.getTime() - a.monthStart.getTime());
}