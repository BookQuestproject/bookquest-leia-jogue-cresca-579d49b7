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

const defaultBooks: ShelfBook[] = [
  { id: 1, title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", cover: "https://m.media-amazon.com/images/I/81ibfYk4qmL._AC_UF1000,1000_QL80_.jpg", category: "lendo", progress: 65 },
  { id: 2, title: "O Senhor dos Anéis", author: "J.R.R. Tolkien", cover: "https://m.media-amazon.com/images/I/81j7E0oFdRL._AC_UF1000,1000_QL80_.jpg", category: "quero-ler" },
  { id: 3, title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", cover: "https://m.media-amazon.com/images/I/71OZY035QKL._AC_UF1000,1000_QL80_.jpg", category: "lido", rating: 5, review: "Leitura incrível!" },
  { id: 4, title: "1984", author: "George Orwell", cover: "https://m.media-amazon.com/images/I/819js3EQwbL._AC_UF1000,1000_QL80_.jpg", category: "lido", rating: 4 },
  { id: 5, title: "Dom Casmurro", author: "Machado de Assis", cover: "https://m.media-amazon.com/images/I/61wezcT0yJL._AC_UF1000,1000_QL80_.jpg", category: "abandonado" },
  { id: 6, title: "O Hobbit", author: "J.R.R. Tolkien", cover: "https://m.media-amazon.com/images/I/91b0C2YNSrL._AC_UF1000,1000_QL80_.jpg", category: "favoritos", rating: 5 },
];

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

  const moveBook = useCallback((bookId: number, newCategory: ShelfCategory) => {
    books = books.map(b => b.id === bookId ? { ...b, category: newCategory } : b);
    emitChange();
  }, []);

  const updateBook = useCallback((bookId: number, updates: Partial<ShelfBook>) => {
    books = books.map(b => b.id === bookId ? { ...b, ...updates } : b);
    emitChange();
  }, []);

  return { books: currentBooks, addBook, moveBook, updateBook };
}
