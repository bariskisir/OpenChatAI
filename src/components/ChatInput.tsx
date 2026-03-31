"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback, KeyboardEvent, ClipboardEvent } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { ImageAttachment } from "@/lib/types";
import {
  getImageUploadSupportMessage,
  MAX_IMAGE_ATTACHMENTS,
  supportsImageAttachments,
} from "@/lib/image-support";
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
  const [attachments, setAttachments] = useState<ImageAttachment[]>([]);
  const [error, setError] = useState("");
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);

  const isStreaming = activeSessionId
    ? streamingSessionIds.includes(activeSessionId)
    : false;
  const imageUploadEnabled = supportsImageAttachments(
    activeSession?.provider,
    activeSession?.model,
  );
  const activeAttachments = imageUploadEnabled ? attachments : [];
  const composerError =
    !imageUploadEnabled && attachments.length > 0
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

  async function fileToAttachment(file: File): Promise<ImageAttachment> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }

        reject(new Error("Failed to read the selected image."));
      };
      reader.onerror = () => reject(new Error("Failed to read the selected image."));
      reader.readAsDataURL(file);
    });

    return {
      id: crypto.randomUUID(),
      name: file.name,
      mimeType: file.type,
      dataUrl,
    };
  }

  const addFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (!imageUploadEnabled) {
        setError(getImageUploadSupportMessage());
        return;
      }

      const imageFiles = files.filter((file) => file.type.startsWith("image/"));

      if (imageFiles.length !== files.length) {
        setError("Only image files are supported.");
        return;
      }

      if (activeAttachments.length + imageFiles.length > MAX_IMAGE_ATTACHMENTS) {
        setError(`You can upload up to ${MAX_IMAGE_ATTACHMENTS} images per message.`);
        return;
      }

      try {
        const nextAttachments = await Promise.all(imageFiles.map(fileToAttachment));
        setAttachments((current) => [...current, ...nextAttachments]);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to read the selected image.");
      }
    },
    [activeAttachments.length, imageUploadEnabled],
  );

  useEffect(() => {
    function hasImageFiles(dataTransfer: DataTransfer | null) {
      return Array.from(dataTransfer?.items || []).some(
        (item) => item.kind === "file" && item.type.startsWith("image/"),
      );
    }

    function handleDragEnter(event: DragEvent) {
      if (!hasImageFiles(event.dataTransfer)) return;
      event.preventDefault();
      dragDepthRef.current += 1;
      setIsDraggingFiles(true);
    }

    function handleDragOver(event: DragEvent) {
      if (!hasImageFiles(event.dataTransfer)) return;
      event.preventDefault();
      event.dataTransfer!.dropEffect = "copy";
      setIsDraggingFiles(true);
    }

    function handleDragLeave(event: DragEvent) {
      event.preventDefault();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsDraggingFiles(false);
      }
    }

    function handleDrop(event: DragEvent) {
      if (!hasImageFiles(event.dataTransfer)) return;
      event.preventDefault();
      dragDepthRef.current = 0;
      setIsDraggingFiles(false);
      void addFiles(Array.from(event.dataTransfer?.files || []));
    }

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [addFiles]);

  function removeAttachment(attachmentId: string) {
    setAttachments((current) => current.filter((item) => item.id !== attachmentId));
  }

  function handleSubmit() {
    if ((!value.trim() && activeAttachments.length === 0) || isStreaming) return;
    sendMessage(value.trim(), activeAttachments);
    setValue("");
    setAttachments([]);
    setError("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const files = Array.from(e.clipboardData.files || []);
    if (!files.some((file) => file.type.startsWith("image/"))) return;

    e.preventDefault();
    void addFiles(files);
  }

  return (
    <div className="composer-shell">
      {isDraggingFiles ? (
        <div className="image-drop-overlay">
          <div className="image-drop-card">
            <i className="bi bi-images"></i>
            <span>Drop images to attach them</span>
          </div>
        </div>
      ) : null}

      <div className="composer-topbar">
        <ModelSelector />
        <span className="composer-hint">
          Press Enter to send, Shift + Enter for a new line
        </span>
      </div>

      <div className="input-box">
        <div className="composer-content">
          {activeAttachments.length > 0 ? (
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
          ) : null}

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

          {composerError ? <div className="composer-error">{composerError}</div> : null}
        </div>

        <div className="composer-actions">
          {imageUploadEnabled ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="visually-hidden"
                onChange={(e) => void addFiles(Array.from(e.target.files || []))}
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
          ) : null}

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
