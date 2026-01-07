import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, Lock, CheckCircle, Crown, Play, ArrowLeft, HelpCircle, Bookmark, Castle, Anchor, Feather, Compass, Skull } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Chapter {
  id: number;
  title: string;
  status: "completed" | "current" | "locked";
  icon: string;
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
  themeColor: string; // HSL color for dynamic theming
}

const bookTrails: BookTrail[] = [
  {
    id: "harry-potter-1",
    title: "Harry Potter e a Pedra Filosofal",
    author: "J.K. Rowling",
    cover: "📘",
    totalChapters: 17,
    isPremium: false,
    genre: "Fantasia",
    themeColor: "350 45% 38%", // Ruby wine
    chapters: [
      {
        id: 1,
        title: "O Menino que Sobreviveu",
        status: "completed",
        icon: "🏠",
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
        status: "completed",
        icon: "🐍",
        question: {
          text: "O que a cena do zoológico revela sobre a relação entre Harry e sua magia?",
          options: [
            "Harry controla perfeitamente seus poderes",
            "A magia de Harry se manifesta em momentos de emoção intensa",
            "Harry precisa de uma varinha para fazer mágica",
            "Harry aprendeu a fazer mágica sozinho"
          ],
          correctAnswer: 1,
          explanation: "A magia acidental de Harry se manifesta quando ele está emocionalmente afetado."
        }
      },
      {
        id: 3,
        title: "As Cartas de Ninguém",
        status: "current",
        icon: "✉️",
        question: {
          text: "Qual o significado simbólico da persistência das cartas chegando cada vez em maior quantidade?",
          options: [
            "Hogwarts estava desperdiçando recursos",
            "Era um erro do sistema de correio mágico",
            "Representava que o destino de Harry era inevitável",
            "Os bruxos estavam tentando irritar os Dursley"
          ],
          correctAnswer: 2,
          explanation: "As cartas simbolizam que não se pode fugir do próprio destino."
        }
      },
      { id: 4, title: "O Guardião das Chaves", status: "locked", icon: "🗝️" },
      { id: 5, title: "O Beco Diagonal", status: "locked", icon: "🏪" },
      { id: 6, title: "A Viagem da Plataforma", status: "locked", icon: "🚂" },
      { id: 7, title: "O Chapéu Seletor", status: "locked", icon: "🎩" },
      { id: 8, title: "O Mestre das Poções", status: "locked", icon: "⚗️" },
      { id: 9, title: "O Duelo à Meia-Noite", status: "locked", icon: "⚔️" },
      { id: 10, title: "O Espelho de Ojesed", status: "locked", icon: "🪞" },
    ]
  },
  {
    id: "percy-jackson-1",
    title: "Percy Jackson e o Ladrão de Raios",
    author: "Rick Riordan",
    cover: "📗",
    totalChapters: 22,
    isPremium: false,
    genre: "Mitologia",
    themeColor: "210 55% 35%", // Navy ocean
    chapters: [
      { id: 1, title: "Eu Vaporizo Minha Professora", status: "completed", icon: "⚡" },
      { id: 2, title: "Três Velhas Tricotando", status: "current", icon: "🧶" },
      { id: 3, title: "Grover Perde as Calças", status: "locked", icon: "🐐" },
    ]
  },
  {
    id: "dom-casmurro",
    title: "Dom Casmurro",
    author: "Machado de Assis",
    cover: "📕",
    totalChapters: 15,
    isPremium: true,
    genre: "Romance Brasileiro",
    themeColor: "350 45% 32%", // Deep wine
    chapters: [
      { id: 1, title: "Do título", status: "locked", icon: "📜" },
      { id: 2, title: "Do livro", status: "locked", icon: "📖" },
      { id: 3, title: "A denúncia", status: "locked", icon: "🔔" },
    ]
  },
  {
    id: "o-pequeno-principe",
    title: "O Pequeno Príncipe",
    author: "Antoine de Saint-Exupéry",
    cover: "📙",
    totalChapters: 12,
    isPremium: false,
    genre: "Fábula",
    themeColor: "40 60% 45%", // Warm amber
    chapters: [
      { id: 1, title: "O Desenho", status: "completed", icon: "🎨" },
      { id: 2, title: "O Encontro", status: "current", icon: "⭐" },
      { id: 3, title: "O Asteroide B-612", status: "locked", icon: "🪐" },
    ]
  },
];

