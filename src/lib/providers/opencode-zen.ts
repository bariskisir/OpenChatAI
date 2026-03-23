import { Provider } from "@/lib/types";

export const openCodeZen: Provider = {
  id: "opencode-zen",
  name: "OpenCode Zen",
  chatUrl: "https://opencode.ai/zen/v1/chat/completions",
  headers: {
    "x-opencode-session": "",
  },
  availableModels: [
    "mimo-v2-pro-free",
    "minimax-m2.5-free",
    "mimo-v2-omni-free",
    "nemotron-3-super-free",
    "big-pickle",
    "trinity-large-preview-free",
    "mimo-v2-flash-free",
  ],
};

