import { useState, useRef, useCallback } from "react";
import { Message, ImageAttachment, ChatSession, Provider } from "@/lib/types";
import { streamChat, DEFAULT_MODEL } from "@/lib/api";

function generateId(): string {
  return crypto.randomUUID();
}

interface UseChatManagerProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  provider: Provider;
  updateSession: (sessionId: string, updater: (s: ChatSession) => ChatSession) => void;
  createSession: () => void;
  generateTitle: (sessionId: string, contextMessages: Message[]) => Promise<void>;
  setActiveSessionIdFallback: (id: string) => void; 
}

export function useChatManager({
  sessions,
  activeSessionId,
  provider,
  updateSession,
  createSession,
  generateTitle,
  setActiveSessionIdFallback,
}: UseChatManagerProps) {
  const [streamingSessionIds, setStreamingSessionIds] = useState<string[]>([]);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const streamContentRef = useRef("");

  const stopStreaming = useCallback(
    (sessionId?: string) => {
      const idToStop = sessionId || activeSessionId;
      if (!idToStop) return;

      const controller = abortControllersRef.current.get(idToStop);
      if (controller) {
        controller.abort();
        abortControllersRef.current.delete(idToStop);
      }

      setStreamingSessionIds((prev) => prev.filter((id) => id !== idToStop));
    },
    [activeSessionId]
  );

  const sendMessage = useCallback(
    (content: string, attachments: ImageAttachment[] = []) => {
      let currentSessionId = activeSessionId;

      if (
        (!content.trim() && attachments.length === 0) ||
        (currentSessionId && streamingSessionIds.includes(currentSessionId))
      ) {
        return;
      }

      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content,
        attachments: attachments.length > 0 ? attachments : undefined,
        createdAt: Date.now(),
      };

      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };

      // If no active session, we must create a temporary state flow or assume createSession was handled.
      // Easiest is to lazily spin up a new session locally.
      let isFirstExchange = false;
      let targetProviderId = provider.id;
      let targetModel = DEFAULT_MODEL;
      let targetMessages: Message[] = [];
      let targetTitle = "New Chat";
      
      const existingSession = sessions.find(s => s.id === currentSessionId);

      if (!existingSession) {
        // Fallback: create a new session organically inline
        const newSessionId = generateId();
        currentSessionId = newSessionId;
        isFirstExchange = true;
        targetMessages = [userMsg, assistantMsg];
        
        setActiveSessionIdFallback(newSessionId);
        updateSession(newSessionId, () => ({
          id: newSessionId,
          title: "New Chat",
          model: targetModel,
          provider: targetProviderId,
          messages: targetMessages,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }));
      } else {
        currentSessionId = existingSession.id;
        targetProviderId = existingSession.provider;
        targetModel = existingSession.model;
        targetTitle = existingSession.title;
        targetMessages = [...existingSession.messages, userMsg, assistantMsg];
        isFirstExchange = existingSession.messages.filter(m => m.role === "user").length === 0;

        updateSession(currentSessionId, (s) => ({
          ...s,
          messages: targetMessages,
          updatedAt: Date.now()
        }));
      }

      setStreamingSessionIds((prev) => [...prev, currentSessionId!]);

      const finalSessionId = currentSessionId!;
      const messagesForApi = targetMessages.filter((m) => m.id !== assistantMsg.id);

      const abortController = new AbortController();
      abortControllersRef.current.set(finalSessionId, abortController);
      streamContentRef.current = "";

      if (isFirstExchange && targetTitle === "New Chat") {
        generateTitle(finalSessionId, targetMessages);
      }

      streamChat(
        targetProviderId,
        targetModel,
        messagesForApi,
        (chunk) => {
          streamContentRef.current += chunk;
          const accumulated = streamContentRef.current;
          updateSession(finalSessionId, (s) => ({
            ...s,
            messages: s.messages.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: accumulated } : m
            ),
            updatedAt: Date.now(),
          }));
        },
        () => {
          // Done
          updateSession(finalSessionId, (s) => ({ ...s, updatedAt: Date.now() }));
          setStreamingSessionIds((prev) => prev.filter((id) => id !== finalSessionId));
          abortControllersRef.current.delete(finalSessionId);
        },
        (err) => {
          // Error
          updateSession(finalSessionId, (s) => ({
            ...s,
            messages: s.messages.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: `Error: ${err}` } : m
            ),
            updatedAt: Date.now(),
          }));
          setStreamingSessionIds((prev) => prev.filter((id) => id !== finalSessionId));
          abortControllersRef.current.delete(finalSessionId);
        },
        abortController.signal
      );
    },
    [
      activeSessionId,
      streamingSessionIds,
      sessions,
      provider,
      setActiveSessionIdFallback,
      updateSession,
      generateTitle,
    ]
  );

  return { stopStreaming, sendMessage, streamingSessionIds };
}
