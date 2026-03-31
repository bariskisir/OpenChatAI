import { getProvider, PROVIDERS } from "./providers";

export const MAX_IMAGE_ATTACHMENTS = 5;

export function supportsImageAttachments(
  providerId: string | undefined,
  model: string | undefined,
): boolean {
  if (!providerId || !model) return false;

  return Boolean(
    getProvider(providerId)?.availableModels.find((option) => option.id === model)
      ?.supportsImageInput,
  );
}

export function getImageUploadSupportMessage(): string {
  const supportedModels = PROVIDERS.flatMap((provider) => {
    const modelNames = provider.availableModels
      .filter((option) => option.supportsImageInput)
      .map((option) => option.name || option.id);

    if (modelNames.length === 0) {
      return [];
    }

    return `${provider.name}: ${modelNames.join(", ")}`;
  });

  if (supportedModels.length === 0) {
    return "Image upload is not available for any configured model.";
  }

  return `Image upload is only available for ${supportedModels.join("; ")}.`;
}
