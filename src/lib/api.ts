import { Message } from "./types";
import { PROVIDERS, getProvider, DEFAULT_PROVIDER, DEFAULT_MODEL, getDefaultProvider } from "./providers";
import { supportsImageAttachments } from "./image-support";

export { PROVIDERS, getProvider, DEFAULT_PROVIDER, DEFAULT_MODEL, getDefaultProvider };

function toProviderMessage(message: Message) {
  if (!message.attachments?.length) {
    return { role: message.role, content: message.content };
  }

  const contentParts: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [];

  if (message.content.trim()) {
    contentParts.push({ type: "text", text: message.content });
  }

  for (const attachment of message.attachments) {
    contentParts.push({
      type: "image_url",
      image_url: { url: attachment.dataUrl },
    });
  }

  return {
    role: message.role,
    content: contentParts,
  };
}

function sanitizeMessagesForModel(
  providerId: string,
  model: string,
  messages: Message[],
): Message[] {
  if (supportsImageAttachments(providerId, model)) {
    return messages;
  }

  return messages.map((message) => {
    if (!message.attachments?.length) {
      return message;
    }

    return {
      ...message,
      attachments: undefined,
    };
  });
}

export async function streamChat(
  providerId: string,
  model: string,
  messages: Message[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const sanitizedMessages = sanitizeMessagesForModel(providerId, model, messages);

  const body = JSON.stringify({
    providerId,
    model,
    messages: sanitizedMessages.map(toProviderMessage),
  });

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      onError(`API Error ${res.status}: ${errText}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError("No response body");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";
    
    let hasReceivedChunk = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      if (!hasReceivedChunk) {
        onError("Request timed out (30s)");
        reader.cancel();
      }
    }, 30000);

    while (true) {
      const { done, value } = await reader.read();
      
      if (!hasReceivedChunk && timeoutId) {
        hasReceivedChunk = true;
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      if (done) {
        if (timeoutId) clearTimeout(timeoutId);
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") {
          if (timeoutId) clearTimeout(timeoutId);
          onDone();
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            onChunk(delta);
          }
        } catch {}
      }
    }

    if (timeoutId) clearTimeout(timeoutId);
    onDone();
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    onError(err instanceof Error ? err.message : "Unknown error");
  }
}
