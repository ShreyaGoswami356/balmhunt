import { NextResponse } from "next/server";
import { getDemoWeeklyWinners } from "@/lib/demo-launches";
import { getWeeklyWinners } from "@/lib/winners";

export async function GET() {
  try {
    const winners = await getWeeklyWinners();

    return NextResponse.json({
      winners: winners.map((winner) => ({
        weekStart: winner.weekStart,
        weekEnd: winner.weekEnd,
        productId: winner.productId,
        productName: winner.productName,
        brandName: winner.brandName,
        totalVotes: winner.totalVotes,
      })),
    });
  } catch {
    const winners = getDemoWeeklyWinners();
    return NextResponse.json({ winners });
  }
}
