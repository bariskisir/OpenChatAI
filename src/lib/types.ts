export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: ImageAttachment[];
  createdAt: number;
}

export interface ImageAttachment {
  id: string;
  name: string;
  mimeType: string;
  dataUrl: string;
}

export interface ChatSession {
  id: string;
  title: string;
  model: string;
  provider: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Provider {
  id: string;
  name: string;
  chatUrl: string;
  headers?: Record<string, string>;
  availableModels: ModelOption[];
}

export interface ModelOption {
  id: string;
  name?: string;
  supportsImageInput?: boolean;
}
