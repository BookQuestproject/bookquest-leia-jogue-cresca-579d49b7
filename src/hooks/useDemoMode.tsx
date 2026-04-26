import { useSyncExternalStore } from "react";

export type DemoRole = "student" | "teacher";

export interface DemoSession {
  role: DemoRole;
  startedAt: number;
}

const STORAGE_KEY = "bookquest_demo_session";

const listeners = new Set<() => void>();
let currentSession: DemoSession | null = loadSession();

function loadSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoSession;
  } catch {
    return null;
  }
}

function saveSession(session: DemoSession | null) {
  if (typeof window === "undefined") return;
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export const demoStore = {
  start(role: DemoRole) {
    currentSession = { role, startedAt: Date.now() };
    saveSession(currentSession);
    emit();
  },
  end() {
    currentSession = null;
    saveSession(null);
    emit();
  },
  get(): DemoSession | null {
    return currentSession;
  },
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return currentSession;
}

export function useDemoMode() {
  const session = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return {
    isDemo: session !== null,
    role: session?.role ?? null,
    startDemo: demoStore.start,
    endDemo: demoStore.end,
  };
}
