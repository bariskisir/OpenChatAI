import { Provider } from "@/lib/types";

export const cline: Provider = {
  id: "cline",
  name: "Cline",
  chatUrl: "https://api.cline.bot/api/v1/chat/completions",
  availableModels: [
    { id: "moonshotai/kimi-k2.5", supportsImageInput: true }
  ],
};
