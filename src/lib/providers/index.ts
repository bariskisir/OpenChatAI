import { openCodeZen } from "./opencode-zen";
import { openRouter } from "./openrouter";
import { Provider } from "@/lib/types";

export const PROVIDERS: Provider[] = [openCodeZen, openRouter];

export const DEFAULT_PROVIDER = process.env.DEFAULT_PROVIDER || "opencode-zen";
export const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "minimax-m2.5-free";

export function getProvider(providerId: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === providerId);
}

export function getDefaultProvider(): Provider {
  return getProvider(DEFAULT_PROVIDER) || PROVIDERS[0];
}


