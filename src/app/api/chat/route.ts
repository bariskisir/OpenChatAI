import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";
import { getProviderSecrets } from "@/lib/providers/keys";

export async function POST(req: NextRequest) {
  try {
    const { providerId, messages, model, stream = true } = await req.json();

    if (!providerId || !messages || !model) {
      return NextResponse.json(
        { error: "providerId, messages and model are required" },
        { status: 400 },
      );
    }

    const provider = getProvider(providerId);
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 400 },
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...provider.headers,
      ...getProviderSecrets(providerId),
    };

    const response = await fetch(provider.chatUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ messages, model, stream }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `API Error ${response.status}: ${errorText}` },
        { status: response.status },
      );
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
