import { useCallback, useSyncExternalStore } from "react";

export interface ActiveTrailData {
  bookId: string;
  title: string;
  author: string;
  cover: string;
  genre: string;
  themeColor: string;
  totalChapters: number;
  chapters: {
    id: number;
    title: string;
    status: "completed" | "current" | "locked";
    icon: string;
    currentPage?: number;
    totalPages?: number;
    question?: {
      text: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    };
  }[];
}

const STORAGE_KEY = "bookquest-active-trail";

let activeTrail: ActiveTrailData | null = (() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
})();

const listeners = new Set<() => void>();

function emitChange() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activeTrail));
  listeners.forEach(l => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return activeTrail;
}

export function useActiveTrail() {
  const trail = useSyncExternalStore(subscribe, getSnapshot);

  const setActiveTrail = useCallback((data: ActiveTrailData) => {
    activeTrail = data;
    emitChange();
  }, []);

  const clearActiveTrail = useCallback(() => {
    activeTrail = null;
    localStorage.removeItem(STORAGE_KEY);
    listeners.forEach(l => l());
  }, []);

  return { activeTrail: trail, setActiveTrail, clearActiveTrail };
}
