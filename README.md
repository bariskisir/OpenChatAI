# OpenChatAI

A ChatGPT-like open chat interface built with Next.js, TypeScript, and Tailwind CSS. Supports multiple AI providers with streaming responses, session management, and a clean dark theme.

## Live Demo

**[open-chat-ai-green.vercel.app](https://open-chat-ai-green.vercel.app)**

## Features

- **ChatGPT-like UI** - Clean, modern dark theme interface
- **Streaming Responses** - Real-time token-by-token response display (SSE)
- **Session Management** - Create, switch, and delete chat sessions stored in LocalStorage
- **Dynamic Model Selection** - Models fetched from API and intersected with configured list

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State:** React Context + LocalStorage
- **Streaming:** Server-Sent Events (SSE)
- **Deploy:** Vercel

## Installation - Local

1. Clone the repository
2. Install dependencies: `npm install`
3. Add .env file with the template below. You can get all API keys for free from the providers.
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

#### .env template

```env
CLINE_API_KEY=INSERT_API_KEY_HERE
```

## License

MIT
