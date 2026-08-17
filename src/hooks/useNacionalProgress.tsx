import { useCallback, useSyncExternalStore } from "react";
import type { QuestionCategory } from "@/data/nacional/pagadorDePromessas";

export interface CategoryScore {
  correct: number;
  total: number;
}

export interface WorkProgress {
  /** partes concluídas (leitura confirmada) */
  completedParts: number[];
  /** desempenho acumulado por categoria */
  scores: Record<QuestionCategory, CategoryScore>;
  /** respostas corretas / total geral */
  answered: number;
  correct: number;
  /** histórico dos simulados (Modo Prova) */
  exams: { date: string; correct: number; total: number }[];
}

type Store = Record<string, WorkProgress>;

const STORAGE_KEY = "bookquest-nacional-progress";

const emptyProgress = (): WorkProgress => ({
  completedParts: [],
  scores: {
    historia: { correct: 0, total: 0 },
    personagens: { correct: 0, total: 0 },
    detalhes: { correct: 0, total: 0 },
    interpretacao: { correct: 0, total: 0 },
  },
  answered: 0,
  correct: 0,
  exams: [],
});

let store: Store = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    /* ignore */
  }
  return {};
})();

const listeners = new Set<() => void>();

function emit() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return store;
}

export function useNacionalProgress(workId: string) {
  const all = useSyncExternalStore(subscribe, getSnapshot);
  const progress = all[workId] ?? emptyProgress();

  const completePart = useCallback(
    (partId: number) => {
      const current = store[workId] ?? emptyProgress();
      if (current.completedParts.includes(partId)) return;
      store = {
        ...store,
        [workId]: { ...current, completedParts: [...current.completedParts, partId].sort((a, b) => a - b) },
      };
      emit();
    },
    [workId],
  );

  const registerAnswer = useCallback(
    (category: QuestionCategory, isCorrect: boolean) => {
      const current = store[workId] ?? emptyProgress();
      const cat = current.scores[category] ?? { correct: 0, total: 0 };
      store = {
        ...store,
        [workId]: {
          ...current,
          answered: current.answered + 1,
          correct: current.correct + (isCorrect ? 1 : 0),
          scores: {
            ...current.scores,
            [category]: { correct: cat.correct + (isCorrect ? 1 : 0), total: cat.total + 1 },
          },
        },
      };
      emit();
    },
    [workId],
  );

  const registerExam = useCallback(
    (correct: number, total: number) => {
      const current = store[workId] ?? emptyProgress();
      store = {
        ...store,
        [workId]: {
          ...current,
          exams: [{ date: new Date().toISOString(), correct, total }, ...current.exams].slice(0, 20),
        },
      };
      emit();
    },
    [workId],
  );

  const reset = useCallback(() => {
    store = { ...store, [workId]: emptyProgress() };
    emit();
  }, [workId]);

  return { progress, completePart, registerAnswer, registerExam, reset };
}
