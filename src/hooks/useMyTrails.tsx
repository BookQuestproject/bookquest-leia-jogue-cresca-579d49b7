import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "bookquest-my-trails";

let myTrailIds: string[] = (() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
})();

const listeners = new Set<() => void>();

function emitChange() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(myTrailIds));
  listeners.forEach(l => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return myTrailIds;
}

export function useMyTrails() {
  const trails = useSyncExternalStore(subscribe, getSnapshot);

  const addTrail = useCallback((bookTitle: string) => {
    const normalise = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const key = normalise(bookTitle);
    if (!myTrailIds.some(t => normalise(t) === key)) {
      myTrailIds = [...myTrailIds, bookTitle];
      emitChange();
    }
  }, []);

  const removeTrail = useCallback((bookTitle: string) => {
    const normalise = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const key = normalise(bookTitle);
    myTrailIds = myTrailIds.filter(t => normalise(t) !== key);
    emitChange();
  }, []);

  const isInMyTrails = useCallback((bookTitle: string) => {
    const normalise = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const key = normalise(bookTitle);
    return trails.some(t => normalise(t) === key);
  }, [trails]);

  return { myTrailIds: trails, addTrail, removeTrail, isInMyTrails };
}
