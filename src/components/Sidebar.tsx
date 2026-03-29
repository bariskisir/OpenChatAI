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
          className="sidebar-backdrop d-md-none"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`sidebar ${sidebarOpen ? "open-mobile" : "collapsed"}`}
      >
        <div className="sidebar-panel">
          <div className="sidebar-brand-row">
            <div>
              <div className="sidebar-brand">OpenChatAI</div>
              <div className="sidebar-subtitle">Multi-model workspace</div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="btn-ghost d-md-none"
              title="Close sidebar"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <button onClick={createSession} className="btn-new-chat">
            <i className="bi bi-plus-lg"></i>
            Start new chat
          </button>

          <div className="sidebar-section-label">Recent sessions</div>
        </div>

        <div className="session-list">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`sidebar-session ${session.id === activeSessionId ? "active" : ""}`}
              onClick={() => {
                switchSession(session.id);
                if (window.innerWidth < 768) {
                  setSidebarOpen(false);
                }
              }}
            >
              <div className="session-icon">
                <i className="bi bi-chat-dots"></i>
              </div>

              <div className="session-copy">
                <span className="session-title">{session.title}</span>
                <span className="session-meta">{session.model}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSessionById(session.id);
                }}
                className="delete-btn always-visible d-md-none"
                title="Delete"
              >
                <i className="bi bi-trash3"></i>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSessionById(session.id);
                }}
                className="delete-btn d-none d-md-inline-flex"
                title="Delete"
              >
                <i className="bi bi-trash3"></i>
              </button>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <a
            href="https://www.bariskisir.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Created by <span className="fw-semibold">Baris Kisir</span>
          </a>
          <a
            href="https://github.com/bariskisir/OpenChatAI"
            target="_blank"
            rel="noopener noreferrer"
            className="d-flex align-items-center gap-1"
          >
            <i className="bi bi-github"></i>
            Source
          </a>
        </div>
      </div>
    </>
  );
}
