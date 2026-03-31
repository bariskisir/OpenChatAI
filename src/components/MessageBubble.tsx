"use client";

import Image from "next/image";
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
  const attachments = message.attachments || [];
  const visibleContent = isUser
    ? message.content
    : stripThinkTags(message.content);
  const showTyping = !isUser && !visibleContent;

  return (
    <div className={`message-row ${isUser ? "user" : "assistant"}`}>
      {!isUser && (
        <div className="message-avatar assistant">
          <i className="bi bi-stars"></i>
        </div>
      )}

      <div className="message-stack">
        <div className={`message-meta ${isUser ? "user" : "assistant"}`}>
          <span>{isUser ? "You" : "Assistant"}</span>
        </div>

        <div className={`message-bubble ${isUser ? "user" : "assistant"}`}>
          {isUser ? (
            <div className="user-message-content">
              {message.content ? (
                <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{message.content}</p>
              ) : null}

              {attachments.length > 0 ? (
                <div className="message-image-grid">
                  {attachments.map((attachment) => (
                    <Image
                      key={attachment.id}
                      src={attachment.dataUrl}
                      alt={attachment.name}
                      className="message-image"
                      width={1200}
                      height={900}
                      unoptimized
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div
              className={`markdown-body ${isStreaming ? "cursor-blink" : ""}`}
            >
              {showTyping ? (
                <p
                  className="d-flex align-items-center gap-2 mb-0"
                  style={{ minHeight: 24 }}
                >
                  <span className="typing-dot" style={{ animationDelay: "0ms" }} />
                  <span className="typing-dot" style={{ animationDelay: "200ms" }} />
                  <span className="typing-dot" style={{ animationDelay: "400ms" }} />
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

      {isUser && (
        <div className="message-avatar user">
          <i className="bi bi-person"></i>
        </div>
      )}
    </div>
  );
}
