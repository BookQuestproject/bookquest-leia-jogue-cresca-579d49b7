import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { BookOpen, Lock, CheckCircle, Crown, Play, ArrowLeft, HelpCircle, Bookmark, Plus, Clock, MapPin } from "lucide-react";
import { useActiveTrail } from "@/hooks/useActiveTrail";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChapterProgress } from "@/hooks/useChapterProgress";
import { usePageBookmark } from "@/hooks/usePageBookmark";
import BookmarkMarker from "@/components/BookmarkMarker";
import CompletedChapterModal from "@/components/CompletedChapterModal";

interface Chapter {
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
}

interface BookTrail {
  id: string;
  title: string;
  author: string;
  cover: string;
  coverImage?: string;
  totalChapters: number;
  chapters: Chapter[];
  isPremium: boolean;
  genre: string;
  themeColor: string;
}

// Generate chapters automatically from page count
const generateChapters = (totalPages: number, chaptersCount?: number): Chapter[] => {
  const numChapters = chaptersCount || Math.max(5, Math.min(25, Math.ceil(totalPages / 20)));
  const pagesPerChapter = Math.ceil(totalPages / numChapters);
  const icons = ["📖", "📝", "🔍", "💡", "🌟", "📚", "🎯", "🏆", "🔑", "🌙", "⚡", "🎭", "🗺️", "💎", "🌊", "🔥", "🎪", "🏰", "⭐", "🎨", "🌈", "🪶", "🧩", "🎶", "🌿"];
  return Array.from({ length: numChapters }, (_, i) => ({
    id: i + 1,
    title: `Capítulo ${i + 1}`,
    status: (i === 0 ? "current" : "locked") as "completed" | "current" | "locked",
    icon: icons[i % icons.length],
    totalPages: i === numChapters - 1 ? totalPages - pagesPerChapter * i : pagesPerChapter,
  }));
};

