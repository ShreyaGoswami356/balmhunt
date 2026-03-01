import { NextResponse } from "next/server";
import { getDemoMonthlyWinners } from "@/lib/demo-launches";
import { getMonthlyWinners, getWeeklyWinners } from "@/lib/winners";

export async function GET() {
  try {
    const weeklyWinners = await getWeeklyWinners();
    const monthlyWinners = getMonthlyWinners(weeklyWinners);

    return NextResponse.json({
      winners: monthlyWinners.map((winner) => ({
        monthStart: winner.monthStart,
        monthLabel: winner.monthLabel,
        productId: winner.productId,
        productName: winner.productName,
        brandName: winner.brandName,
        totalVotes: winner.totalVotes,
        sourcedFromWeeks: winner.sourcedFromWeeks,
      })),
    });
  } catch {
    return NextResponse.json({ winners: getDemoMonthlyWinners() });
  }
}
