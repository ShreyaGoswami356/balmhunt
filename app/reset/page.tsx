"use client";

import NextLink from "next/link";
import { useMemo, useState } from "react";
import { Button, Card, CardBody } from "@heroui/react";

type IntakeState = {
  focusImpact: number | null;
  ruminationFrequency: string | null;
  biggestImpact: string | null;
  safetyStatus: string | null;
};

const TOTAL_STEPS = 4;

const ruminationOptions = ["Rarely", "A few times a day", "Constantly"];
const biggestHitOptions = ["Work / School", "Sleep", "Motivation", "Self-worth"];
const safetyOptions = ["Yes", "I'm not sure", "No"];

export default function ResetPage() {
  const [step, setStep] = useState(1);
  const [intake, setIntake] = useState<IntakeState>({
    focusImpact: null,
    ruminationFrequency: null,
    biggestImpact: null,
    safetyStatus: null,
  });

  const canContinue = useMemo(() => {
    if (step === 1) return intake.focusImpact !== null;
    if (step === 2) return intake.ruminationFrequency !== null;
    if (step === 3) return intake.biggestImpact !== null;
    if (step === 4) return intake.safetyStatus !== null && intake.safetyStatus !== "No";
    return true;
  }, [intake, step]);

  const isSummary = step > TOTAL_STEPS;

  const handleContinue = () => {
    if (!canContinue) return;
    setStep((current) => current + 1);
  };

  const optionClass = (isSelected: boolean) =>
    `w-full rounded-full border px-4 py-2 text-sm font-medium transition ${
      isSelected
        ? "border-[#7BAB7B] bg-[#7BAB7B] text-white"
        : "border-[#D9DDD6] bg-white text-[#374151] hover:border-[#7BAB7B]/50"
    }`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F7F3] px-6 py-16 text-[#1F2937]">
      <section className="w-full max-w-2xl text-center">
        <div className="mb-6">
          <p className="font-[family-name:var(--font-manrope)] text-sm text-[#4B5563]">Session 1 - Intake</p>
          {!isSummary ? (
            <p className="mt-1 font-[family-name:var(--font-manrope)] text-sm text-[#6B7280]">Step {step} of 4</p>
          ) : null}
        </div>

        <Card className="mx-auto w-full max-w-[500px] rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <CardBody className="p-6 sm:p-8">
            {!isSummary ? (
              <div className="space-y-6 text-left">
                {step === 1 ? (
                  <>
                    <h1 className="font-[family-name:var(--font-manrope)] text-lg font-semibold text-[#1F2937]">
                      How much is this affecting your focus right now?
                    </h1>
                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setIntake((prev) => ({ ...prev, focusImpact: value }))}
                          className={optionClass(intake.focusImpact === value)}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <h1 className="font-[family-name:var(--font-manrope)] text-lg font-semibold text-[#1F2937]">
                      How often do you find yourself replaying it?
                    </h1>
                    <div className="space-y-2">
                      {ruminationOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setIntake((prev) => ({ ...prev, ruminationFrequency: option }))}
                          className={optionClass(intake.ruminationFrequency === option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}

                {step === 3 ? (
                  <>
                    <h1 className="font-[family-name:var(--font-manrope)] text-lg font-semibold text-[#1F2937]">
                      What&apos;s taking the biggest hit?
                    </h1>
                    <div className="space-y-2">
                      {biggestHitOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setIntake((prev) => ({ ...prev, biggestImpact: option }))}
                          className={optionClass(intake.biggestImpact === option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}

                {step === 4 ? (
                  <>
                    <h1 className="font-[family-name:var(--font-manrope)] text-lg font-semibold text-[#1F2937]">
                      Are you safe right now?
                    </h1>
                    <div className="space-y-2">
                      {safetyOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setIntake((prev) => ({ ...prev, safetyStatus: option }))}
                          className={optionClass(intake.safetyStatus === option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {intake.safetyStatus === "I'm not sure" || intake.safetyStatus === "No" ? (
                      <p className="rounded-xl border border-[#F3D4D4] bg-[#FFF7F7] px-4 py-3 text-sm text-[#7A3C3C]">
                        If you&apos;re in immediate danger, please contact local emergency services.
                      </p>
                    ) : null}
                  </>
                ) : null}

                <div className="pt-2">
                  <Button
                    onPress={handleContinue}
                    isDisabled={!canContinue}
                    radius="full"
                    className="h-11 w-full bg-[#7BAB7B] text-white hover:bg-[#6A9A6A] disabled:opacity-50"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <h1 className="font-[family-name:var(--font-instrument-serif)] text-4xl font-normal tracking-tight text-[#1F2937]">
                  Baseline Recorded
                </h1>
                <p className="font-[family-name:var(--font-manrope)] text-base leading-relaxed text-[#4B5563]">
                  Thank you. We&apos;ll use this as your starting point.
                </p>
                <Button
                  as={NextLink}
                  href="/session"
                  radius="full"
                  className="h-11 w-full bg-[#7BAB7B] text-white hover:bg-[#6A9A6A]"
                >
                  Begin Session
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </section>
    </main>
  );
}
