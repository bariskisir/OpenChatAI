"use client";

import { useChatContext } from "@/contexts/ChatContext";

export default function Sidebar() {
  const {
    sessions,
    activeSessionId,
    createSession,
    switchSession,
    deleteSessionById,
    sidebarOpen,
    setSidebarOpen,
  } = useChatContext();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/90 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-30 flex w-64 flex-col gap-4 bg-background border-r border-border p-4 transition-transform duration-300 overflow-hidden md:relative md:translate-x-0 md:flex ${
          !sidebarOpen
            ? "md:-translate-x-full md:w-0 md:border-0 md:p-0 md:overflow-hidden"
            : ""
        }`}
      >
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={createSession}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-surface-hover"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New chat
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto gap-2 pr-1 pb-4 custom-scrollbar">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all border-2 ${
                session.id === activeSessionId
                  ? "border-white bg-surface-active shadow-sm text-white"
                  : "border-white/30 text-white/70 hover:bg-surface-hover hover:text-white"
              }`}
              onClick={() => {
                switchSession(session.id);
                if (window.innerWidth < 768) {
                  setSidebarOpen(false);
                }
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <span className="flex-1 truncate">{session.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSessionById(session.id);
                }}
                className="block md:hidden md:group-hover:block rounded p-1 text-text-muted transition-colors hover:text-error"
                title="Delete"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-4 px-1 pb-2 bg-background">
          <a
            href="https://www.bariskisir.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-white/50 transition-colors hover:text-white"
          >
            Created by <span className="font-semibold">Baris Kisir</span>
          </a>
          <a
            href="https://github.com/bariskisir/OpenChatAI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] text-white/50 transition-colors hover:text-white"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            Source
          </a>
        </div>
      </div>
    </>
  );
}
