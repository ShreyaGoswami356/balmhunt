"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button, Card, CardBody, Textarea } from "@heroui/react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SESSION_LIMIT = 12;

export default function SessionPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Welcome to Session 1. Start with what feels most active in your mind right now.",
    },
  ]);
  const [messageCount, setMessageCount] = useState(1);
  const [sessionClosed, setSessionClosed] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(() => {
    return !sessionClosed && !isSending && input.trim().length > 0 && messageCount < SESSION_LIMIT;
  }, [input, isSending, messageCount, sessionClosed]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          messageCount,
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        sessionClosed?: boolean;
      };

      if (!response.ok || !payload.message) {
        throw new Error(payload.message ?? "Unable to continue right now.");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: payload.message ?? "" }]);
      setMessageCount((prev) => prev + 1);

      if (payload.sessionClosed || messageCount + 1 >= SESSION_LIMIT) {
        setSessionClosed(true);
      }
    } catch (sendError) {
      const text = sendError instanceof Error ? sendError.message : "Unable to continue right now.";
      setError(text);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F7F3] px-4 py-8 text-[#1F2937] sm:px-6">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <header className="flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
          <h1 className="font-[family-name:var(--font-manrope)] text-sm font-semibold sm:text-base">Session 1</h1>
          <p className="font-[family-name:var(--font-manrope)] text-xs text-[#4B5563] sm:text-sm">
            Message count: {messageCount} / {SESSION_LIMIT}
          </p>
        </header>

        <Card className="rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <CardBody className="flex h-[62vh] flex-col gap-4 p-4 sm:p-6">
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 font-[family-name:var(--font-manrope)] text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-[#1F2937] text-white"
                        : "bg-[#E6F0E6] text-[#1F2937]"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {sessionClosed ? (
              <p className="rounded-xl border border-[#D7E3D7] bg-[#F3F8F3] px-4 py-3 text-center font-[family-name:var(--font-manrope)] text-sm text-[#355535]">
                You&apos;ve done enough for today.
                <br />
                Momentum builds between sessions.
              </p>
            ) : null}

            {error ? (
              <p className="font-[family-name:var(--font-manrope)] text-sm text-[#8A4A4A]">{error}</p>
            ) : null}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Textarea
                value={input}
                onValueChange={setInput}
                placeholder="Write what feels most relevant right now..."
                minRows={3}
                isDisabled={sessionClosed || isSending}
                classNames={{
                  inputWrapper: "bg-[#FAFAF7] border border-[#E5E7EB]",
                }}
              />
              <Button
                type="submit"
                radius="full"
                isDisabled={!canSend}
                isLoading={isSending}
                className="h-11 w-full bg-[#7BAB7B] text-white hover:bg-[#6A9A6A]"
              >
                Send
              </Button>
            </form>
          </CardBody>
        </Card>
      </section>
    </main>
  );
}
