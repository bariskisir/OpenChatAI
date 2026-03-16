import { Provider } from "@/lib/types";

export const openCodeZen: Provider = {
  id: "opencode-zen",
  name: "OpenCode Zen",
  chatUrl: "https://opencode.ai/zen/v1/chat/completions",
  headers: {
    "x-opencode-session": "",
  },
  availableModels: [
    "minimax-m2.5-free",
    "nemotron-3-super-free",
    "big-pickle",
    "trinity-large-preview-free",
    "mimo-v2-flash-free",
  ],
};

