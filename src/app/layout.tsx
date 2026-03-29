import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ChatProvider } from "@/contexts/ChatContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "OpenChatAI",
  description: "Open-source ChatGPT-like interface with multiple AI providers",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-bs-theme="dark">
      <body>
        <ChatProvider>{children}</ChatProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            document.addEventListener('touchstart', function(event) {
              if (event.touches.length > 1) {
                event.preventDefault();
              }
            }, { passive: false });
          `,
          }}
        />
      </body>
    </html>
  );
}
