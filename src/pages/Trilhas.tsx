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
  totalChapters: number;
  chapters: Chapter[];
  isPremium: boolean;
  genre: string;
  themeColor: string;
  coverImage?: string;
}

const bookTrails: BookTrail[] = [
  {
    id: "harry-potter-1",
    title: "Harry Potter e a Pedra Filosofal",
    author: "J.K. Rowling",
    cover: "🏰",
    totalChapters: 17,
    isPremium: false,
    genre: "Fantasia",
    themeColor: "350 45% 32%", // Deep wine/burgundy
    chapters: [
      {
        id: 1,
        title: "O Menino que Sobreviveu",
        status: "current",
        icon: "🏠",
        currentPage: 12,
        totalPages: 24,
        question: {
          text: "Por que os Dursley tinham tanto medo de que os vizinhos descobrissem sobre os Potter?",
          options: [
            "Porque os Potter eram criminosos procurados",
            "Porque não queriam ser associados a algo 'anormal'",
            "Porque deviam dinheiro aos Potter",
            "Porque os Potter eram celebridades famosas"
          ],
          correctAnswer: 1,
          explanation: "Os Dursley valorizavam acima de tudo a 'normalidade' e temiam qualquer associação com o mundo mágico."
        }
      },
      {
        id: 2,
        title: "O Vidro que Sumiu",
        status: "locked",
        icon: "🐍",
        totalPages: 18,
      },
      {
        id: 3,
        title: "As Cartas de Ninguém",
        status: "locked",
        icon: "✉️",
        totalPages: 22,
      },
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
    totalChapters: 22,
    isPremium: false,
    genre: "Mitologia",
    themeColor: "210 55% 30%", // Deep ocean blue
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
    totalChapters: 15,
    isPremium: false,
    genre: "Romance Brasileiro",
    themeColor: "35 40% 28%", // Sepia brown
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
    totalChapters: 12,
    isPremium: false,
    genre: "Fábula",
    themeColor: "40 65% 45%", // Golden amber
    chapters: [
      { id: 1, title: "O Desenho", status: "completed", icon: "🎨", currentPage: 6, totalPages: 6 },
      { id: 2, title: "O Encontro", status: "current", icon: "⭐", currentPage: 3, totalPages: 10 },
      { id: 3, title: "O Asteroide B-612", status: "locked", icon: "🪐", totalPages: 8 },
    ]
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
    navigate("/");
  };

  // Hook must be called unconditionally at the top level
  const { isChapterCompleted, getReadingTime, refetch } = useChapterProgress(bookId || "");

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
                            <div className="flex-shrink-0 relative group">
                              {/* Bookmark marker */}
                              <div 
                                className="w-6 h-16 flex items-start justify-center relative transition-transform group-hover:scale-110"
                                style={{
                                  clipPath: 'polygon(0 0, 100% 0, 100% 90%, 50% 100%, 0 90%)',
                                  background: isCompleted 
                                    ? `linear-gradient(180deg, hsl(var(--accent)), hsl(var(--accent) / 0.85))`
                                    : `linear-gradient(180deg, hsl(${themeColor}), hsl(${themeColor} / 0.85))`,
                                  boxShadow: `2px 4px 8px hsl(${themeColor} / 0.3)`,
                                }}
                              >
                                {isCompleted && (
                                  <CheckCircle className="w-3 h-3 text-white mt-2" />
                                )}
                              </div>
                            </div>
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
                    {!isLocked && (
                      <TooltipContent side="right" className="p-3">
                        {chapter.currentPage ? (
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">Sua página atual</p>
                            <p className="font-bold text-lg">{chapter.currentPage}/{chapter.totalPages}</p>
                            <button className="text-xs text-primary hover:underline mt-1">
                              Atualizar página
                            </button>
                          </div>
                        ) : (
                          <button className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                            <Plus className="w-4 h-4" />
                            Marcar página atual
                          </button>
                        )}
                      </TooltipContent>
                    )}
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
