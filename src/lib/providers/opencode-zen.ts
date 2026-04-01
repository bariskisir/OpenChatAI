import { Provider } from "@/lib/types";

export const openCodeZen: Provider = {
  id: "opencode-zen",
  name: "OpenCode Zen",
  chatUrl: "https://opencode.ai/zen/v1/chat/completions",
  headers: {
    "x-opencode-session": "",
  },
  availableModels: [
    { id: "mimo-v2-pro-free" },
    { id: "minimax-m2.5-free" },
    { id: "qwen3.6-plus-free" },
    { id: "mimo-v2-omni-free", supportsImageInput: true },
    { id: "nemotron-3-super-free" },
    { id: "big-pickle" },
    { id: "trinity-large-preview-free" },
    { id: "mimo-v2-flash-free" },
  ],
};