const bookTrails: BookTrail[] = [
  {
    id: "harry-potter-1",
    title: "Harry Potter e a Pedra Filosofal",
    author: "J.K. Rowling",
    cover: "🏰",
    coverImage: "https://m.media-amazon.com/images/I/81ibfYk4qmL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 17,
    isPremium: false,
    genre: "Fantasia",
    themeColor: "350 45% 32%",
    chapters: [
      { id: 1, title: "O Menino que Sobreviveu", status: "current", icon: "🏠", currentPage: 12, totalPages: 24,
        question: { text: "Por que os Dursley tinham tanto medo de que os vizinhos descobrissem sobre os Potter?", options: ["Porque os Potter eram criminosos procurados", "Porque não queriam ser associados a algo 'anormal'", "Porque deviam dinheiro aos Potter", "Porque os Potter eram celebridades famosas"], correctAnswer: 1, explanation: "Os Dursley valorizavam acima de tudo a 'normalidade' e temiam qualquer associação com o mundo mágico." }
      },
      { id: 2, title: "O Vidro que Sumiu", status: "locked", icon: "🐍", totalPages: 18 },
      { id: 3, title: "As Cartas de Ninguém", status: "locked", icon: "✉️", totalPages: 22 },
      { id: 4, title: "O Guardião das Chaves", status: "locked", icon: "🗝️", totalPages: 20 },
      { id: 5, title: "O Beco Diagonal", status: "locked", icon: "🏪", totalPages: 28 },
      { id: 6, title: "A Viagem da Plataforma", status: "locked", icon: "🚂", totalPages: 18 },
      { id: 7, title: "O Chapéu Seletor", status: "locked", icon: "🎩", totalPages: 16 },
      { id: 8, title: "O Mestre das Poções", status: "locked", icon: "⚗️", totalPages: 20 },
      { id: 9, title: "O Duelo à Meia-Noite", status: "locked", icon: "⚔️", totalPages: 22 },
      { id: 10, title: "O Espelho de Ojesed", status: "locked", icon: "🪞", totalPages: 24 },
    ]
  },
  {
    id: "percy-jackson-1",
    title: "Percy Jackson e o Ladrão de Raios",
    author: "Rick Riordan",
    cover: "⚡",
    coverImage: "/images/covers/percy-jackson.jpg",
    totalChapters: 22,
    isPremium: false,
    genre: "Mitologia",
    themeColor: "210 55% 30%",
    chapters: [
      { id: 1, title: "Eu Vaporizo Minha Professora", status: "completed", icon: "⚡", currentPage: 15, totalPages: 15 },
      { id: 2, title: "Três Velhas Tricotando", status: "current", icon: "🧶", currentPage: 8, totalPages: 18 },
      { id: 3, title: "Grover Perde as Calças", status: "locked", icon: "🐐", totalPages: 20 },
    ]
  },
  {
    id: "dom-casmurro",
    title: "Dom Casmurro",
    author: "Machado de Assis",
    cover: "📜",
    coverImage: "/images/covers/dom-casmurro.jpg",
    totalChapters: 15,
    isPremium: false,
    genre: "Romance Brasileiro",
    themeColor: "35 40% 28%",
    chapters: [
      { id: 1, title: "Do título", status: "current", icon: "📜", currentPage: 4, totalPages: 8 },
      { id: 2, title: "Do livro", status: "locked", icon: "📖", totalPages: 10 },
      { id: 3, title: "A denúncia", status: "locked", icon: "🔔", totalPages: 12 },
    ]
  },
  {
    id: "o-pequeno-principe",
    title: "O Pequeno Príncipe",
    author: "Antoine de Saint-Exupéry",
    cover: "⭐",
    coverImage: "https://m.media-amazon.com/images/I/71OZY035QKL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Fábula",
    themeColor: "40 65% 45%",
    chapters: [
      { id: 1, title: "O Desenho", status: "completed", icon: "🎨", currentPage: 6, totalPages: 6 },
      { id: 2, title: "O Encontro", status: "current", icon: "⭐", currentPage: 3, totalPages: 10 },
      { id: 3, title: "O Asteroide B-612", status: "locked", icon: "🪐", totalPages: 8 },
    ]
  },
  // --- Auto-generated trails for all other catalog books ---
  {
    id: "senhor-dos-aneis",
    title: "O Senhor dos Anéis",
    author: "J.R.R. Tolkien",
    cover: "💍",
    coverImage: "https://m.media-amazon.com/images/I/71jLBXtWJWL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 22,
    isPremium: false,
    genre: "Fantasia",
    themeColor: "25 50% 25%",
    chapters: generateChapters(1200, 22),
  },
  {
    id: "orgulho-preconceito",
    title: "Orgulho e Preconceito",
    author: "Jane Austen",
    cover: "💌",
    coverImage: "https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 15,
    isPremium: false,
    genre: "Romance",
    themeColor: "340 40% 40%",
    chapters: generateChapters(432, 15),
  },
  {
    id: "1984",
    title: "1984",
    author: "George Orwell",
    cover: "👁️",
    coverImage: "https://m.media-amazon.com/images/I/61ZewDE3beL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Ficção Científica",
    themeColor: "0 0% 25%",
    chapters: generateChapters(328, 12),
  },
  {
    id: "e-nao-sobrou-nenhum",
    title: "E Não Sobrou Nenhum",
    author: "Agatha Christie",
    cover: "🔪",
    coverImage: "/images/covers/e-nao-sobrou-nenhum.jpg",
    totalChapters: 14,
    isPremium: false,
    genre: "Mistério",
    themeColor: "0 45% 30%",
    chapters: generateChapters(272, 14),
  },
  {
    id: "culpa-das-estrelas",
    title: "A Culpa é das Estrelas",
    author: "John Green",
    cover: "🌟",
    coverImage: "/images/covers/a-culpa-e-das-estrelas.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Romance",
    themeColor: "200 50% 40%",
    chapters: generateChapters(288, 12),
  },
  {
    id: "jogos-vorazes",
    title: "Jogos Vorazes",
    author: "Suzanne Collins",
    cover: "🏹",
    coverImage: "https://m.media-amazon.com/images/I/71un2hI4mcL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 15,
    isPremium: false,
    genre: "Aventura",
    themeColor: "30 60% 35%",
    chapters: generateChapters(400, 15),
  },
  {
    id: "o-hobbit",
    title: "O Hobbit",
    author: "J.R.R. Tolkien",
    cover: "🐉",
    coverImage: "https://m.media-amazon.com/images/I/91b0C2YNSrL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Fantasia",
    themeColor: "120 30% 30%",
    chapters: generateChapters(320, 12),
  },
  {
    id: "sapiens",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    cover: "🧠",
    coverImage: "https://m.media-amazon.com/images/I/71N3-FFSDxL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 15,
    isPremium: false,
    genre: "Não-Ficção",
    themeColor: "180 30% 30%",
    chapters: generateChapters(464, 15),
  },
  {
    id: "cronicas-narnia",
    title: "As Crônicas de Nárnia",
    author: "C.S. Lewis",
    cover: "🦁",
    coverImage: "https://m.media-amazon.com/images/I/81QcFlMtWBL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 20,
    isPremium: false,
    genre: "Fantasia",
    themeColor: "30 45% 35%",
    chapters: generateChapters(768, 20),
  },
  {
    id: "nome-do-vento",
    title: "O Nome do Vento",
    author: "Patrick Rothfuss",
    cover: "🌬️",
    coverImage: "https://m.media-amazon.com/images/I/91b8oNwaV1L._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 18,
    isPremium: false,
    genre: "Fantasia",
    themeColor: "210 40% 35%",
    chapters: generateChapters(656, 18),
  },
  {
    id: "garota-no-trem",
    title: "A Garota no Trem",
    author: "Paula Hawkins",
    cover: "🚂",
    coverImage: "https://m.media-amazon.com/images/I/81Lp3-MXMcL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Mistério",
    themeColor: "220 35% 30%",
    chapters: generateChapters(336, 12),
  },
  {
    id: "gone-girl",
    title: "Gone Girl",
    author: "Gillian Flynn",
    cover: "🔍",
    coverImage: "https://m.media-amazon.com/images/I/81mMoGJDBFL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 14,
    isPremium: false,
    genre: "Mistério",
    themeColor: "350 30% 28%",
    chapters: generateChapters(432, 14),
  },
  {
    id: "codigo-da-vinci",
    title: "O Código Da Vinci",
    author: "Dan Brown",
    cover: "🗝️",
    coverImage: "https://m.media-amazon.com/images/I/815WORuYMML._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 16,
    isPremium: false,
    genre: "Mistério",
    themeColor: "45 40% 30%",
    chapters: generateChapters(480, 16),
  },
  {
    id: "sherlock-holmes",
    title: "Sherlock Holmes - Obra Completa",
    author: "Arthur Conan Doyle",
    cover: "🕵️",
    coverImage: "https://m.media-amazon.com/images/I/91aBOomjHjL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 25,
    isPremium: true,
    genre: "Mistério",
    themeColor: "200 25% 28%",
    chapters: generateChapters(1408, 25),
  },
  {
    id: "como-eu-era-antes",
    title: "Como Eu Era Antes de Você",
    author: "Jojo Moyes",
    cover: "💕",
    coverImage: "https://m.media-amazon.com/images/I/81NeVMPLLIL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Romance",
    themeColor: "330 45% 45%",
    chapters: generateChapters(384, 12),
  },
  {
    id: "poder-do-habito",
    title: "O Poder do Hábito",
    author: "Charles Duhigg",
    cover: "🔄",
    coverImage: "https://m.media-amazon.com/images/I/71WCGwxhp3L._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Não-Ficção",
    themeColor: "260 35% 35%",
    chapters: generateChapters(408, 12),
  },
  {
    id: "mindset",
    title: "Mindset",
    author: "Carol S. Dweck",
    cover: "🧩",
    coverImage: "https://m.media-amazon.com/images/I/71sL0hJOj3L._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 10,
    isPremium: false,
    genre: "Não-Ficção",
    themeColor: "170 35% 35%",
    chapters: generateChapters(320, 10),
  },
  {
    id: "maze-runner",
    title: "Maze Runner - Correr ou Morrer",
    author: "James Dashner",
    cover: "🌀",
    coverImage: "https://m.media-amazon.com/images/I/81ym3QUd3KL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 15,
    isPremium: false,
    genre: "Aventura",
    themeColor: "150 30% 28%",
    chapters: generateChapters(400, 15),
  },
  {
    id: "divergente",
    title: "Divergente",
    author: "Veronica Roth",
    cover: "🔥",
    coverImage: "https://m.media-amazon.com/images/I/81s8PEVbqjL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 15,
    isPremium: false,
    genre: "Aventura",
    themeColor: "15 55% 35%",
    chapters: generateChapters(496, 15),
  },
  {
    id: "aventuras-de-pi",
    title: "As Aventuras de Pi",
    author: "Yann Martel",
    cover: "🐯",
    coverImage: "https://m.media-amazon.com/images/I/71VBl0lz13L._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Aventura",
    themeColor: "200 45% 40%",
    chapters: generateChapters(320, 12),
  },
  {
    id: "ilha-do-tesouro",
    title: "A Ilha do Tesouro",
    author: "Robert Louis Stevenson",
    cover: "🏴‍☠️",
    coverImage: "https://m.media-amazon.com/images/I/91PoLpjPHvL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Aventura",
    themeColor: "25 45% 30%",
    chapters: generateChapters(304, 12),
  },
  {
    id: "20000-leguas",
    title: "20.000 Léguas Submarinas",
    author: "Júlio Verne",
    cover: "🌊",
    coverImage: "https://m.media-amazon.com/images/I/81CgD1YtGhL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 15,
    isPremium: false,
    genre: "Aventura",
    themeColor: "195 50% 30%",
    chapters: generateChapters(448, 15),
  },
  {
    id: "rapido-devagar",
    title: "Rápido e Devagar",
    author: "Daniel Kahneman",
    cover: "⚖️",
    coverImage: "https://m.media-amazon.com/images/I/71f6HcZ0jTL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 15,
    isPremium: false,
    genre: "Não-Ficção",
    themeColor: "220 30% 35%",
    chapters: generateChapters(608, 15),
  },
  {
    id: "breve-historia-tempo",
    title: "Uma Breve História do Tempo",
    author: "Stephen Hawking",
    cover: "🌌",
    coverImage: "https://m.media-amazon.com/images/I/81pX3R2R9cL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 10,
    isPremium: false,
    genre: "Não-Ficção",
    themeColor: "240 30% 25%",
    chapters: generateChapters(256, 10),
  },
  {
    id: "me-chame-pelo-seu-nome",
    title: "Me Chame Pelo Seu Nome",
    author: "André Aciman",
    cover: "🍑",
    coverImage: "https://m.media-amazon.com/images/I/71pq5FYaPvL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 10,
    isPremium: false,
    genre: "Romance",
    themeColor: "30 50% 45%",
    chapters: generateChapters(248, 10),
  },
  {
    id: "anna-karenina",
    title: "Anna Karenina",
    author: "Liev Tolstói",
    cover: "🚂",
    coverImage: "https://m.media-amazon.com/images/I/71FVhDEFU-L._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 20,
    isPremium: true,
    genre: "Romance",
    themeColor: "350 35% 30%",
    chapters: generateChapters(864, 20),
  },
  {
    id: "morro-ventos-uivantes",
    title: "O Morro dos Ventos Uivantes",
    author: "Emily Brontë",
    cover: "🌪️",
    coverImage: "https://m.media-amazon.com/images/I/81G0FvPt3SL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 14,
    isPremium: false,
    genre: "Romance",
    themeColor: "270 25% 30%",
    chapters: generateChapters(400, 14),
  },
  {
    id: "silencio-inocentes",
    title: "O Silêncio dos Inocentes",
    author: "Thomas Harris",
    cover: "🦋",
    coverImage: "https://m.media-amazon.com/images/I/81hn+-RKtaL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Mistério",
    themeColor: "0 30% 25%",
    chapters: generateChapters(352, 12),
  },
  {
    id: "gene-egoista",
    title: "O Gene Egoísta",
    author: "Richard Dawkins",
    cover: "🧬",
    coverImage: "https://m.media-amazon.com/images/I/71mhPCxz6vL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Não-Ficção",
    themeColor: "140 35% 30%",
    chapters: generateChapters(544, 12),
  },
];
const Trilhas = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { activeTrail, setActiveTrail } = useActiveTrail();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [completedChapterForModal, setCompletedChapterForModal] = useState<Chapter | null>(null);
  const isPremium = false;

  const handleSelectTrail = (book: BookTrail) => {
    setActiveTrail({
      bookId: book.id,
      title: book.title,
      author: book.author,
      cover: book.cover,
      genre: book.genre,
      themeColor: book.themeColor,
      totalChapters: book.totalChapters,
      chapters: book.chapters,
    });
    toast.success(`"${book.title}" definida como sua trilha atual!`);
    navigate("/home");
  };

  // Hook must be called unconditionally at the top level
  const { isChapterCompleted, getReadingTime, refetch } = useChapterProgress(bookId || "");
  const { getPageBookmark, setPageBookmark } = usePageBookmark(bookId || "");

  // Book detail view
  if (bookId) {
    const book = bookTrails.find(b => b.id === bookId);
    
    if (!book) {
      return (
        <Layout>
          <div className="py-8 text-center">
            <h1 className="text-2xl font-serif font-semibold mb-4">Livro não encontrado</h1>
            <Link to="/trilhas">
              <Button variant="outline">Voltar às trilhas</Button>
            </Link>
          </div>
        </Layout>
      );
    }

    const themeColor = book.themeColor;
    const completedChapters = book.chapters.filter(c => c.status === "completed").length;
    const progress = (completedChapters / book.totalChapters) * 100;
    const currentChapter = book.chapters.find(c => c.status === "current");

    const formatReadingTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      if (minutes > 0) {
        return `${minutes}min`;
      }
      return `${seconds}s`;
    };

    const handleChapterClick = (chapter: Chapter, chapterIndex: number) => {
      // Dynamic unlock check - same logic as rendering
      const previousChapter = chapterIndex > 0 ? book.chapters[chapterIndex - 1] : null;
      const isPreviousCompleted = previousChapter 
        ? (previousChapter.status === "completed" || isChapterCompleted(previousChapter.id))
        : true;
      const isUnlocked = chapterIndex === 0 || isPreviousCompleted;
      
      if (!isUnlocked) return; // Use dynamic check instead of static status
      
      // Check if chapter is completed from database
      const isCompletedFromDB = isChapterCompleted(chapter.id);
      
      if (isCompletedFromDB || chapter.status === "completed") {
        // Open the completed chapter modal
        setCompletedChapterForModal(chapter);
        setShowCompletedModal(true);
      } else {
        // Navigate to chapter reading page
        navigate(`/ler/${bookId}/${chapter.id}`);
      }
    };

    const handleRereadChapter = () => {
      if (completedChapterForModal && bookId) {
        navigate(`/ler/${bookId}/${completedChapterForModal.id}`);
      }
    };

    const handleAnswerSubmit = () => {
      if (selectedAnswer !== null) {
        setShowResult(true);
      }
    };

    return (
      <Layout isPremium={isPremium}>
        <div className="max-w-4xl mx-auto py-8 section-bg-challenges">
          {/* Back Button */}
          <Link to="/trilhas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Voltar às trilhas
          </Link>

          {/* Book Header - Burgundy banner like in reference */}
          <header 
            className="rounded-xl p-6 mb-8 animate-fade-in"
            style={{
              background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 8 + '%')}))`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                  <BookOpen className="w-4 h-4" />
                  Livro atual
                </div>
                <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-white mb-1">
                  {book.title}
                </h1>
                <p className="text-white/70">
                  Capítulo {currentChapter?.id || 1} de {book.totalChapters}
                </p>
              </div>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Ver Trilha
              </Button>
            </div>
          </header>

          {/* Continue Reading CTA */}
          {currentChapter && (
            <div className="flex justify-center mb-8">
              <Button 
                size="lg"
                onClick={() => handleChapterClick(currentChapter, book.chapters.findIndex(c => c.id === currentChapter.id))}
                className="gap-2 px-8"
                style={{ 
                  background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                }}
              >
                <Play className="w-5 h-5" />
                Continuar Leitura
              </Button>
            </div>
          )}

          {/* Chapters as Open/Closed Books */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {book.chapters.map((chapter, index) => {
              // Dynamic unlock logic: chapter is unlocked if:
              // 1. It's the first chapter (always unlocked)
              // 2. The previous chapter is completed (from DB or static status)
              const previousChapter = index > 0 ? book.chapters[index - 1] : null;
              const isPreviousCompleted = previousChapter 
                ? (previousChapter.status === "completed" || isChapterCompleted(previousChapter.id))
                : true;
              
              const isCompletedFromDB = isChapterCompleted(chapter.id);
              const isCompleted = chapter.status === "completed" || isCompletedFromDB;
              
              // A chapter is unlocked if it's the first one, or previous is completed
              const isUnlocked = index === 0 || isPreviousCompleted;
              const isLocked = !isUnlocked;
              
              // Current chapter is the first unlocked but not completed
              const isCurrent = isUnlocked && !isCompleted;
              
              const isOpenBook = isUnlocked;
              const readingTime = getReadingTime(chapter.id);

              return (
                <TooltipProvider key={chapter.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleChapterClick(chapter, index)}
                        disabled={isLocked}
                        className={`
                          relative w-full rounded-lg overflow-hidden transition-all duration-300 text-left
                          ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}
                        `}
                        style={{
                          background: isOpenBook 
                            ? `linear-gradient(145deg, hsl(43 30% 94%), hsl(35 25% 88%))`
                            : `linear-gradient(145deg, hsl(${themeColor} / 0.12), hsl(${themeColor} / 0.06))`,
                          border: isCurrent 
                            ? `2px solid hsl(${themeColor})` 
                            : `1px solid hsl(${themeColor} / ${isOpenBook ? '0.35' : '0.2'})`,
                          minHeight: '100px',
                          boxShadow: isCurrent 
                            ? `0 8px 32px hsl(${themeColor} / 0.25)`
                            : isOpenBook
                            ? `0 4px 16px hsl(${themeColor} / 0.1)`
                            : 'none',
                        }}
                      >
                        {/* Paper texture for open books */}
                        {isOpenBook && (
                          <div 
                            className="absolute inset-0 opacity-20"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                            }}
                          />
                        )}

                        {/* Left book spine effect for open books */}
                        {isOpenBook && (
                          <div 
                            className="absolute left-0 top-0 bottom-0 w-3"
                            style={{
                              background: `linear-gradient(90deg, hsl(${themeColor} / 0.25), transparent)`,
                            }}
                          />
                        )}

                        <div className="relative p-4 flex items-center gap-4">
                          {/* Book cover / illustration area */}
                          <div 
                            className="w-20 h-24 rounded flex-shrink-0 flex items-center justify-center overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, hsl(${themeColor} / ${isOpenBook ? '0.2' : '0.15'}), hsl(${themeColor} / 0.08))`,
                              border: `1px solid hsl(${themeColor} / 0.25)`,
                            }}
                          >
                            <span className={`text-3xl ${isLocked ? 'opacity-50' : ''}`}>{chapter.icon}</span>
                          </div>

                          {/* Chapter info */}
                          <div className="flex-1">
                            <p 
                              className="text-xs font-medium mb-1"
                              style={{ color: `hsl(${themeColor})`, opacity: isLocked ? 0.6 : 1 }}
                            >
                              Capítulo {chapter.id}
                            </p>
                            <p className={`font-serif text-sm font-semibold line-clamp-2 mb-1 ${isLocked ? 'text-foreground/60' : 'text-foreground'}`}>
                              {chapter.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Capítulo {chapter.id} de {book.totalChapters}
                            </p>
                            {/* Show reading time for completed chapters */}
                            {isCompleted && readingTime > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-green-600 font-medium">
                                  Lido em {formatReadingTime(readingTime)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Right side: Lock or Bookmark */}
                          {isLocked ? (
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                background: `hsl(${themeColor} / 0.1)`,
                                border: `1px solid hsl(${themeColor} / 0.2)`,
                              }}
                            >
                              <Lock className="w-4 h-4 text-muted-foreground/50" />
                            </div>
                          ) : (
                            <BookmarkMarker
                              themeColor={themeColor}
                              currentPage={getPageBookmark(chapter.id) ?? chapter.currentPage}
                              totalPages={chapter.totalPages}
                              isCompleted={isCompleted}
                              onPageUpdate={(page) => setPageBookmark(chapter.id, page)}
                            />
                          )}
                        </div>

                        {/* Current chapter indicator bar */}
                        {isCurrent && (
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-1"
                            style={{
                              background: `linear-gradient(90deg, hsl(${themeColor}), hsl(${themeColor} / 0.6))`,
                            }}
                          />
                        )}
                      </button>
                    </TooltipTrigger>
                    {/* Tooltip handled by BookmarkMarker */}
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          {/* Next chapters hint */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4 rotate-180" />
              Próximo
            </p>
          </div>

          {/* Question Modal */}
          <Dialog open={showQuestion} onOpenChange={setShowQuestion}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-serif">
                  <HelpCircle className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                  Pergunta do Capítulo {selectedChapter?.id}
                </DialogTitle>
              </DialogHeader>

              {selectedChapter?.question && (
                <div className="space-y-6 py-4">
                  <p className="text-lg">{selectedChapter.question.text}</p>
                  
                  <div className="space-y-2">
                    {selectedChapter.question.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => !showResult && setSelectedAnswer(index)}
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded border transition-all ${
                          showResult
                            ? index === selectedChapter.question!.correctAnswer
                              ? "bg-emerald/10 border-emerald"
                              : selectedAnswer === index
                              ? "bg-destructive/10 border-destructive"
                              : "bg-muted/30 border-border"
                            : selectedAnswer === index
                            ? "border-secondary bg-secondary/10"
                            : "bg-muted/30 border-border hover:border-secondary/50"
                        }`}
                        style={selectedAnswer === index && !showResult ? {
                          borderColor: `hsl(${themeColor})`,
                          backgroundColor: `hsl(${themeColor} / 0.1)`,
                        } : {}}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {showResult && (
                    <div className={`p-4 rounded ${
                      selectedAnswer === selectedChapter.question.correctAnswer
                        ? "bg-emerald/10 border border-emerald/30"
                        : "bg-destructive/10 border border-destructive/30"
                    }`}>
                      <p className="font-semibold mb-2">
                        {selectedAnswer === selectedChapter.question.correctAnswer
                          ? "✓ Correto! +10 pts"
                          : "✗ Incorreto"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedChapter.question.explanation}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {!showResult ? (
                      <Button 
                        className="w-full"
                        onClick={handleAnswerSubmit}
                        disabled={selectedAnswer === null}
                        style={{ 
                          background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                        }}
                      >
                        Confirmar Resposta
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => setShowQuestion(false)}
                        style={{ 
                          background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                        }}
                      >
                        Continuar
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Completed Chapter Modal */}
          {completedChapterForModal && (
            <CompletedChapterModal
              isOpen={showCompletedModal}
              onClose={() => {
                setShowCompletedModal(false);
                setCompletedChapterForModal(null);
                refetch(); // Refresh progress data
              }}
              chapter={completedChapterForModal}
              bookId={bookId}
              themeColor={themeColor}
              onReread={handleRereadChapter}
            />
          )}
        </div>
      </Layout>
    );
  }

  // Books listing view
  return (
    <Layout isPremium={isPremium}>
      <div className="max-w-5xl mx-auto py-8 section-bg-challenges">
        {/* Header */}
        <header className="mb-10 animate-fade-in" data-tutorial="trilhas-header">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Biblioteca de Jornadas</p>
          <h1 className="text-3xl lg:text-4xl font-serif font-semibold mb-2">Trilhas Literárias</h1>
          <p className="text-muted-foreground max-w-xl">
            Cada trilha representa uma jornada através de um livro. Explore capítulo por capítulo, responda perguntas e evolua como leitor.
          </p>
        </header>

        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-tutorial="trilhas-grid">
          {bookTrails.map((book, index) => {
            const completedChapters = book.chapters.filter(c => c.status === "completed").length;
            const progress = (completedChapters / book.totalChapters) * 100;
            const currentChapter = book.chapters.find(c => c.status === "current");
            const themeColor = book.themeColor;
            const isCurrentTrail = activeTrail?.bookId === book.id;

            return (
              <Link
                key={book.id}
                to={book.isPremium && !isPremium ? "#" : `/trilhas/${book.id}`}
                className={`editorial-card overflow-hidden card-hover animate-fade-in ${
                  book.isPremium && !isPremium ? "opacity-80 cursor-not-allowed" : ""
                }`}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  borderColor: progress > 0 ? `hsl(${themeColor} / 0.3)` : undefined,
                }}
                onClick={e => book.isPremium && !isPremium && e.preventDefault()}
              >
                {/* Cover */}
                <div 
                  className="h-36 flex items-center justify-center relative"
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${themeColor} / 0.15), hsl(${themeColor} / 0.05))`,
                  }}
                >
                  <span className="text-5xl">{book.cover}</span>
                  
                  {book.isPremium && !isPremium && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded bg-card/90 text-xs font-medium">
                      <Crown className="w-3 h-3 text-accent" />
                      Premium
                    </div>
                  )}
                  
                  {progress > 0 && (
                    <div 
                      className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: `hsl(${themeColor} / 0.9)`,
                        color: 'white',
                      }}
                    >
                      <CheckCircle className="w-3 h-3" />
                      {completedChapters}/{book.totalChapters}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <p 
                    className="text-xs uppercase tracking-wider font-medium mb-1"
                    style={{ color: `hsl(${themeColor})` }}
                  >
                    {book.genre}
                  </p>
                  <h3 className="font-serif text-lg font-semibold mb-1">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{book.author}</p>
                  
                  {currentChapter && (
                    <p 
                      className="text-xs mb-3 flex items-center gap-1"
                      style={{ color: `hsl(${themeColor})` }}
                    >
                      <Bookmark className="w-3 h-3" />
                      {currentChapter.title}
                    </p>
                  )}
                  
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-bar h-1.5">
                      <div 
                        className="progress-bar-fill"
                        style={{ 
                          width: `${progress}%`,
                          background: `hsl(${themeColor})`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Start Trail Button */}
                  {!book.isPremium || isPremium ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectTrail(book);
                      }}
                      className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isCurrentTrail
                          ? "bg-accent/10 text-accent cursor-default"
                          : "text-white hover:opacity-90"
                      }`}
                      style={!isCurrentTrail ? {
                        background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                      } : {}}
                      disabled={isCurrentTrail}
                    >
                      {isCurrentTrail ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Trilha Atual
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Começar Trilha
                        </>
                      )}
                    </button>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Trilhas;
