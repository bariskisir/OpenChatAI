import { Provider } from "@/lib/types";

export const openCodeZen: Provider = {
  id: "opencode-zen",
  name: "OpenCode Zen",
  chatUrl: "https://opencode.ai/zen/v1/chat/completions",
  headers: {
    "x-opencode-session": "",
  },
  availableModels: [
    { id: "minimax-m2.5-free" },
    { id: "qwen3.6-plus-free" },
    { id: "nemotron-3-super-free" },
    { id: "big-pickle" },
  ],
};

