import { Provider } from "@/lib/types";

export const together: Provider = {
  id: "together",
  name: "Together AI",
  chatUrl: "https://api.together.xyz/v1/chat/completions",
  availableModels: [
    "ServiceNow-AI/Apriel-1.6-15b-Thinker",
    "ServiceNow-AI/Apriel-1.5-15b-Thinker",
  ],
};
