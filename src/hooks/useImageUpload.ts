import { useState, useRef, useEffect, useCallback } from "react";
import { ImageAttachment } from "@/lib/types";
import { MAX_IMAGE_ATTACHMENTS, getImageUploadSupportMessage } from "@/lib/image-support";

export function useImageUpload(imageUploadEnabled: boolean) {
  const [attachments, setAttachments] = useState<ImageAttachment[]>([]);
  const [error, setError] = useState("");
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const dragDepthRef = useRef(0);

  const activeAttachments = imageUploadEnabled ? attachments : [];

  const fileToAttachment = async (file: File): Promise<ImageAttachment> => {
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
  };

  const addFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

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
    [activeAttachments.length, imageUploadEnabled]
  );

  useEffect(() => {
    function hasImageFiles(dataTransfer: DataTransfer | null) {
      return Array.from(dataTransfer?.items || []).some(
        (item) => item.kind === "file" && item.type.startsWith("image/")
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

  const removeAttachment = useCallback((attachmentId: string) => {
    setAttachments((current) => current.filter((item) => item.id !== attachmentId));
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  return {
    attachments,
    activeAttachments,
    setAttachments,
    error,
    setError,
    isDraggingFiles,
    addFiles,
    removeAttachment,
    clearAttachments,
  };
}
