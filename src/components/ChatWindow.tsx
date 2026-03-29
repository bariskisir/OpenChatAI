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
  const sessionTitle = activeSession?.title || "New chat";
  const userMessageCount = messages.filter(
    (message) => message.role === "user",
  ).length;

  return (
    <div className="chat-area">
      <div className="chat-header-wrapper">
        <header className="chat-header">
          <div className="chat-header-main">
            {!sidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="btn-ghost"
                title="Open sidebar"
              >
                <i className="bi bi-layout-sidebar-inset"></i>
              </button>
            )}

            <div className="chat-title-group">
              <span className="chat-kicker">Workspace</span>
              <div className="chat-title-row">
                <h1 className="chat-title">{sessionTitle}</h1>
                <span className="chat-counter">{userMessageCount} prompts</span>
              </div>
            </div>
          </div>

          <div className="chat-header-actions">
            <div className="provider-pill">
              <span>{provider.name}</span>
              <i className="bi bi-dot"></i>
              <span className="fw-semibold">{activeSession?.model || "-"}</span>
            </div>

            <button
              onClick={createSession}
              className="btn-ghost"
              title="New chat"
            >
              <i className="bi bi-plus-lg"></i>
            </button>
          </div>
        </header>
      </div>

      <div ref={scrollRef} className="chat-messages hide-scrollbar">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-hero">
              <div className="welcome-badge">
                <i className="bi bi-stars"></i>
                AI Workspace
              </div>

              <div className="welcome-copy">
                <h1 className="text-welcome-title">Build better conversations</h1>
                <p className="text-welcome-subtitle">
                  Pick a model, write a clear prompt, and keep everything in one focused workspace across mobile, laptop, and desktop.
                </p>
              </div>

              <div className="welcome-grid">
                <div className="welcome-card">
                  <i className="bi bi-lightning-charge"></i>
                  <strong>Fast switching</strong>
                  <span>Move between providers and models without leaving the flow.</span>
                </div>
                <div className="welcome-card">
                  <i className="bi bi-layout-text-sidebar-reverse"></i>
                  <strong>Clean history</strong>
                  <span>Keep sessions readable and easy to revisit later.</span>
                </div>
                <div className="welcome-card">
                  <i className="bi bi-phone"></i>
                  <strong>Responsive shell</strong>
                  <span>Designed to stay balanced on mobile and larger screens.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="messages-container">
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

      <div className="chat-input-wrapper">
        <div className="chat-input-area">
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
