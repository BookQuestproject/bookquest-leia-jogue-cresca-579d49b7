import { useCallback, useSyncExternalStore } from "react";

export type ShelfCategory = "lendo" | "quero-ler" | "lido" | "abandonado" | "favoritos" | "reelendo";

export interface ShelfBook {
  id: number;
  title: string;
  author: string;
  cover: string;
  category: ShelfCategory;
  progress?: number;
  rating?: number;
  review?: string;
}

const STORAGE_KEY = "bookquest-shelf";

const defaultBooks: ShelfBook[] = [];

// Global singleton store
let books: ShelfBook[] = (() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultBooks;
})();

const listeners = new Set<() => void>();

function emitChange() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  listeners.forEach(l => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return books;
}

export function useBookshelf() {
  const currentBooks = useSyncExternalStore(subscribe, getSnapshot);

  const addBook = useCallback((book: { id: number; title: string; author: string; cover: string }, category: ShelfCategory) => {
    const exists = books.find(b => b.title === book.title && b.author === book.author);
    if (exists) {
      books = books.map(b => (b.title === book.title && b.author === book.author) ? { ...b, ...book, category } : b);
    } else {
      const maxId = books.reduce((max, b) => Math.max(max, b.id), 0);
      books = [...books, { ...book, id: maxId + 1, category }];
    }
    emitChange();
  }, []);

  const removeBook = useCallback((bookTitle: string) => {
    const normalise = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const key = normalise(bookTitle);
    books = books.filter(b => normalise(b.title) !== key);
    emitChange();
  }, []);

  const moveBook = useCallback((bookId: number, newCategory: ShelfCategory) => {
    books = books.map(b => b.id === bookId ? { ...b, category: newCategory } : b);
    emitChange();
  }, []);

  const updateBook = useCallback((bookId: number, updates: Partial<ShelfBook>) => {
    books = books.map(b => b.id === bookId ? { ...b, ...updates } : b);
    emitChange();
  }, []);

  return { books: currentBooks, addBook, removeBook, moveBook, updateBook };
}
