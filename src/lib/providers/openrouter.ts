import { Provider } from "@/lib/types";

export const openRouter: Provider = {
  id: "openrouter",
  name: "OpenRouter",
  chatUrl: "https://openrouter.ai/api/v1/chat/completions",
  availableModels: [
    { id: "arcee-ai/trinity-large-preview:free" },
    { id: "nvidia/nemotron-3-nano-30b-a3b:free" },
    { id: "arcee-ai/trinity-mini:free" },
    { id: "openrouter/free" },
  ],
};

