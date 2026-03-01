"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button, Card, CardBody, Input, Spinner } from "@heroui/react";

export default function BrandSetupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [brandName, setBrandName] = useState("");
  const [website, setWebsite] = useState("");
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkProfile = async () => {
      if (status !== "authenticated") return;
      if (session.user.role !== "BRAND") {
        router.push("/");
        return;
      }

      const response = await fetch("/api/brand-profile", { cache: "no-store" });
      const payload = (await response.json()) as { brandProfile?: { id: string } | null };

      if (!mounted) return;
      if (payload.brandProfile?.id) {
        router.push("/");
        return;
      }

      setChecking(false);
    };

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      void checkProfile();
    }

    return () => {
      mounted = false;
    };
  }, [router, session, status]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch("/api/brand-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandName, website }),
    });

    setSaving(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError((payload.error ?? "could not save brand profile").toLowerCase());
      return;
    }

    router.push("/");
    router.refresh();
  };

  if (status !== "authenticated" || checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-[#666666]">
          <Spinner size="sm" /> loading...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <Card className="w-full max-w-md rounded-2xl border border-[#F6A6C1]/30 shadow-sm">
        <CardBody className="gap-4 p-6">
          <div>
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[#111111]">brand profile</h1>
            <p className="text-sm text-[#666666]">set up your brand details</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              label="Brand name"
              value={brandName}
              onValueChange={setBrandName}
              isRequired
              classNames={{ inputWrapper: "bg-[#FFF0F5]" }}
            />
            <Input label="Website (optional)" value={website} onValueChange={setWebsite} classNames={{ inputWrapper: "bg-[#FFF0F5]" }} />
            <Button type="submit" isLoading={saving} className="bg-[#F6A6C1] text-[#111111] hover:bg-[#EE7DA7]">
              save profile
            </Button>
          </form>

          {error ? <p className="text-sm text-[#EE7DA7]">{error}</p> : null}
        </CardBody>
      </Card>
    </main>
  );
}
