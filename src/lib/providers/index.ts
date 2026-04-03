import { cline } from "./cline";
import { openCodeZen } from "./opencode-zen";
import { Provider } from "@/lib/types";

export const PROVIDERS: Provider[] = [cline, openCodeZen];

export const DEFAULT_PROVIDER = process.env.DEFAULT_PROVIDER || "cline";
export const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "minimax/minimax-m2.5";

export function getProvider(providerId: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === providerId);
}

export function getDefaultProvider(): Provider {
  return getProvider(DEFAULT_PROVIDER) || PROVIDERS[0];
}


