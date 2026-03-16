import { ChatSession } from "./types";

const STORAGE_KEY = "openaichat_sessions";

export function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatSession[];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: ChatSession[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function deleteSession(sessionId: string): ChatSession[] {
  const sessions = loadSessions().filter((s) => s.id !== sessionId);
  saveSessions(sessions);
  return sessions;
}

export function upsertSession(session: ChatSession): ChatSession[] {
  const sessions = loadSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  saveSessions(sessions);
  return sessions;
}
