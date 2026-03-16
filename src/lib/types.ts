export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
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
  availableModels: string[];
}

export interface ModelOption {
  id: string;
  name: string;
}
