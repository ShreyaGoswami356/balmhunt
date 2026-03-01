"use client";

import { FormEvent, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button, Card, CardBody, Input, Link, Select, SelectItem } from "@heroui/react";

type Role = "USER" | "BRAND";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const signupResponse = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!signupResponse.ok) {
      const payload = (await signupResponse.json()) as { error?: string };
      setError((payload.error ?? "signup failed").toLowerCase());
      setLoading(false);
      return;
    }

    const loginResult = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (loginResult?.error) {
      setError("account created but login failed. please try logging in.");
      return;
    }

    if (role === "BRAND") {
      router.push("/brand/setup");
    } else {
      router.push("/");
    }
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <Card className="w-full max-w-md rounded-2xl border border-[#F6A6C1]/30 shadow-sm">
        <CardBody className="gap-4 p-6">
          <div>
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-[#111111]">create account</h1>
            <p className="text-sm text-[#666666]">join BalmHunt</p>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-3">
            <Input label="Name" value={name} onValueChange={setName} isRequired classNames={{ inputWrapper: "bg-[#FFF0F5]" }} />
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
            <Select
              label="I am a"
              selectedKeys={[role]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0];
                setRole(value === "BRAND" ? "BRAND" : "USER");
              }}
              classNames={{ trigger: "bg-[#FFF0F5]" }}
            >
              <SelectItem key="USER">User</SelectItem>
              <SelectItem key="BRAND">Brand</SelectItem>
            </Select>

            <Button type="submit" isLoading={loading} className="bg-[#F6A6C1] text-[#111111] hover:bg-[#EE7DA7]">
              sign up
            </Button>
          </form>

          {error ? <p className="text-sm text-[#EE7DA7]">{error}</p> : null}

          <p className="text-sm text-[#666666]">
            already have an account?{" "}
            <Link as={NextLink} href="/login" className="text-[#111111] underline-offset-4 hover:underline">
              log in
            </Link>
          </p>
        </CardBody>
      </Card>
    </main>
  );
}
