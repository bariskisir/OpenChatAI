import { Provider } from "@/lib/types";

export const cline: Provider = {
  id: "cline",
  name: "Cline",
  chatUrl: "https://api.cline.bot/api/v1/chat/completions",
  availableModels: [
    { id: "minimax/minimax-m2.5" },
    { id: "moonshotai/kimi-k2.5", supportsImageInput: true },
    { id: "z-ai/glm-5" },
    { id: "xiaomi/mimo-v2-pro" },
    { id: "minimax/minimax-m2.5:free" },
    { id: "kwaipilot/kat-coder-pro" },
  ],
};
