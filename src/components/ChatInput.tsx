"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import ModelSelector from "./ModelSelector";

export default function ChatInput() {
  const { sendMessage, streamingSessionIds, stopStreaming, activeSessionId } =
    useChatContext();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isStreaming = activeSessionId
    ? streamingSessionIds.includes(activeSessionId)
    : false;

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
    }
  }, [value]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function handleSubmit() {
    if (!value.trim() || isStreaming) return;
    sendMessage(value.trim());
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleStop() {
    if (activeSessionId) {
      stopStreaming(activeSessionId);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="composer-shell">
      <div className="composer-topbar">
        <ModelSelector />
        <span className="composer-hint">
          Press Enter to send, Shift + Enter for a new line
        </span>
      </div>

      <div className="input-box">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Ask anything, describe a task, or continue your workflow..."
          rows={1}
        />

        <div className="composer-actions">
          {isStreaming ? (
            <button
              onClick={handleStop}
              className="btn-icon btn-stop"
              title="Stop generating"
            >
              <i className="bi bi-stop-fill"></i>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!value.trim()}
              className="btn-icon btn-send"
              title="Send message"
            >
              <i className="bi bi-arrow-up"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
