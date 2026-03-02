"use client";

import NextLink from "next/link";
import { Button } from "@heroui/react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#F7F7F3] text-[#1F2937]">
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-2xl text-center">
          <header>
            <h1 className="font-[family-name:var(--font-instrument-serif)] text-6xl font-normal tracking-tight sm:text-7xl">
              Onwards
            </h1>
            <p className="mt-5 font-[family-name:var(--font-manrope)] text-xl font-medium sm:text-2xl">
              A Structured Path Forward
            </p>
          </header>

          <p className="mx-auto mt-6 max-w-xl font-[family-name:var(--font-manrope)] text-base leading-relaxed text-[#4B5563] sm:text-lg">
            Time-bound sessions. No dependency.
            <br />
            Just space to think, then move on.
          </p>

          <div className="mt-10">
            <Button
              as={NextLink}
              href="/reset"
              size="lg"
              radius="full"
              className="h-12 px-8 font-[family-name:var(--font-manrope)] text-base font-semibold text-white bg-[#7BAB7B] hover:bg-[#6A9A6A]"
            >
              Start Your Reset
            </Button>
          </div>
        </div>
      </section>

      <footer className="px-6 pb-8 text-center">
        <p className="font-[family-name:var(--font-manrope)] text-xs leading-relaxed text-[#6B7280] sm:text-sm">
          Not therapy. Not crisis care.
          <br />
          For emergencies, contact local services.
        </p>
      </footer>
    </main>
  );
}