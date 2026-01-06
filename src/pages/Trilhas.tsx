import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, Lock, CheckCircle, Crown, Play, ArrowLeft, HelpCircle, Bookmark, Clock } from "lucide-react";
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
    chapters: [
      {
        id: 1,
        title: "O Menino que Sobreviveu",
        status: "completed",
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
        question: {
          text: "O que a cena do zoológico revela sobre a relação entre Harry e sua magia?",
          options: [
            "Harry controla perfeitamente seus poderes",
            "A magia de Harry se manifesta em momentos de emoção intensa",
            "Harry precisa de uma varinha para fazer mágica",
            "Harry aprendeu a fazer mágica sozinho"
          ],
          correctAnswer: 1,
          explanation: "A magia acidental de Harry se manifesta quando ele está emocionalmente afetado, como ao sentir empatia pela cobra."
        }
      },
      {
        id: 3,
        title: "As Cartas de Ninguém",
        status: "current",
        question: {
          text: "Qual o significado simbólico da persistência das cartas de Hogwarts chegando cada vez em maior quantidade?",
          options: [
            "Hogwarts estava desperdiçando recursos",
            "Era um erro do sistema de correio mágico",
            "Representava que o destino de Harry era inevitável",
            "Os bruxos estavam tentando irritar os Dursley"
          ],
          correctAnswer: 2,
          explanation: "As cartas simbolizam que não se pode fugir do próprio destino - quanto mais os Dursley resistiam, mais forte era a chamada."
        }
      },
      { id: 4, title: "O Guardião das Chaves", status: "locked" },
      { id: 5, title: "O Beco Diagonal", status: "locked" },
      { id: 6, title: "A Viagem da Plataforma Nove e Meia", status: "locked" },
      { id: 7, title: "O Chapéu Seletor", status: "locked" },
      { id: 8, title: "O Mestre das Poções", status: "locked" },
      { id: 9, title: "O Duelo à Meia-Noite", status: "locked" },
      { id: 10, title: "O Espelho de Ojesed", status: "locked" },
      { id: 11, title: "Norberto, o Dragão Norueguês", status: "locked" },
      { id: 12, title: "A Floresta Proibida", status: "locked" },
      { id: 13, title: "O Alçapão", status: "locked" },
      { id: 14, title: "Através do Alçapão", status: "locked" },
      { id: 15, title: "O Homem de Duas Faces", status: "locked" },
      { id: 16, title: "Reflexão Final", status: "locked" },
      { id: 17, title: "Quiz Final do Livro", status: "locked" },
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
    chapters: [
      { id: 1, title: "Do título", status: "locked" },
      { id: 2, title: "Do livro", status: "locked" },
      { id: 3, title: "A denúncia", status: "locked" },
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
    chapters: [
      { id: 1, title: "O Desenho", status: "completed" },
      { id: 2, title: "O Encontro", status: "current" },
      { id: 3, title: "O Asteroide B-612", status: "locked" },
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

  // If bookId is provided, show the book trail
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
        <div className="max-w-3xl mx-auto py-8">
          {/* Back Button */}
          <Link to="/trilhas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Voltar às trilhas
          </Link>

          {/* Book Header */}
          <header className="mb-10 animate-fade-in">
            <div className="flex items-start gap-6">
              <div className="w-20 h-28 bg-gradient-to-br from-secondary/20 to-accent/10 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-4xl">{book.cover}</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-secondary uppercase tracking-wider font-medium mb-1">{book.genre}</p>
                <h1 className="text-2xl lg:text-3xl font-serif font-semibold mb-1">{book.title}</h1>
                <p className="text-muted-foreground mb-4">{book.author}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">{completedChapters} de {book.totalChapters} capítulos</span>
                  <span className="text-accent font-semibold">{Math.round(progress)}% concluído</span>
                </div>
                
                <div className="progress-bar mt-3 max-w-sm">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Current Chapter CTA */}
          {currentChapter && (
            <div className="journey-card current p-5 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Continue de onde parou</p>
                  <p className="font-semibold">Capítulo {currentChapter.id}: {currentChapter.title}</p>
                </div>
                <Button variant="hero" size="sm" onClick={() => handleChapterClick(currentChapter)}>
                  <Play className="w-4 h-4 mr-2" />
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Chapters Timeline */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 className="font-serif text-xl font-semibold mb-6">Linha do Tempo de Leitura</h2>
            
            <div className="space-y-2">
              {book.chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => handleChapterClick(chapter)}
                  disabled={chapter.status === "locked"}
                  className={`chapter-node w-full text-left ${chapter.status}`}
                >
                  <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
                    chapter.status === "completed" 
                      ? "bg-accent/20 text-accent" 
                      : chapter.status === "current"
                      ? "bg-secondary/20 text-secondary"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {chapter.status === "completed" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : chapter.status === "current" ? (
                      <Bookmark className="w-5 h-5" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Capítulo {chapter.id}</p>
                      {chapter.status === "current" && (
                        <span className="text-xs text-secondary font-medium px-2 py-0.5 rounded bg-secondary/10">
                          Atual
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chapter.title}</p>
                  </div>

                  {chapter.question && chapter.status !== "locked" && (
                    <HelpCircle className="w-4 h-4 text-secondary flex-shrink-0" />
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
                  <HelpCircle className="w-5 h-5 text-secondary" />
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
                            ? "bg-secondary/10 border-secondary"
                            : "bg-muted/30 border-border hover:border-secondary/50"
                        }`}
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
                          ? "✓ Correto!"
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
                        variant="hero" 
                        className="w-full"
                        onClick={handleAnswerSubmit}
                        disabled={selectedAnswer === null}
                      >
                        Confirmar Resposta
                      </Button>
                    ) : (
                      <Button 
                        variant="hero" 
                        className="w-full"
                        onClick={() => setShowQuestion(false)}
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

  // Default view - list all book trails
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

            return (
              <Link
                key={book.id}
                to={book.isPremium && !isPremium ? "#" : `/trilhas/${book.id}`}
                className={`editorial-card overflow-hidden card-hover animate-fade-in ${
                  book.isPremium && !isPremium ? "opacity-80 cursor-not-allowed" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={e => book.isPremium && !isPremium && e.preventDefault()}
              >
                {/* Cover */}
                <div className="h-36 bg-gradient-to-br from-secondary/10 to-accent/5 flex items-center justify-center relative">
                  <span className="text-5xl">{book.cover}</span>
                  
                  {book.isPremium && !isPremium && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded bg-card/90 text-xs font-medium">
                      <Crown className="w-3 h-3 text-accent" />
                      Premium
                    </div>
                  )}
                  
                  {progress > 0 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded bg-card/90 text-xs font-medium">
                      <CheckCircle className="w-3 h-3 text-accent" />
                      {completedChapters}/{book.totalChapters}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="text-xs text-secondary uppercase tracking-wider font-medium mb-1">{book.genre}</p>
                  <h3 className="font-serif text-lg font-semibold mb-1">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{book.author}</p>
                  
                  {currentChapter && (
                    <p className="text-xs text-secondary mb-3 flex items-center gap-1">
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
                    <div className="progress-bar h-1">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${progress}%` }}
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