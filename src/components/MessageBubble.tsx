"use client";

import { Message } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function stripThinkTags(text: string): string {
  let result = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
  result = result.replace(/<think>[\s\S]*$/gi, "");
  return result.trim();
}

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageBubble({
  message,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const visibleContent = isUser
    ? message.content
    : stripThinkTags(message.content);
  const showTyping = !isUser && !visibleContent;

  return (
    <div
      className={`flex w-full animate-fade-in ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] md:max-w-3xl rounded-xl border px-3 py-2 md:px-4 md:py-3 text-[0.875rem] md:text-[0.925rem] leading-relaxed transition-colors ${
          isUser
            ? "bg-accent border-accent text-white shadow-sm"
            : "bg-surface border-border text-text-primary overflow-x-auto"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div
            className={`markdown-body ${isStreaming ? "cursor-blink" : ""}`}
          >
            {showTyping ? (
              <p className="flex items-center gap-1.5 min-h-[24px] !mb-0">
                <span
                  className="typing-dot h-1.5 w-1.5 rounded-full bg-text-secondary"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="typing-dot h-1.5 w-1.5 rounded-full bg-text-secondary"
                  style={{ animationDelay: "200ms" }}
                />
                <span
                  className="typing-dot h-1.5 w-1.5 rounded-full bg-text-secondary"
                  style={{ animationDelay: "400ms" }}
                />
              </p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code(props) {
                    const { children, className, node, ref, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <SyntaxHighlighter
                        {...rest}
                        PreTag="div"
                        language={match[1]}
                        style={vscDarkPlus}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code {...rest} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {visibleContent}
              </ReactMarkdown>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
