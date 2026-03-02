import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getSessionModeState, isSessionExhausted, SESSION_MAX_RESPONSES } from "@/lib/sessionEngine";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequest = {
  messages?: ChatMessage[];
  messageCount?: number;
};

const CRISIS_KEYWORDS = ["suicide", "kill myself", "hurt myself", "end it"];

function containsCrisisLanguage(text: string): boolean {
  const normalized = text.toLowerCase();
  return CRISIS_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function getCrisisResponse() {
  return "If you're in immediate danger, contact local emergency services now. If possible, reach out to a trusted person nearby and seek urgent professional help.";
}

function getFallbackResponse(mode: ReturnType<typeof getSessionModeState>["mode"]): string {
  if (mode === "unload") {
    return "Start with one concrete detail: what happened, and what part feels heaviest right now? Keep it simple and factual so we can work from clarity.";
  }

  if (mode === "pattern_mirror") {
    return "I notice this is pulling your attention in loops. Name the repeating thought in one sentence, then name one fact that is true right now.";
  }

  if (mode === "guided_action") {
    return "Pick one action you can finish in under 15 minutes today. Keep it specific, low-friction, and directly tied to regaining momentum.";
  }

  return "You’ve clarified the core issue and identified your next move. Close this session by writing one sentence: what you will do first, and when.";
}

export async function POST(request: Request) {
  let safeMessageCount = 0;
  try {
    const body = (await request.json()) as ChatRequest;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const messageCount = typeof body.messageCount === "number" ? body.messageCount : 0;
    safeMessageCount = messageCount;

    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
    if (lastUserMessage && containsCrisisLanguage(lastUserMessage.content)) {
      return NextResponse.json({
        message: getCrisisResponse(),
        sessionClosed: true,
      });
    }

    if (isSessionExhausted(messageCount)) {
      return NextResponse.json({
        message: "You've done enough for today. Momentum builds between sessions.",
        sessionClosed: true,
      });
    }

    const modeState = getSessionModeState(messageCount);

    const systemPrompt = [
      "You are Onwards.",
      "A structured, time-bound reset program.",
      "You guide reflection toward forward motion.",
      "You do not create dependency.",
      "You do not provide therapy.",
      "Keep responses concise (max 2 short paragraphs).",
      "Avoid emotional over-validation.",
      "No emojis.",
      `Current session response: ${modeState.responseNumber}/${SESSION_MAX_RESPONSES}.`,
      modeState.instructions,
    ].join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 300,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    });

    const assistantMessage = completion.choices[0]?.message?.content?.trim() ?? "Let's continue with one clear step forward.";

    return NextResponse.json({
      message: assistantMessage,
      sessionClosed: modeState.responseNumber >= SESSION_MAX_RESPONSES,
      mode: modeState.mode,
      responseNumber: modeState.responseNumber,
    });
  } catch (error) {
    const modeState = getSessionModeState(safeMessageCount);
    console.error("chat route error:", error);

    return NextResponse.json({
      message: getFallbackResponse(modeState.mode),
      sessionClosed: false,
      fallback: true,
    });
  }
}
