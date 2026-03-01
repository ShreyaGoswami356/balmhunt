"use client";

import { FormEvent, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button, Card, CardBody, Input, Link } from "@heroui/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError("invalid email or password.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <Card className="w-full max-w-md rounded-2xl border border-[#F6A6C1]/30 shadow-sm">
        <CardBody className="gap-4 p-6">
          <div>
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[#111111]">log in</h1>
            <p className="text-sm text-[#666666]">welcome back to BalmHunt</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              label="Email"
              type="email"
              value={email}
              onValueChange={setEmail}
              isRequired
              classNames={{ inputWrapper: "bg-[#FFF0F5]" }}
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onValueChange={setPassword}
              isRequired
              classNames={{ inputWrapper: "bg-[#FFF0F5]" }}
            />
            <Button type="submit" isLoading={loading} className="bg-[#F6A6C1] text-[#111111] hover:bg-[#EE7DA7]">
              log in
            </Button>
          </form>

          {error ? <p className="text-sm text-[#EE7DA7]">{error}</p> : null}

          <p className="text-sm text-[#666666]">
            new here?{" "}
            <Link as={NextLink} href="/signup" className="text-[#111111] underline-offset-4 hover:underline">
              create an account
            </Link>
          </p>
        </CardBody>
      </Card>
    </main>
  );
}
