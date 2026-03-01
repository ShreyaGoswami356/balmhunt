"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, Card, CardBody, Chip, Link, Spinner, Textarea } from "@heroui/react";

type ProductComment = {
  id: string;
  content: string;
  createdAt: string;
  userName: string;
  userRole: "USER" | "BRAND";
  isOfficialBrand: boolean;
};

type ProductResponse = {
  product: {
    id: string;
    name: string;
    imageUrl: string;
    tagline: string;
    description: string;
    brandName: string;
    voteCount: number;
    comments: ProductComment[];
    hasVoted: boolean;
  };
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

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [savingComment, setSavingComment] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [data, setData] = useState<ProductResponse | null>(null);

  const fetchProduct = useCallback(async () => {
    const response = await fetch(`/api/product/${params.id}`, { cache: "no-store" });
    if (!response.ok) throw new Error("product not found");
    const payload = (await response.json()) as ProductResponse;

    if (!payload.usingDemoData) {
      setData(payload);
      return;
    }

    const extraVotes = readJson<Record<string, number>>(DEMO_VOTES_KEY, {});
    const userVotes = readJson<Record<string, string[]>>(DEMO_USER_VOTES_KEY, {});
    const commentsByProduct = readJson<Record<string, ProductComment[]>>(DEMO_COMMENTS_KEY, {});
    const userVoteKey = getUserVoteKey(session?.user?.email ?? null, session?.user?.id ?? null);
    const votedSet = new Set(userVotes[userVoteKey] ?? []);

    const localComments = commentsByProduct[params.id] ?? [];

    setData({
      ...payload,
      product: {
        ...payload.product,
        voteCount: payload.product.voteCount + (extraVotes[params.id] ?? 0),
        hasVoted: votedSet.has(params.id),
        comments: [...localComments, ...payload.product.comments],
      },
      isLoggedIn: status === "authenticated" || payload.isLoggedIn,
    });
  }, [params.id, session?.user?.email, session?.user?.id, status]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        await fetchProduct();
      } catch {
        if (mounted) setMessage("could not load this product.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [fetchProduct]);

  const submitComment = async (event: FormEvent) => {
    event.preventDefault();

    const isLoggedIn = status === "authenticated" || data?.isLoggedIn;
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (!comment.trim() || !data) return;

    setSavingComment(true);
    setMessage(null);

    try {
      if (data.usingDemoData) {
        const localCommentsByProduct = readJson<Record<string, ProductComment[]>>(DEMO_COMMENTS_KEY, {});
        const newComment: ProductComment = {
          id: `local-${Date.now()}`,
          content: comment.trim(),
          createdAt: new Date().toISOString(),
          userName: session?.user?.name ?? "Demo User",
          userRole: ((session?.user?.role as "USER" | "BRAND" | undefined) ?? "USER"),
          isOfficialBrand: false,
        };

        localCommentsByProduct[params.id] = [newComment, ...(localCommentsByProduct[params.id] ?? [])];
        writeJson(DEMO_COMMENTS_KEY, localCommentsByProduct);

        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            product: {
              ...prev.product,
              comments: [newComment, ...prev.product.comments],
            },
          };
        });
        setComment("");
        return;
      }

      const response = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: params.id, content: comment }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "comment failed");
      }

      setComment("");
      await fetchProduct();
    } catch (error) {
      const text = error instanceof Error ? error.message : "comment failed";
      setMessage(text.toLowerCase());
    } finally {
      setSavingComment(false);
    }
  };

  const totalComments = useMemo(() => data?.product.comments.length ?? 0, [data?.product.comments.length]);

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
        <div className="flex items-center gap-2 text-[#666666]">
          <Spinner size="sm" /> loading product...
        </div>
      </main>
    );
  }

  if (!data?.product) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4">
        <p className="text-[#666666]">product not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <Link as={NextLink} href="/" className="text-sm text-[#666666]">
          back to this week
        </Link>

        <Card className="rounded-2xl border border-[#F6A6C1]/30 shadow-sm">
          <CardBody className="gap-4 p-5">
            <Image
              src={data.product.imageUrl}
              alt={data.product.name}
              width={1200}
              height={600}
              className="h-auto max-h-[32rem] w-full rounded-xl bg-[#FFF8FB] p-3 object-contain"
            />
            <div>
              <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-[#111111]">{data.product.name}</h1>
              <p className="text-sm text-[#666666]">{data.product.brandName}</p>
              <p className="mt-2 text-[#666666]">{data.product.tagline}</p>
              <p className="mt-2 text-sm text-[#111111]">{data.product.description}</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Chip className="bg-[#FFF0F5] text-[#111111]">{data.product.voteCount} votes this week</Chip>
              <Chip className="bg-[#FFF0F5] text-[#111111]">{totalComments} comments</Chip>
            </div>
          </CardBody>
        </Card>

        <Card className="rounded-2xl border border-[#F6A6C1]/30 shadow-sm">
          <CardBody className="gap-4 p-5">
            <h2 className="font-semibold text-[#111111]">comments</h2>

            <form onSubmit={submitComment} className="flex flex-col gap-3">
              <Textarea
                label="add a comment"
                placeholder="share your thoughts"
                value={comment}
                onValueChange={setComment}
                minRows={3}
                classNames={{ inputWrapper: "bg-[#FFF0F5]" }}
              />
              <Button type="submit" isDisabled={savingComment} className="w-fit bg-[#F6A6C1] text-[#111111] hover:bg-[#EE7DA7]">
                post comment
              </Button>
            </form>

            {message ? <p className="text-sm text-[#EE7DA7]">{message}</p> : null}

            <div className="flex flex-col gap-3">
              {data.product.comments.map((item) => (
                <Card key={item.id} className="border border-[#F6A6C1]/20 bg-white shadow-none">
                  <CardBody className="gap-2 p-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#111111]">{item.userName}</p>
                      {item.isOfficialBrand ? (
                        <Chip className="bg-[#7BC47F] text-[#111111]" size="sm">
                          Official Brand
                        </Chip>
                      ) : null}
                    </div>
                    <p className="text-sm text-[#111111]">{item.content}</p>
                    <p className="text-xs text-[#666666]">{new Date(item.createdAt).toLocaleString()}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>
      </section>
    </main>
  );
}
