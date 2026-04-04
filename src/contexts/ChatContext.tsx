"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ChatSession, ImageAttachment, Provider } from "@/lib/types";
import { useSessions } from "@/hooks/useSessions";
import { useTitleGenerator } from "@/hooks/useTitleGenerator";
import { useChatManager } from "@/hooks/useChatManager";

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
  sendMessage: (content: string, attachments?: ImageAttachment[]) => void;
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

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpenState] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768) {
      setTimeout(() => {
        setSidebarOpenState(false);
      }, 0);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpenState((prev) => !prev);
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setSidebarOpenState(open);
  }, []);

  const {
    sessions,
    activeSessionId,
    activeSession,
    provider,
    createSession,
    switchSession,
    deleteSessionById,
    setModel,
    updateSession,
    setActiveSessionId,
  } = useSessions();

  const { generateTitle } = useTitleGenerator(sessions, updateSession, provider.id);

  const {
    sendMessage,
    stopStreaming,
    streamingSessionIds,
  } = useChatManager({
    sessions,
    activeSessionId,
    provider,
    updateSession,
    createSession,
    generateTitle,
    setActiveSessionIdFallback: setActiveSessionId,
  });

  return (
    <ChatContext.Provider
      value={{
        sessions,
        activeSessionId,
        provider,
        streamingSessionIds,
        sidebarOpen,
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
