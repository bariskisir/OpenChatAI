"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { ChatSession, Message, Provider } from "@/lib/types";
import { loadSessions, saveSessions } from "@/lib/storage";
import { PROVIDERS, streamChat, DEFAULT_PROVIDER, DEFAULT_MODEL, getDefaultProvider } from "@/lib/api";

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  provider: Provider;
  streamingSessionIds: string[];
  sidebarOpen: boolean;
}

interface ChatContextValue extends ChatState {
  activeSession: ChatSession | null;
  createSession: () => void;
  switchSession: (id: string) => void;
  deleteSessionById: (id: string) => void;
  sendMessage: (content: string) => void;
  stopStreaming: (sessionId?: string) => void;
  setModel: (model: string, providerId?: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}

function generateId(): string {
  return crypto.randomUUID();
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ChatState>({
    sessions: [],
    activeSessionId: null,
    provider: getDefaultProvider(),
    streamingSessionIds: [],
    sidebarOpen: true,
  });

  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const streamContentRef = useRef("");

  useEffect(() => {
    let sessions = loadSessions();
    if (sessions.length === 0) {
      sessions = [
        {
          id: generateId(),
          title: "New Chat",
          model: DEFAULT_MODEL,
          provider: DEFAULT_PROVIDER,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
    }
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        sessions,
        activeSessionId: sessions[0].id,
      }));
    }, 0);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768) {
      setTimeout(() => {
        setState((prev) => ({ ...prev, sidebarOpen: false }));
      }, 0);
    }
  }, []);

  const persist = useCallback((sessions: ChatSession[]) => {
    saveSessions(sessions);
  }, []);

  const createSession = useCallback(() => {
    const newSession: ChatSession = {
      id: generateId(),
      title: "New Chat",
      model: DEFAULT_MODEL,
      provider: DEFAULT_PROVIDER,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setState((prev) => {
      const sessions = [newSession, ...prev.sessions];
      return { ...prev, sessions, activeSessionId: newSession.id, provider: getDefaultProvider() };
    });
  }, []);

  const switchSession = useCallback((id: string) => {
    setState((prev) => {
      const session = prev.sessions.find((s) => s.id === id);
      const provider = session
        ? PROVIDERS.find((p) => p.id === session.provider) || prev.provider
        : prev.provider;
      return { ...prev, activeSessionId: id, provider };
    });
  }, []);

  const deleteSessionById = useCallback(
    (id: string) => {
      setState((prev) => {
        let sessions = prev.sessions.filter((s) => s.id !== id);

        let activeSessionId =
          prev.activeSessionId === id
            ? sessions.length > 0
              ? sessions[0].id
              : null
            : prev.activeSessionId;

        if (sessions.length === 0) {
          const newSession: ChatSession = {
            id: generateId(),
            title: "New Chat",
            model: DEFAULT_MODEL,
            provider: DEFAULT_PROVIDER,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          sessions = [newSession];
          activeSessionId = newSession.id;
        }

        persist(sessions);
        return { ...prev, sessions, activeSessionId };
      });
    },
    [persist],
  );

  const setModel = useCallback(
    (model: string, providerId?: string) => {
      setState((prev) => {
        if (!prev.activeSessionId) return prev;
        const sessions = prev.sessions.map((s) => {
          if (s.id === prev.activeSessionId) {
            return {
              ...s,
              model,
              provider: providerId || s.provider,
              updatedAt: Date.now(),
            };
          }
          return s;
        });

        const newProvider = providerId
          ? PROVIDERS.find((p) => p.id === providerId) || prev.provider
          : prev.provider;

        persist(sessions);
        return { ...prev, sessions, provider: newProvider };
      });
    },
    [persist],
  );

  const stopStreaming = useCallback((sessionId?: string) => {
    const idToStop = sessionId || state.activeSessionId;
    if (!idToStop) return;

    const controller = abortControllersRef.current.get(idToStop);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(idToStop);
    }

    setState((prev) => ({
      ...prev,
      streamingSessionIds: prev.streamingSessionIds.filter((id) => id !== idToStop),
    }));
  }, [state.activeSessionId]);

  const sendMessage = useCallback(
    (content: string) => {
      const activeSessionId = state.activeSessionId;
      if (!content.trim() || (activeSessionId && state.streamingSessionIds.includes(activeSessionId))) return;

      const generateTitleInBackground = async (
        sessionId: string,
        contextMessages: Message[],
      ): Promise<void> => {
        if (contextMessages.length === 0) return;

        const titlePrompt = "Generate a short title for this conversation:\n";

        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
          const session = state.sessions.find((s) => s.id === sessionId);
          const currentProviderId = session?.provider || state.provider.id;
          const titleModel = session?.model || DEFAULT_MODEL;

          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              providerId: currentProviderId,
              model: titleModel,
              stream: false,
              messages: [
                { role: "user", content: titlePrompt },
                ...contextMessages.map((m) => ({
                  role: m.role,
                  content: m.content,
                })),
              ],
            }),
          });

          if (!res.ok) return;

          const text = await res.text();
          let title = "";

          try {
            const parsed = JSON.parse(text);
            title =
              parsed.choices?.[0]?.message?.content ||
              parsed.choices?.[0]?.text ||
              parsed.content ||
              "";
          } catch {
            title = text;
          }

          title =
            title
              .replace(/<think>[\s\S]*?<\/think>/gi, " ")
              .replace(/\r/g, "")
              .split("\n")
              .map((line) => line.trim())
              .find((line) => line.length > 0) || "";
          title = title.slice(0, 100);
          if (!title) return;

          setState((prev) => {
            const sessions = prev.sessions.map((s) =>
              s.id === sessionId ? { ...s, title, updatedAt: Date.now() } : s,
            );
            persist(sessions);
            return { ...prev, sessions };
          });
        } catch {}
      };

      let sessionId = state.activeSessionId;
      let currentSessions = [...state.sessions];

      if (!sessionId) {
        const newSession: ChatSession = {
          id: generateId(),
          title: "New Chat",
          model: DEFAULT_MODEL,
          provider: state.provider.id,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        sessionId = newSession.id;
        currentSessions = [newSession, ...currentSessions];
      }

      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content,
        createdAt: Date.now(),
      };

      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };

      const finalSessionId = sessionId;

      const updatedSessions = currentSessions.map((s) => {
        if (s.id !== finalSessionId) return s;
        return {
          ...s,
          messages: [...s.messages, userMsg, assistantMsg],
          title: s.title,
          updatedAt: Date.now(),
        };
      });

      persist(updatedSessions);

      setState((prev) => ({
        ...prev,
        sessions: updatedSessions,
        activeSessionId: finalSessionId,
        streamingSessionIds: [...prev.streamingSessionIds, finalSessionId],
      }));

      const session = updatedSessions.find((s) => s.id === finalSessionId)!;
      const allMessages = session.messages.filter(
        (m) => m.id !== assistantMsg.id,
      );

      const currentProviderId = session.provider;
      const currentModel = session.model;

      const abortController = new AbortController();
      abortControllersRef.current.set(finalSessionId, abortController);
      streamContentRef.current = "";

      streamChat(
        currentProviderId,
        currentModel,
        allMessages,
        (chunk) => {
          streamContentRef.current += chunk;
          const accumulated = streamContentRef.current;
          setState((prev) => {
            const sessions = prev.sessions.map((s) => {
              if (s.id !== finalSessionId) return s;
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsg.id ? { ...m, content: accumulated } : m,
                ),
                updatedAt: Date.now(),
              };
            });
            return { ...prev, sessions };
          });
        },
        () => {
          setState((prev) => {
            const sessions = prev.sessions.map((s) => {
              if (s.id !== finalSessionId) return s;
              return { ...s, updatedAt: Date.now() };
            });
            persist(sessions);
            return {
              ...prev,
              sessions,
              streamingSessionIds: prev.streamingSessionIds.filter((id) => id !== finalSessionId),
            };
          });
          abortControllersRef.current.delete(finalSessionId);

          const isFirstExchange =
            allMessages.filter((m) => m.role === "user").length === 1 &&
            allMessages.filter((m) => m.role === "assistant").length === 0;

          const titleMessages: Message[] = [
            ...allMessages,
            { ...assistantMsg, content: streamContentRef.current },
          ];

          const session = updatedSessions.find((s) => s.id === finalSessionId);
          if (session && isFirstExchange && session.title === "New Chat") {
            generateTitleInBackground(finalSessionId, titleMessages);
          }
        },
        (err) => {
          setState((prev) => {
            const sessions = prev.sessions.map((s) => {
              if (s.id !== finalSessionId) return s;
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsg.id
                    ? { ...m, content: `Error: ${err}` }
                    : m,
                ),
                updatedAt: Date.now(),
              };
            });
            persist(sessions);
            return {
              ...prev,
              sessions,
              streamingSessionIds: prev.streamingSessionIds.filter((id) => id !== finalSessionId),
            };
          });
          abortControllersRef.current.delete(finalSessionId);
        },
        abortController.signal,
      );
    },
    [
      state.activeSessionId,
      state.sessions,
      state.streamingSessionIds,
      state.provider,
      persist,
    ],
  );

  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, sidebarOpen: open }));
  }, []);

  const activeSession =
    state.sessions.find((s) => s.id === state.activeSessionId) || null;

  return (
    <ChatContext.Provider
      value={{
        ...state,
        activeSession,
        createSession,
        switchSession,
        deleteSessionById,
        sendMessage,
        stopStreaming,
        setModel,
        toggleSidebar,
        setSidebarOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
