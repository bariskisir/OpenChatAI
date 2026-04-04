"use client";

import Image from "next/image";
import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { supportsImageAttachments, getImageUploadSupportMessage } from "@/lib/image-support";
import { useImageUpload } from "@/hooks/useImageUpload";
import ModelSelector from "./ModelSelector";

export default function ChatInput() {
  const {
    sendMessage,
    streamingSessionIds,
    stopStreaming,
    activeSessionId,
    activeSession,
  } = useChatContext();

  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isStreaming = activeSessionId ? streamingSessionIds.includes(activeSessionId) : false;
  const imageUploadEnabled = supportsImageAttachments(activeSession?.provider, activeSession?.model);

  const {
    attachments,
    activeAttachments,
    error,
    setError,
    isDraggingFiles,
    addFiles,
    removeAttachment,
    clearAttachments,
  } = useImageUpload(imageUploadEnabled);

  const composerError = !imageUploadEnabled && attachments.length > 0
    ? `Selected images are inactive because the current model does not support image uploads. ${getImageUploadSupportMessage()}`
    : error;

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

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    void addFiles(Array.from(e.target.files || []));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit() {
    if ((!value.trim() && activeAttachments.length === 0) || isStreaming) return;
    sendMessage(value.trim(), activeAttachments);
    setValue("");
    clearAttachments();
    setError("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleStop() {
    if (activeSessionId) stopStreaming(activeSessionId);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const files = Array.from(e.clipboardData.files || []);
    if (!files.some((file) => file.type.startsWith("image/"))) return;
    e.preventDefault();
    void addFiles(files);
  }

  return (
    <div className="composer-shell">
      {isDraggingFiles && (
        <div className="image-drop-overlay">
          <div className="image-drop-card">
            <i className="bi bi-images"></i>
            <span>Drop images to attach them</span>
          </div>
        </div>
      )}

      <div className="composer-topbar">
        <ModelSelector />
        <span className="composer-hint">
          Press Enter to send, Shift + Enter for a new line
        </span>
      </div>

      <div className="input-box">
        <div className="composer-content">
          {activeAttachments.length > 0 && (
            <div className="attachment-strip">
              {activeAttachments.map((attachment) => (
                <div key={attachment.id} className="attachment-chip">
                  <Image
                    src={attachment.dataUrl}
                    alt={attachment.name}
                    className="attachment-chip-image"
                    width={144}
                    height={144}
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removeAttachment(attachment.id)}
                    className="attachment-chip-remove"
                    title="Remove image"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="Ask anything, describe a task, or continue your workflow..."
            rows={1}
          />

          {composerError && <div className="composer-error">{composerError}</div>}
        </div>

        <div className="composer-actions">
          {imageUploadEnabled && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="visually-hidden"
                onChange={handleFilesChange}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-icon btn-attach"
                title="Attach images"
              >
                <i className="bi bi-image"></i>
              </button>
            </>
          )}

          {isStreaming ? (
            <button
              type="button"
              onClick={handleStop}
              className="btn-icon btn-stop"
              title="Stop generating"
            >
              <i className="bi bi-stop-fill"></i>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!value.trim() && activeAttachments.length === 0}
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
