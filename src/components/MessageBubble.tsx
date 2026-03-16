"use client";

import { Message } from "@/lib/types";

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const label = lang
      ? `<div class="text-xs text-text-muted px-4 py-1 border-b border-border">${lang}</div>`
      : "";
    return `<pre>${label}<code>${code.trim()}</code></pre>`;
  });

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  html = html.replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>");

  html = html.replace(/^---$/gm, "<hr />");

  const lines = html.split("\n");
  let result = "";
  let inList = false;
  let listType = "";

  for (const line of lines) {
    const ulMatch = line.match(/^[-*] (.+)$/);
    const olMatch = line.match(/^\d+\. (.+)$/);

    if (ulMatch) {
      if (!inList || listType !== "ul") {
        if (inList) result += listType === "ol" ? "</ol>" : "</ul>";
        result += "<ul>";
        inList = true;
        listType = "ul";
      }
      result += `<li>${ulMatch[1]}</li>`;
    } else if (olMatch) {
      if (!inList || listType !== "ol") {
        if (inList) result += listType === "ol" ? "</ol>" : "</ul>";
        result += "<ol>";
        inList = true;
        listType = "ol";
      }
      result += `<li>${olMatch[1]}</li>`;
    } else {
      if (inList) {
        result += listType === "ol" ? "</ol>" : "</ul>";
        inList = false;
      }
      result += line + "\n";
    }
  }
  if (inList) result += listType === "ol" ? "</ol>" : "</ul>";

  result = result.replace(
    /(?:^|\n\n)(?!<[hupob]|<li|<hr|<code|<pre|<strong|<em|<a |<blockquote)(.+?)(?=\n\n|$)/gs,
    (match, content) => {
      const trimmed = content.trim();
      if (!trimmed || trimmed.startsWith("<")) return match;
      return `<p>${trimmed}</p>`;
    },
  );

  return result;
}

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
  const showTyping = !isUser && !visibleContent && isStreaming;

  return (
    <div
      className={`flex w-full animate-fade-in ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] md:max-w-xl rounded-xl border px-3 py-2 md:px-4 md:py-3 text-[0.875rem] md:text-[0.925rem] leading-relaxed transition-colors ${
          isUser
            ? "bg-accent border-accent text-white shadow-sm"
            : "bg-surface border-border text-text-primary"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : showTyping ? (
          <div className="flex items-center gap-2 py-1">
            <span
              className="typing-dot h-2 w-2 rounded-full bg-text-secondary"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="typing-dot h-2 w-2 rounded-full bg-text-secondary"
              style={{ animationDelay: "200ms" }}
            />
            <span
              className="typing-dot h-2 w-2 rounded-full bg-text-secondary"
              style={{ animationDelay: "400ms" }}
            />
          </div>
        ) : visibleContent ? (
          <div
            className={`markdown-body ${isStreaming ? "cursor-blink" : ""}`}
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(visibleContent),
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
