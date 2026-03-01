"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { Card, CardBody, Chip, Link, Spinner } from "@heroui/react";

type MonthlyWinner = {
  monthStart: string;
  monthLabel: string;
  productId: string;
  productName: string;
  brandName: string;
  totalVotes: number;
  sourcedFromWeeks: number;
};

export default function MonthlyWinnersPage() {
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState<MonthlyWinner[]>([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const response = await fetch("/api/monthly-winners", { cache: "no-store" });
      const payload = (await response.json()) as { winners: MonthlyWinner[] };
      if (mounted) {
        setWinners(payload.winners);
        setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const latest = winners[0] ?? null;

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <Link as={NextLink} href="/" className="text-sm text-[#666666]">
          back to this week
        </Link>

        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-[#111111]">Monthly Winners</h1>

        {latest ? (
          <Card className="rounded-2xl border-2 border-[#F0B429] bg-[#FFF8E8] shadow-md">
            <CardBody className="gap-2 p-6">
              <Chip className="w-fit bg-[#F0B429] text-[#111111]">BalmHunt Winner - {latest.monthLabel}</Chip>
              <p className="font-semibold text-2xl text-[#111111]">{latest.productName}</p>
              <p className="text-sm text-[#666666]">{latest.brandName}</p>
              <p className="text-sm text-[#111111]">selected from {latest.sourcedFromWeeks} weekly winner(s) - {latest.totalVotes} votes in winning week</p>
            </CardBody>
          </Card>
        ) : null}

        <Card className="rounded-2xl border border-[#F6A6C1]/30 shadow-sm">
          <CardBody className="gap-3 p-5">
            {loading ? (
              <div className="flex items-center gap-2 text-[#666666]">
                <Spinner size="sm" /> loading monthly winners...
              </div>
            ) : null}

            {!loading && winners.length === 0 ? <p className="text-sm text-[#666666]">no monthly winners yet.</p> : null}

            {winners.map((winner) => (
              <div key={`${winner.monthStart}-${winner.productId}`} className="flex items-center justify-between rounded-xl border border-[#F6A6C1]/20 p-3">
                <div>
                  <p className="font-semibold text-[#111111]">{winner.productName}</p>
                  <p className="text-sm text-[#666666]">{winner.brandName}</p>
                  <p className="text-xs text-[#666666]">{winner.monthLabel}</p>
                </div>
                <Chip className="bg-[#FFF0F5] text-[#111111]">{winner.totalVotes} votes</Chip>
              </div>
            ))}
          </CardBody>
        </Card>
      </section>
    </main>
  );
}