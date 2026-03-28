import { Provider } from "@/lib/types";

export const cline: Provider = {
  id: "cline",
  name: "Cline",
  chatUrl: "https://api.cline.bot/api/v1/chat/completions",
  availableModels: [
    "moonshotai/kimi-k2.5",
    "z-ai/glm-5",
    "minimax/minimax-m2.5",
    "z-ai/glm-4.6",
    "xiaomi/mimo-v2-pro",
    "minimax/minimax-m2.5:free",
    "kwaipilot/kat-coder-pro",
    "arcee-ai/trinity-large-preview:free",
    "google/gemma-3-12b-it:free",
    "google/gemma-3-27b-it:free",
    "google/gemma-3-4b-it:free",
    "google/gemma-3n-e2b-it:free",
    "google/gemma-3n-e4b-it:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
  ],
};
