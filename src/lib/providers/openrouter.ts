import { Provider } from "@/lib/types";

export const openRouter: Provider = {
  id: "openrouter",
  name: "OpenRouter",
  chatUrl: "https://openrouter.ai/api/v1/chat/completions",
  availableModels: [
    "arcee-ai/trinity-large-preview:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "arcee-ai/trinity-mini:free",
    "openrouter/free",
  ],
};

