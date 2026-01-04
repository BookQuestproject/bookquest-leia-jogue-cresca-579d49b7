import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, Lock, CheckCircle, Crown, Play, ArrowLeft, HelpCircle } from "lucide-react";
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
}

const bookTrails: BookTrail[] = [
  {
    id: "harry-potter-1",
    title: "Harry Potter e a Pedra Filosofal",
    author: "J.K. Rowling",
    cover: "📘",
    totalChapters: 17,
    isPremium: false,
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
            "Porque os Potter eram celebridades famosas",
            "Porque tinham vergonha de serem parentes de bruxos"
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
            "Harry aprendeu a fazer mágica sozinho",
            "Harry não tem poderes mágicos reais"
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
            "Os bruxos estavam tentando irritar os Dursley",
            "Era uma forma de punir Harry"
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
            <h1 className="text-2xl font-bold mb-4">Livro não encontrado</h1>
            <Link to="/trilhas">
              <Button variant="outline">Voltar às trilhas</Button>
            </Link>
          </div>
        </Layout>
      );
    }

    const completedChapters = book.chapters.filter(c => c.status === "completed").length;
    const progress = (completedChapters / book.totalChapters) * 100;

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
        <div className="py-8">
          {/* Back Button */}
          <Link to="/trilhas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />
            Voltar às trilhas
          </Link>

          {/* Book Header */}
          <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-24 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                <span className="text-5xl">{book.cover}</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold mb-1">{book.title}</h1>
                <p className="text-muted-foreground mb-4">{book.author}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-bold">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {completedChapters} de {book.totalChapters} capítulos concluídos
                </p>
              </div>
            </div>
          </div>

          {/* Chapters Trail */}
          <div className="max-w-xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-center">Trilha de Capítulos</h2>
            
            <div className="relative flex flex-col items-center space-y-4">
              {book.chapters.slice(0, 8).map((chapter, index) => (
                <div key={chapter.id} className="relative w-full">
                  {/* Connection Line */}
                  {index < 7 && (
                    <div 
                      className={`absolute left-1/2 top-full w-1 h-4 -translate-x-1/2 ${
                        chapter.status === "completed" ? "bg-primary" : "bg-muted"
                      }`} 
                    />
                  )}
                  
                  {/* Chapter Node */}
                  <button
                    onClick={() => handleChapterClick(chapter)}
                    disabled={chapter.status === "locked"}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                      chapter.status === "completed" 
                        ? "bg-primary/10 border-2 border-primary/30" 
                        : chapter.status === "current"
                        ? "bg-accent/10 border-2 border-accent ring-2 ring-accent/20"
                        : "bg-secondary/50 opacity-60"
                    } ${chapter.status !== "locked" ? "hover:scale-[1.02] cursor-pointer" : "cursor-not-allowed"}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      chapter.status === "completed" 
                        ? "bg-primary text-primary-foreground" 
                        : chapter.status === "current"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {chapter.status === "completed" ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : chapter.status === "current" ? (
                        <Play className="w-6 h-6" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <p className="font-bold">Capítulo {chapter.id}</p>
                      <p className="text-sm text-muted-foreground">{chapter.title}</p>
                    </div>

                    {chapter.question && chapter.status !== "locked" && (
                      <HelpCircle className="w-5 h-5 text-primary" />
                    )}
                  </button>
                </div>
              ))}

              {book.chapters.length > 8 && (
                <p className="text-sm text-muted-foreground">
                  + {book.chapters.length - 8} capítulos restantes
                </p>
              )}
            </div>
          </div>

          {/* Question Modal */}
          <Dialog open={showQuestion} onOpenChange={setShowQuestion}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  Pergunta do Capítulo {selectedChapter?.id}
                </DialogTitle>
              </DialogHeader>

              {selectedChapter?.question && (
                <div className="space-y-6 py-4">
                  <p className="text-lg font-medium">{selectedChapter.question.text}</p>
                  
                  <div className="space-y-3">
                    {selectedChapter.question.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => !showResult && setSelectedAnswer(index)}
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded-xl transition-all ${
                          showResult
                            ? index === selectedChapter.question!.correctAnswer
                              ? "bg-green-500/20 border-2 border-green-500"
                              : selectedAnswer === index
                              ? "bg-red-500/20 border-2 border-red-500"
                              : "bg-secondary"
                            : selectedAnswer === index
                            ? "bg-primary/20 border-2 border-primary"
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {showResult && (
                    <div className={`p-4 rounded-xl ${
                      selectedAnswer === selectedChapter.question.correctAnswer
                        ? "bg-green-500/10 border border-green-500/30"
                        : "bg-red-500/10 border border-red-500/30"
                    }`}>
                      <p className="font-bold mb-2">
                        {selectedAnswer === selectedChapter.question.correctAnswer
                          ? "✅ Correto!"
                          : "❌ Incorreto"}
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
      <div className="py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Trilhas Literárias
          </h1>
          <p className="text-muted-foreground">
            Cada trilha é um livro. Cada etapa é um capítulo com perguntas estratégicas.
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookTrails.map((book, index) => {
            const completedChapters = book.chapters.filter(c => c.status === "completed").length;
            const progress = (completedChapters / book.totalChapters) * 100;
            const currentChapter = book.chapters.find(c => c.status === "current");

            return (
              <div 
                key={book.id} 
                className={`glass-card rounded-2xl overflow-hidden card-hover animate-fade-in ${
                  book.isPremium && !isPremium ? "opacity-80" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Header with cover */}
                <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
                  <span className="text-6xl">{book.cover}</span>
                  {book.isPremium && !isPremium && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 text-xs font-bold">
                      <Crown className="w-3 h-3 text-accent" />
                      Premium
                    </div>
                  )}
                  {progress > 0 && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 text-xs font-bold">
                      <CheckCircle className="w-3 h-3 text-primary" />
                      {completedChapters}/{book.totalChapters}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                  
                  {currentChapter && (
                    <p className="text-xs text-primary mb-3">
                      📍 {currentChapter.title}
                    </p>
                  )}
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-bold">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {book.isPremium && !isPremium ? (
                    <Link to="/premium">
                      <Button variant="outline" className="w-full gap-2">
                        <Lock className="w-4 h-4" />
                        Desbloquear com Premium
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/trilhas/${book.id}`}>
                      <Button variant={progress > 0 ? "hero" : "default"} className="w-full gap-2">
                        {progress > 0 ? (
                          <>
                            <Play className="w-4 h-4" />
                            Continuar
                          </>
                        ) : (
                          <>
                            <BookOpen className="w-4 h-4" />
                            Começar
                          </>
                        )}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Trilhas;
