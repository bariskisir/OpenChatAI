# OpenChatAI

A ChatGPT-like open chat interface built with Next.js, TypeScript, and Tailwind CSS. Supports multiple AI providers with streaming responses, session management, and a clean dark theme.

## Live Demo

**[open-chat-ai-green.vercel.app](https://open-chat-ai-green.vercel.app)**

## Features

- **ChatGPT-like UI** - Clean, modern dark theme interface
- **Streaming Responses** - Real-time token-by-token response display (SSE)
- **Session Management** - Create, switch, and delete chat sessions stored in LocalStorage
- **Dynamic Model Selection** - Models fetched from API and intersected with configured list

## Supported Providers

### OpenCode Zen
- **Models:** minimax-m2.5-free (default), nemotron-3-super-free, big-pickle, trinity-large-preview-free, mimo-v2-flash-free

### OpenRouter
- **Models:** hunter-alpha, healer-alpha, trinity-large-preview:free, nemotron-3-nano-30b-a3b:free, trinity-mini:free, openrouter/free

### Together AI
- **Models:** ServiceNow-AI/Apriel-1.6-15b-Thinker, ServiceNow-AI/Apriel-1.5-15b-Thinker

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State:** React Context + LocalStorage
- **Streaming:** Server-Sent Events (SSE)
- **Deploy:** Vercel

## License

MIT
