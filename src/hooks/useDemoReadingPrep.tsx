import { useSyncExternalStore } from "react";

/** Estado do Guia de Preparação para Leitura (Demo Aluno) */
export interface ReadingPrepState {
  completed: boolean;
  completedAt?: number;
  /** Horário de leitura escolhido na etapa 2 */
  readingMoment?: string;
  /** Vocabulário pessoal do aluno: palavras salvas */
  vocabulary: VocabularyEntry[];
}

export interface VocabularyEntry {
  word: string;
  meaning?: string;
  synonyms?: string[];
  example?: string;
  savedAt: number;
  chapter?: string;
}

const STORAGE_KEY = "bookquest_demo_reading_prep";

const listeners = new Set<() => void>();
let state: ReadingPrepState = load();

function load(): ReadingPrepState {
  if (typeof window === "undefined") return { completed: false, vocabulary: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: false, vocabulary: [] };
    const parsed = JSON.parse(raw);
    return {
      completed: !!parsed.completed,
      completedAt: parsed.completedAt,
      readingMoment: parsed.readingMoment,
      vocabulary: Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [],
    };
  } catch {
    return { completed: false, vocabulary: [] };
  }
}

function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export const demoReadingPrepStore = {
  get(): ReadingPrepState {
    return state;
  },
  setMoment(moment: string) {
    state = { ...state, readingMoment: moment };
    persist();
  },
  complete() {
    state = { ...state, completed: true, completedAt: Date.now() };
    persist();
  },
  reset() {
    state = { completed: false, vocabulary: [] };
    persist();
  },
  saveWord(entry: Omit<VocabularyEntry, "savedAt">) {
    const exists = state.vocabulary.find((v) => v.word.toLowerCase() === entry.word.toLowerCase());
    if (exists) return;
    state = {
      ...state,
      vocabulary: [{ ...entry, savedAt: Date.now() }, ...state.vocabulary].slice(0, 100),
    };
    persist();
  },
  removeWord(word: string) {
    state = {
      ...state,
      vocabulary: state.vocabulary.filter((v) => v.word.toLowerCase() !== word.toLowerCase()),
    };
    persist();
  },
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

export function useDemoReadingPrep() {
  return useSyncExternalStore(subscribe, getSnapshot, () => state);
}
