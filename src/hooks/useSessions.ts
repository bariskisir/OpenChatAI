import { useState, useEffect, useCallback } from "react";
import { ChatSession, Provider } from "@/lib/types";
import { loadSessions, saveSessions } from "@/lib/storage";
import { PROVIDERS, DEFAULT_PROVIDER, DEFAULT_MODEL, getDefaultProvider } from "@/lib/api";

function generateId(): string {
  return crypto.randomUUID();
}

export function useSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>(getDefaultProvider());

  useEffect(() => {
    let loadedSessions = loadSessions();
    if (loadedSessions.length === 0) {
      loadedSessions = [
        {
          id: generateId(),
          title: "New Chat",
          model: DEFAULT_MODEL,
          provider: DEFAULT_PROVIDER,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
    }
    // Timeout to avoid hydration mismatches
    setTimeout(() => {
      setSessions(loadedSessions);
      setActiveSessionId(loadedSessions[0].id);
    }, 0);
  }, []);

  const persist = useCallback((newSessions: ChatSession[]) => {
    saveSessions(newSessions);
  }, []);

  const createSession = useCallback(() => {
    const newSession: ChatSession = {
      id: generateId(),
      title: "New Chat",
      model: DEFAULT_MODEL,
      provider: DEFAULT_PROVIDER,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    setSessions((prev) => {
      const updated = [newSession, ...prev];
      persist(updated);
      return updated;
    });
    setActiveSessionId(newSession.id);
    setProvider(getDefaultProvider());
  }, [persist]);

  const switchSession = useCallback((id: string) => {
    setSessions((prevSessions) => {
      const session = prevSessions.find((s) => s.id === id);
      setProvider((prevProvider) => 
        session ? PROVIDERS.find((p) => p.id === session.provider) || prevProvider : prevProvider
      );
      return prevSessions;
    });
    setActiveSessionId(id);
  }, []);

  const deleteSessionById = useCallback((id: string) => {
    setSessions((prev) => {
      let updatedSessions = prev.filter((s) => s.id !== id);

      let nextActiveId = activeSessionId === id
        ? updatedSessions.length > 0
          ? updatedSessions[0].id
          : null
        : activeSessionId;

      if (updatedSessions.length === 0) {
        const newSession: ChatSession = {
          id: generateId(),
          title: "New Chat",
          model: DEFAULT_MODEL,
          provider: DEFAULT_PROVIDER,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        updatedSessions = [newSession];
        nextActiveId = newSession.id;
      }

      persist(updatedSessions);
      setActiveSessionId(nextActiveId);
      
      // Update provider explicitly if active session changed
      if (nextActiveId) {
        const session = updatedSessions.find((s) => s.id === nextActiveId);
        if (session) {
          setProvider((currProv) => PROVIDERS.find((p) => p.id === session.provider) || currProv);
        }
      }

      return updatedSessions;
    });
  }, [activeSessionId, persist]);

  const setModel = useCallback((model: string, providerId?: string) => {
    setSessions((prev) => {
      if (!activeSessionId) return prev;
      const updatedSessions = prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            model,
            provider: providerId || s.provider,
            updatedAt: Date.now(),
          };
        }
        return s;
      });

      persist(updatedSessions);
      return updatedSessions;
    });

    if (providerId) {
      setProvider((prev) => PROVIDERS.find((p) => p.id === providerId) || prev);
    }
  }, [activeSessionId, persist]);

  const updateSession = useCallback((sessionId: string, updater: (session: ChatSession) => ChatSession) => {
    setSessions((prev) => {
      const updated = prev.map(s => s.id === sessionId ? updater(s) : s);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  return {
    sessions,
    activeSessionId,
    activeSession,
    provider,
    createSession,
    switchSession,
    deleteSessionById,
    setModel,
    updateSession,
    setActiveSessionId,
  };
}