const Trilhas = () => {
  const { bookId } = useParams();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const isPremium = false;

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

    const handleChapterClick = (chapter: Chapter) => {
      if (chapter.status === "locked") return;
      setSelectedChapter(chapter);
      setShowQuestion(true);
      setSelectedAnswer(null);
      setShowResult(false);
    };

    const handleAnswerSubmit = () => {
      if (selectedAnswer !== null) {
        setShowResult(true);
      }
    };

    return (
      <Layout isPremium={isPremium}>
        <div className="max-w-4xl mx-auto py-8">
          {/* Back Button */}
          <Link to="/trilhas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Voltar às trilhas
          </Link>

          {/* Book Header */}
          <header className="mb-10 animate-fade-in">
            <div className="flex items-start gap-6">
              <div 
                className="w-24 h-32 rounded flex items-center justify-center flex-shrink-0"
                style={{ 
                  background: `linear-gradient(135deg, hsl(${themeColor} / 0.2), hsl(${themeColor} / 0.1))`,
                  border: `2px solid hsl(${themeColor} / 0.3)`,
                }}
              >
                <span className="text-5xl">{book.cover}</span>
              </div>
              <div className="flex-1">
                <p 
                  className="text-xs uppercase tracking-wider font-medium mb-1"
                  style={{ color: `hsl(${themeColor})` }}
                >
                  {book.genre}
                </p>
                <h1 className="text-2xl lg:text-3xl font-serif font-semibold mb-1">{book.title}</h1>
                <p className="text-muted-foreground mb-4">{book.author}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">{completedChapters} de {book.totalChapters} capítulos</span>
                  <span className="font-semibold" style={{ color: `hsl(${themeColor})` }}>
                    {Math.round(progress)}% concluído
                  </span>
                </div>
                
                <div className="progress-bar mt-3 max-w-sm">
                  <div 
                    className="progress-bar-fill"
                    style={{ 
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 12 + '%')}))`,
                    }}
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Current Chapter CTA */}
          {currentChapter && (
            <div 
              className="journey-card current p-5 mb-8 animate-fade-in active-glow" 
              style={{ 
                animationDelay: "0.1s",
                borderColor: `hsl(${themeColor} / 0.5)`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentChapter.icon}</span>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Continue de onde parou</p>
                    <p className="font-semibold">Capítulo {currentChapter.id}: {currentChapter.title}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleChapterClick(currentChapter)}
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Chapters as Mini-Books Grid */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="font-serif text-xl font-semibold mb-6">Coleção de Capítulos</h2>
            
            {/* Mini-books grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {book.chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => handleChapterClick(chapter)}
                  disabled={chapter.status === "locked"}
                  className={`mini-book ${chapter.status} aspect-[3/4]`}
                  style={chapter.status === "current" ? { 
                    borderColor: `hsl(${themeColor} / 0.6)`,
                    boxShadow: `0 0 20px hsl(${themeColor} / 0.25)`,
                  } : chapter.status === "completed" ? {
                    borderColor: `hsl(var(--accent) / 0.5)`,
                  } : {}}
                >
                  {/* Book spine */}
                  <div 
                    className="absolute left-1 top-3 bottom-3 w-1 rounded"
                    style={{ 
                      background: chapter.status === "current" 
                        ? `hsl(${themeColor})` 
                        : chapter.status === "completed" 
                        ? `hsl(var(--accent))` 
                        : `hsl(var(--muted-foreground) / 0.2)`,
                      boxShadow: chapter.status === "current" ? `0 0 8px hsl(${themeColor} / 0.6)` : 'none',
                    }}
                  />
                  
                  {/* Icon */}
                  <div className="text-2xl mb-2 ml-2">
                    {chapter.status === "locked" ? (
                      <Lock className="w-5 h-5 text-muted-foreground/50" />
                    ) : chapter.status === "completed" ? (
                      <span className="relative">
                        {chapter.icon}
                        <CheckCircle className="w-4 h-4 text-accent absolute -bottom-1 -right-1" />
                      </span>
                    ) : (
                      <span>{chapter.icon}</span>
                    )}
                  </div>
                  
                  {/* Chapter number */}
                  <span className="text-xs font-bold text-muted-foreground ml-2">
                    {chapter.id}
                  </span>
                  
                  {/* Title */}
                  <span className="text-[10px] text-muted-foreground/70 line-clamp-2 text-center mt-1 ml-2 px-1">
                    {chapter.title}
                  </span>
                  
                  {/* Current badge */}
                  {chapter.status === "current" && (
                    <span 
                      className="absolute -top-2 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `hsl(${themeColor})`,
                        color: 'white',
                      }}
                    >
                      ▶
                    </span>
                  )}
                </button>
              ))}
            </div>
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
        </div>
      </Layout>
    );
  }

  // Books listing view
  return (
    <Layout isPremium={isPremium}>
      <div className="max-w-5xl mx-auto py-8">
        {/* Header */}
        <header className="mb-10 animate-fade-in">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Biblioteca de Jornadas</p>
          <h1 className="text-3xl lg:text-4xl font-serif font-semibold mb-2">Trilhas Literárias</h1>
          <p className="text-muted-foreground max-w-xl">
            Cada trilha representa uma jornada através de um livro. Explore capítulo por capítulo, responda perguntas e evolua como leitor.
          </p>
        </header>

        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookTrails.map((book, index) => {
            const completedChapters = book.chapters.filter(c => c.status === "completed").length;
            const progress = (completedChapters / book.totalChapters) * 100;
            const currentChapter = book.chapters.find(c => c.status === "current");
            const themeColor = book.themeColor;

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
