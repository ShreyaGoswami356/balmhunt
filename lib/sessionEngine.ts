export type SessionMode = "unload" | "pattern_mirror" | "guided_action" | "close";

export type SessionModeState = {
  responseNumber: number;
  mode: SessionMode;
  instructions: string;
};

const MAX_RESPONSES = 12;

function clampResponseNumber(value: number): number {
  if (Number.isNaN(value) || value < 1) return 1;
  if (value > MAX_RESPONSES) return MAX_RESPONSES;
  return Math.floor(value);
}

function getModeInstructions(mode: SessionMode): string {
  if (mode === "unload") {
    return [
      "Mode: Unload.",
      "Help the user externalize what is most active for them right now.",
      "Ask one clear follow-up question that increases clarity.",
    ].join(" ");
  }

  if (mode === "pattern_mirror") {
    return [
      "Mode: Pattern Mirror.",
      "Reflect recurring loops, assumptions, and friction points in concise language.",
      "Prioritize insight over reassurance and keep momentum forward.",
    ].join(" ");
  }

  if (mode === "guided_action") {
    return [
      "Mode: Guided Action.",
      "Shift from reflection to concrete next steps.",
      "Offer practical, low-friction actions the user can do today.",
    ].join(" ");
  }

  return [
    "Mode: Close.",
    "Close the session with a brief summary and one clear next move.",
    "Reinforce completion and avoid inviting dependency.",
  ].join(" ");
}

export function getSessionModeState(messageCount: number): SessionModeState {
  const responseNumber = clampResponseNumber(messageCount + 1);

  let mode: SessionMode = "close";
  if (responseNumber >= 1 && responseNumber <= 3) mode = "unload";
  if (responseNumber >= 4 && responseNumber <= 7) mode = "pattern_mirror";
  if (responseNumber >= 8 && responseNumber <= 11) mode = "guided_action";
  if (responseNumber === 12) mode = "close";

  return {
    responseNumber,
    mode,
    instructions: getModeInstructions(mode),
  };
}

export function isSessionExhausted(messageCount: number): boolean {
  return messageCount >= MAX_RESPONSES;
}

export const SESSION_MAX_RESPONSES = MAX_RESPONSES;
