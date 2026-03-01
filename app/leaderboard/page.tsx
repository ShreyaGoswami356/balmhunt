"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { Card, CardBody, Link, Spinner, Tab, Tabs } from "@heroui/react";

type Entry = {
  productId: string;
  productName: string;
  brandName: string;
  totalVotes: number;
};

export default function LeaderboardPage() {
  const [range, setRange] = useState<"all" | "week">("all");
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const response = await fetch(`/api/leaderboard?range=${range}`, { cache: "no-store" });
      const payload = (await response.json()) as { entries: Entry[] };
      if (mounted) {
        setEntries(payload.entries);
        setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [range]);

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <Link as={NextLink} href="/" className="text-sm text-[#666666]">
          back to drops
        </Link>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-[#111111]">Leaderboard</h1>

        <Tabs
          selectedKey={range}
          onSelectionChange={(key) => setRange(key === "week" ? "week" : "all")}
          classNames={{
            tabList: "bg-[#FFF0F5]",
            cursor: "bg-[#F6A6C1]",
          }}
        >
          <Tab key="all" title="All Time" />
          <Tab key="week" title="This Week" />
        </Tabs>

        <Card className="rounded-2xl border border-[#F6A6C1]/30 shadow-sm">
          <CardBody className="gap-3 p-5">
            {loading ? (
              <div className="flex items-center gap-2 text-[#666666]">
                <Spinner size="sm" /> loading leaderboard...
              </div>
            ) : null}

            {!loading && entries.length === 0 ? <p className="text-sm text-[#666666]">no votes yet.</p> : null}

            {entries.map((entry, index) => (
              <div key={entry.productId} className="flex items-center justify-between rounded-xl border border-[#F6A6C1]/20 p-3">
                <div>
                  <p className="font-semibold text-[#111111]">#{index + 1} {entry.productName}</p>
                  <p className="text-sm text-[#666666]">{entry.brandName}</p>
                </div>
                <p className="text-sm text-[#111111]">{entry.totalVotes} votes</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </section>
    </main>
  );
}
