"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button, Card, CardBody, Chip, Divider, Link, Spinner } from "@heroui/react";
import CountdownTimer from "@/components/balmhunt/CountdownTimer";

type Drop = {
  id: string;
  name: string;
  imageUrl: string;
  tagline: string;
  brandName: string;
  voteCount: number;
  commentCount: number;
  hasVoted: boolean;
};

type DropsResponse = {
  drops: Drop[];
  weeklyWinnerId: string | null;
  weekStart: string;
  weekEnd: string;
  role: "USER" | "BRAND" | null;
  isLoggedIn: boolean;
  usingDemoData?: boolean;
};

const DEMO_VOTES_KEY = "balmhunt_demo_votes_v1";
const DEMO_USER_VOTES_KEY = "balmhunt_demo_user_votes_v1";
const DEMO_COMMENTS_KEY = "balmhunt_demo_comments_v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getUserVoteKey(sessionEmail: string | null, sessionId: string | null): string {
  return sessionEmail ?? sessionId ?? "guest";
}

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DropsResponse>({
    drops: [],
    weeklyWinnerId: null,
    weekStart: new Date().toISOString(),
    weekEnd: new Date().toISOString(),
    role: null,
    isLoggedIn: false,
    usingDemoData: false,
  });

  const fetchDrops = useCallback(async () => {
    const response = await fetch("/api/drops", { cache: "no-store" });
    const payload = (await response.json()) as DropsResponse;

    if (!payload.usingDemoData) {
      setData(payload);
      return;
    }

    const extraVotes = readJson<Record<string, number>>(DEMO_VOTES_KEY, {});
    const userVotes = readJson<Record<string, string[]>>(DEMO_USER_VOTES_KEY, {});
    const commentsByProduct = readJson<Record<string, Array<{ id: string }>>>(DEMO_COMMENTS_KEY, {});
    const userVoteKey = getUserVoteKey(session?.user?.email ?? null, session?.user?.id ?? null);
    const votedSet = new Set(userVotes[userVoteKey] ?? []);

    const drops = payload.drops.map((drop) => ({
      ...drop,
      voteCount: drop.voteCount + (extraVotes[drop.id] ?? 0),
      commentCount: drop.commentCount + (commentsByProduct[drop.id]?.length ?? 0),
      hasVoted: votedSet.has(drop.id),
    }));

    const sorted = [...drops].sort((a, b) => b.voteCount - a.voteCount);
    setData({
      ...payload,
      drops: sorted,
      weeklyWinnerId: sorted[0]?.id ?? null,
    });
  }, [session?.user?.email, session?.user?.id]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        await fetchDrops();
      } catch {
        if (mounted) setError("could not load this week's launches.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    const poll = window.setInterval(() => {
      void fetchDrops();
    }, 12000);

    return () => {
      mounted = false;
      window.clearInterval(poll);
    };
  }, [fetchDrops]);

  const currentRole = (session?.user?.role as "USER" | "BRAND" | undefined) ?? data.role;
  const isLoggedIn = status === "authenticated" || data.isLoggedIn;
  const canVote = useMemo(() => isLoggedIn && currentRole === "USER", [isLoggedIn, currentRole]);

  const handleVote = async (productId: string) => {
    if (!canVote) {
      router.push("/login");
      return;
    }

    setSubmittingId(productId);
    setError(null);

    try {
      if (data.usingDemoData) {
        const userVoteKey = getUserVoteKey(session?.user?.email ?? null, session?.user?.id ?? null);
        const allUserVotes = readJson<Record<string, string[]>>(DEMO_USER_VOTES_KEY, {});
        const myVotes = new Set(allUserVotes[userVoteKey] ?? []);

        if (myVotes.has(productId)) {
          throw new Error("you already voted for this product this week.");
        }

        myVotes.add(productId);
        allUserVotes[userVoteKey] = Array.from(myVotes);
        writeJson(DEMO_USER_VOTES_KEY, allUserVotes);

        const voteMap = readJson<Record<string, number>>(DEMO_VOTES_KEY, {});
        voteMap[productId] = (voteMap[productId] ?? 0) + 1;
        writeJson(DEMO_VOTES_KEY, voteMap);

        setData((prev) => {
          const updatedDrops = prev.drops
            .map((drop) =>
              drop.id === productId ? { ...drop, voteCount: drop.voteCount + 1, hasVoted: true } : drop
            )
            .sort((a, b) => b.voteCount - a.voteCount);

          return {
            ...prev,
            drops: updatedDrops,
            weeklyWinnerId: updatedDrops[0]?.id ?? null,
          };
        });
        return;
      }

      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "vote failed.");
      }

      await fetchDrops();
    } catch (voteError) {
      const message = voteError instanceof Error ? voteError.message : "vote failed.";
      setError(message.toLowerCase());
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-[#111111] sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold">BalmHunt</h1>
            <p className="text-sm text-[#666666]">Product Hunt for lip care.</p>
            <p className="text-xs text-[#666666]">This week: Feb 27 - March 5</p>
          </div>
          <div className="flex items-center gap-3">
            <CountdownTimer />
            {status === "authenticated" ? (
              <Button className="bg-[#FFF0F5] text-[#111111]" radius="full" onPress={() => signOut({ callbackUrl: "/" })}>
                log out
              </Button>
            ) : (
              <Button as={NextLink} href="/login" className="bg-[#111111] text-white" radius="full">
                log in
              </Button>
            )}
          </div>
        </header>

        <Divider className="bg-[#F6A6C1]/40" />

        <div>
          <h2 className="mb-4 font-[family-name:var(--font-manrope)] text-2xl font-semibold">This Week</h2>

          {loading ? (
            <div className="flex items-center gap-2 text-[#666666]">
              <Spinner size="sm" /> loading this week...
            </div>
          ) : null}

          {error ? <p className="mb-3 text-sm text-[#EE7DA7]">{error}</p> : null}

          {!loading && data.drops.length === 0 ? <p className="text-sm text-[#666666]">no launches yet for this week.</p> : null}

          <div className="grid gap-4 md:grid-cols-2">
            {data.drops.map((drop) => {
              const isWeeklyWinner = data.weeklyWinnerId === drop.id;

              return (
                <Card
                  key={drop.id}
                  className={`rounded-2xl bg-white shadow-sm ${
                    isWeeklyWinner
                      ? "border-2 border-[#7BC47F] ring-2 ring-[#7BC47F]/30 md:col-span-2"
                      : "border border-[#F6A6C1]/30"
                  }`}
                >
                  <CardBody className={`gap-3 ${isWeeklyWinner ? "p-5" : "p-4"}`}>
                    <Image
                      src={drop.imageUrl}
                      alt={drop.name}
                      width={720}
                      height={360}
                      className="h-auto max-h-56 w-full rounded-xl bg-[#FFF8FB] p-2 object-contain"
                    />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link as={NextLink} href={`/product/${drop.id}`} className="font-semibold text-[#111111]">
                          {drop.name}
                        </Link>
                        <p className="text-sm text-[#666666]">{drop.brandName}</p>
                        <p className="mt-1 text-sm text-[#666666]">{drop.tagline}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {isWeeklyWinner ? <Chip className="bg-[#7BC47F] text-[#111111]">Winner of the Week</Chip> : null}
                        {drop.voteCount > 0 ? (
                          <Chip className="bg-[#FFF0F5] text-[#111111]" size="sm">
                            {drop.voteCount}
                          </Chip>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <Button
                        onPress={() => handleVote(drop.id)}
                        isDisabled={!canVote || drop.hasVoted || submittingId === drop.id}
                        className={drop.hasVoted ? "bg-[#FFF0F5] text-[#111111]" : "bg-[#F6A6C1] text-[#111111] hover:bg-[#EE7DA7]"}
                        radius="lg"
                      >
                        ^ upvote
                      </Button>
                      <p className="text-sm text-[#666666]">{drop.voteCount} votes | {drop.commentCount} comments</p>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>

        <footer className="flex flex-wrap items-center gap-6 pt-4 text-sm">
          <span className="font-semibold text-[#111111]">This Week</span>
          <Link as={NextLink} href="/winners" className="text-[#111111] underline-offset-4 hover:underline">
            Weekly Winners
          </Link>
          <Link as={NextLink} href="/monthly-winners" className="text-[#111111] underline-offset-4 hover:underline">
            Monthly Winners
          </Link>
        </footer>
      </section>
    </main>
  );
}
