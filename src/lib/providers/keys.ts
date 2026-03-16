export function getProviderSecrets(providerId: string): Record<string, string> {
  const headers: Record<string, string> = {};

  const envVarName = `${providerId.toUpperCase().replace(/-/g, "_")}_API_KEY`;
  const apiKey = process.env[envVarName];

  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  return headers;
}
