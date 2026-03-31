import { Provider } from "@/lib/types";

export const cline: Provider = {
  id: "cline",
  name: "Cline",
  chatUrl: "https://api.cline.bot/api/v1/chat/completions",
  availableModels: [
    { id: "minimax/minimax-m2.5" },
    { id: "moonshotai/kimi-k2.5", supportsImageInput: true },
    { id: "z-ai/glm-5" },
    { id: "z-ai/glm-4.6" },
    { id: "xiaomi/mimo-v2-pro" },
    { id: "minimax/minimax-m2.5:free" },
    { id: "kwaipilot/kat-coder-pro" },
    { id: "arcee-ai/trinity-large-preview:free" },
    { id: "google/gemma-3-12b-it:free", supportsImageInput: true },
    { id: "google/gemma-3-27b-it:free", supportsImageInput: true },
    { id: "google/gemma-3-4b-it:free", supportsImageInput: true },
    { id: "google/gemma-3n-e2b-it:free" },
    { id: "google/gemma-3n-e4b-it:free" },
    { id: "nvidia/nemotron-3-super-120b-a12b:free" },
  ],
};
