"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import ModelSelector from "./ModelSelector";

export default function ChatInput() {
  const { sendMessage, streamingSessionIds, stopStreaming, activeSessionId } = useChatContext();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isStreaming = activeSessionId ? streamingSessionIds.includes(activeSessionId) : false;

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
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
    <div className="flex w-full items-end gap-1 md:gap-2">
      <div className="flex w-full flex-1 items-center gap-1.5 rounded-2xl border border-border bg-surface pl-2 pr-1.5 py-1.5 shadow-lg transition-all focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/20 md:gap-2 md:px-4 md:py-3">
        <ModelSelector />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Message..."
          rows={1}
          className="max-h-[140px] md:max-h-[200px] flex-1 resize-none bg-transparent text-[16px] md:text-[0.925rem] leading-6 text-text-primary placeholder:text-text-muted focus:outline-none min-w-0"
        />
        {isStreaming ? (
          <button
            onClick={handleStop}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-text-secondary text-surface transition-colors hover:bg-text-primary active:scale-95"
            title="Stop generating"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-white transition-all hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            title="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16151496 C3.34915502,0.9 2.40734225,0.9 1.77946707,1.4429026 C0.994623095,2.0770205 0.837654326,3.00636533 1.15159189,3.97788954 L3.03521743,10.4188825 C3.03521743,10.5759799 3.34915502,10.7330773 3.50612381,10.7330773 L16.6915026,11.5185642 C16.6915026,11.5185642 17.1624089,11.5185642 17.1624089,12.0428662 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
