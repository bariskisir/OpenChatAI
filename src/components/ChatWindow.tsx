"use client";

import { useChatContext } from "@/contexts/ChatContext";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

export default function ChatWindow() {
  const {
    activeSession,
    streamingSessionIds,
    sidebarOpen,
    toggleSidebar,
    createSession,
    provider,
    activeSessionId,
  } = useChatContext();

  const isStreaming = activeSessionId
    ? streamingSessionIds.includes(activeSessionId)
    : false;

  const messages = activeSession?.messages || [];
  const scrollRef = useAutoScroll<HTMLDivElement>(messages);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      <header className="flex h-12 items-center gap-1.5 border-b border-border px-2 md:px-0 max-w-full md:max-w-[850px] md:ml-12 w-full">
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            title="Open sidebar"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </button>
        )}

        <div className="flex min-w-0 items-center gap-1 text-[10px] md:text-sm text-text-secondary">
          <span className="truncate">{provider.name}</span>
          <span className="flex-shrink-0 opacity-50">→</span>
          <span className="truncate font-medium">
            {activeSession?.model || "-"}
          </span>
        </div>

        {!sidebarOpen && (
          <button
            onClick={createSession}
            className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary ml-auto"
            title="New chat"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        )}
      </header>

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col overflow-y-auto hide-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 md:gap-4 px-4">
            <div className="flex h-12 w-12 md:h-20 md:w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/50 shadow-lg">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-white md:w-10 md:h-10"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </div>
            <h1 className="text-xl md:text-3xl font-bold text-text-primary tracking-tight">
              OpenChatAI
            </h1>
            <p className="max-w-[240px] md:max-w-sm text-center text-[10px] md:text-sm text-text-secondary leading-normal">
              Choose a model and start a conversation
            </p>
          </div>
        ) : (
          <div className="flex w-full max-w-full md:max-w-[850px] md:ml-12 flex-col gap-2.5 md:gap-4 px-1.5 md:px-0 py-3 md:py-8">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={
                  isStreaming &&
                  msg.role === "assistant" &&
                  idx === messages.length - 1
                }
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-full max-w-full border-t border-border bg-background px-1 py-2.5 md:ml-12 md:max-w-[850px] md:px-0 md:py-6">
        <ChatInput />
      </div>
    </div>
  );
}
