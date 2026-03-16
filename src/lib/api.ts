import { Message } from "./types";
import { PROVIDERS, getProvider, DEFAULT_PROVIDER, DEFAULT_MODEL, getDefaultProvider } from "./providers";

export { PROVIDERS, getProvider, DEFAULT_PROVIDER, DEFAULT_MODEL, getDefaultProvider };

export async function streamChat(
  providerId: string,
  model: string,
  messages: Message[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const body = JSON.stringify({
    providerId,
    model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
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

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") {
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

    onDone();
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    onError(err instanceof Error ? err.message : "Unknown error");
  }
}
