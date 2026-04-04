import { useCallback } from "react";
import { Message, ChatSession } from "@/lib/types";
import { streamChat, DEFAULT_MODEL } from "@/lib/api";

function sanitizeGeneratedTitle(rawTitle: string): string {
  return rawTitle
    .replace(/<think>[\s\S]*?<\/think>/gi, " ")
    .replace(/^['"`\s]+|['"`\s]+$/g, "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0)
    ?.slice(0, 100) || "";
}

function getMessageTextForTitle(message: Message): string {
  if (message.content.trim()) {
    return message.content;
  }

  if (message.attachments?.length) {
    return `Shared ${message.attachments.length} image${message.attachments.length > 1 ? "s" : ""}.`;
  }

  return "";
}

function generateId(): string {
  return crypto.randomUUID();
}

export function useTitleGenerator(
  sessions: ChatSession[], 
  updateSession: (id: string, updater: (s: ChatSession) => ChatSession) => void,
  defaultProviderId: string
) {

  const generateTitle = useCallback(async (
    sessionId: string,
    contextMessages: Message[],
  ): Promise<void> => {
    // Only extract the user's messages for context
    const userMessages = contextMessages.filter(m => m.role === "user");
    if (userMessages.length === 0) return;

    const titlePrompt =
      "Based on this message, generate a short plain-text title with a maximum of 6 words. Return only the title.";

    try {
      const session = sessions.find((s) => s.id === sessionId);
      const currentProviderId = session?.provider || defaultProviderId;
      const titleModel = session?.model || DEFAULT_MODEL;
      const titleMessages: Array<Pick<Message, "role" | "content">> = [
        ...userMessages.map((m) => ({
          role: m.role,
          content: getMessageTextForTitle(m),
        })),
        { role: "user", content: titlePrompt },
      ];

      let streamedTitle = "";
      let streamFailed = false;

      // Try streaming the title in the background
      await streamChat(
        currentProviderId,
        titleModel,
        titleMessages.map((m) => ({
          id: generateId(),
          role: m.role,
          content: m.content,
          createdAt: Date.now(),
        })),
        (chunk) => {
          streamedTitle += chunk;
        },
        () => {},
        () => {
          streamFailed = true;
        },
      );

      let title = sanitizeGeneratedTitle(streamedTitle);

      // Fallback to strict POST if stream failed
      if (!title) {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            providerId: currentProviderId,
            model: titleModel,
            stream: false,
            messages: titleMessages,
          }),
        });

        if (!res.ok) {
          if (streamFailed) return;
          return;
        }

        const text = await res.text();
        let rawTitle = "";

        try {
          const parsed = JSON.parse(text);
          rawTitle =
            parsed.choices?.[0]?.message?.content ||
            parsed.choices?.[0]?.text ||
            parsed.content ||
            parsed.output?.[0]?.content?.[0]?.text ||
            "";
        } catch {
          rawTitle = text;
        }

        title = sanitizeGeneratedTitle(rawTitle);
      }

      if (!title) return;

      updateSession(sessionId, (s) => ({ ...s, title, updatedAt: Date.now() }));
    } catch (e) {
      console.error("Title generation background task failed", e);
    }
  }, [sessions, updateSession, defaultProviderId]);

  return { generateTitle };
}
