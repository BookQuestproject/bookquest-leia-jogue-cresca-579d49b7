import { useState } from "react";
import { Trophy, Crown, TrendingUp, BookOpen, Users, Plus, Check, X, AlertTriangle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import RankingBadge, { RankingTier, tierConfig, getTierFromBooks } from "@/components/RankingBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RankingUser {
  id: number;
  name: string;
  avatar: string;
  booksRead: number;
  tier: RankingTier;
  streak: number;
}

// Mock users organized by tier
const allUsers: RankingUser[] = [
  // Bronze (0-5 livros)
  { id: 101, name: "Você", avatar: "VC", booksRead: 0, tier: "bronze", streak: 0 },
  { id: 102, name: "Fernanda Rocha", avatar: "FR", booksRead: 4, tier: "bronze", streak: 5 },
  { id: 103, name: "Bruno Dias", avatar: "BD", booksRead: 5, tier: "bronze", streak: 2 },
  { id: 104, name: "Amanda Costa", avatar: "AC", booksRead: 3, tier: "bronze", streak: 1 },
  
  // Ouro (6-15 livros)
  { id: 201, name: "Rafael Lima", avatar: "RL", booksRead: 8, tier: "gold", streak: 8 },
  { id: 202, name: "Juliana Mendes", avatar: "JM", booksRead: 12, tier: "gold", streak: 10 },
  { id: 203, name: "Thiago Souza", avatar: "TS", booksRead: 14, tier: "gold", streak: 6 },
  
  // Safira (16-30 livros)
  { id: 301, name: "Carla Souza", avatar: "CS", booksRead: 18, tier: "sapphire", streak: 12 },
  { id: 302, name: "Felipe Santos", avatar: "FS", booksRead: 25, tier: "sapphire", streak: 15 },
  { id: 303, name: "Mariana Luz", avatar: "ML", booksRead: 28, tier: "sapphire", streak: 20 },
  
  // Esmeralda (31-50 livros)
  { id: 401, name: "Lucas Almeida", avatar: "LA", booksRead: 35, tier: "emerald", streak: 14 },
  { id: 402, name: "Patricia Gomes", avatar: "PG", booksRead: 42, tier: "emerald", streak: 18 },
  { id: 403, name: "Ricardo Nunes", avatar: "RN", booksRead: 48, tier: "emerald", streak: 22 },
  
  // Ametista (51-80 livros)
  { id: 501, name: "Julia Ferreira", avatar: "JF", booksRead: 55, tier: "amethyst", streak: 18 },
  { id: 502, name: "Eduardo Pinto", avatar: "EP", booksRead: 68, tier: "amethyst", streak: 25 },
  { id: 503, name: "Isabela Martins", avatar: "IM", booksRead: 75, tier: "amethyst", streak: 30 },
  
  // Rubi (81-120 livros)
  { id: 601, name: "Pedro Costa", avatar: "PC", booksRead: 85, tier: "ruby", streak: 21 },
  { id: 602, name: "Camila Araújo", avatar: "CA", booksRead: 98, tier: "ruby", streak: 35 },
  { id: 603, name: "Guilherme Reis", avatar: "GR", booksRead: 115, tier: "ruby", streak: 40 },
  
  // Diamante (121-199 livros)
  { id: 701, name: "João Santos", avatar: "JS", booksRead: 130, tier: "diamond", streak: 30 },
  { id: 702, name: "Ana Oliveira", avatar: "AO", booksRead: 156, tier: "diamond", streak: 28 },
  { id: 703, name: "Fernando Lopes", avatar: "FL", booksRead: 180, tier: "diamond", streak: 45 },
  
  // Lendário (200+ livros)
  { id: 801, name: "Maria Silva", avatar: "MS", booksRead: 250, tier: "legendary", streak: 100 },
  { id: 802, name: "Carlos Pereira", avatar: "CP", booksRead: 215, tier: "legendary", streak: 85 },
];

const rankingTiers: { tier: RankingTier; books: string; label: string }[] = [
  { tier: "bronze", books: "0-5", label: "Bronze" },
  { tier: "gold", books: "6-15", label: "Ouro" },
  { tier: "sapphire", books: "16-30", label: "Safira" },
  { tier: "emerald", books: "31-50", label: "Esmeralda" },
  { tier: "amethyst", books: "51-80", label: "Ametista" },
  { tier: "ruby", books: "81-120", label: "Rubi" },
  { tier: "diamond", books: "121-199", label: "Diamante" },
  { tier: "legendary", books: "200+", label: "Lendário" },
];

// Book verification questions for anti-fraud
interface VerificationQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

const bookVerificationQuestions: Record<string, VerificationQuestion[]> = {
  default: [
    {
      question: "Você realmente leu este livro até o final?",
      options: ["Sim, li completamente", "Li parcialmente", "Ainda não terminei"],
      correctIndex: 0,
    },
    {
      question: "Quanto tempo levou para ler este livro?",
      options: ["Menos de 1 semana", "1-2 semanas", "Mais de 2 semanas", "Mais de 1 mês"],
      correctIndex: -1, // Any answer is valid
    },
  ],
};

const Ranking = () => {
  const [selectedTier, setSelectedTier] = useState<RankingTier>("bronze");
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [verificationStep, setVerificationStep] = useState(0);
  const [verificationAnswers, setVerificationAnswers] = useState<number[]>([]);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const currentUserTier: RankingTier = "bronze";

  const tierUsers = allUsers
    .filter(user => user.tier === selectedTier)
    .sort((a, b) => b.booksRead - a.booksRead);

  const top3 = tierUsers.slice(0, 3);
  const restUsers = tierUsers.slice(3);

  const handleAddBook = () => {
    if (!bookTitle.trim() || !bookAuthor.trim()) return;
    setVerificationStep(1);
  };

  const handleVerificationAnswer = (answerIndex: number) => {
    const newAnswers = [...verificationAnswers, answerIndex];
    setVerificationAnswers(newAnswers);

    const questions = bookVerificationQuestions.default;
    if (newAnswers.length >= questions.length) {
      // Check if first question was answered correctly (user claims to have read the book)
      const claimedToRead = newAnswers[0] === 0;
      setIsVerified(claimedToRead);
      setVerificationStep(2);
    }
  };

  const resetAddBook = () => {
    setBookTitle("");
    setBookAuthor("");
    setVerificationStep(0);
    setVerificationAnswers([]);
    setIsVerified(null);
    setIsAddBookOpen(false);
  };

  const questions = bookVerificationQuestions.default;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8">
        {/* Header */}
        <header className="mb-10 animate-fade-in" data-tutorial="ranking-header">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Competição por Nível</p>
              <h1 className="text-3xl lg:text-4xl font-serif font-semibold mb-2">Ranking Literário</h1>
              <p className="text-muted-foreground max-w-xl">
                Você compete apenas com leitores do seu nível. Suba de patamar lendo mais livros.
              </p>
            </div>
            
            {/* Add Book Button */}
            <Dialog open={isAddBookOpen} onOpenChange={(open) => {
              if (!open) resetAddBook();
              else setIsAddBookOpen(true);
            }}>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Adicionar Livro
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-secondary" />
                    {verificationStep === 0 && "Adicionar Livro Lido"}
                    {verificationStep === 1 && "Verificação de Leitura"}
                    {verificationStep === 2 && (isVerified ? "Livro Adicionado!" : "Verificação Falhou")}
                  </DialogTitle>
                  <DialogDescription>
                    {verificationStep === 0 && "Informe os dados do livro que você terminou de ler."}
                    {verificationStep === 1 && "Por favor, responda algumas perguntas para confirmar sua leitura."}
                    {verificationStep === 2 && (isVerified 
                      ? "Sua leitura foi verificada com sucesso!" 
                      : "Não foi possível verificar sua leitura."
                    )}
                  </DialogDescription>
                </DialogHeader>

                {verificationStep === 0 && (
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Título do Livro</label>
                      <Input
                        placeholder="Ex: Harry Potter e a Pedra Filosofal"
                        value={bookTitle}
                        onChange={(e) => setBookTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Autor</label>
                      <Input
                        placeholder="Ex: J.K. Rowling"
                        value={bookAuthor}
                        onChange={(e) => setBookAuthor(e.target.value)}
                      />
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/10 text-sm">
                      <AlertTriangle className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">
                        Sistema antifraude: você precisará responder perguntas para verificar sua leitura.
                      </p>
                    </div>
                    <Button 
                      variant="hero" 
                      className="w-full" 
                      onClick={handleAddBook}
                      disabled={!bookTitle.trim() || !bookAuthor.trim()}
                    >
                      Continuar
                    </Button>
                  </div>
                )}

                {verificationStep === 1 && (
                  <div className="space-y-4 py-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Livro:</p>
                      <p className="font-semibold">{bookTitle}</p>
                      <p className="text-sm text-muted-foreground">{bookAuthor}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="font-medium">{questions[verificationAnswers.length]?.question}</p>
                      <div className="space-y-2">
                        {questions[verificationAnswers.length]?.options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleVerificationAnswer(idx)}
                            className="w-full p-3 text-left rounded-lg border border-border hover:border-secondary hover:bg-secondary/5 transition-all"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-1">
                      {questions.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx < verificationAnswers.length
                              ? "bg-secondary"
                              : idx === verificationAnswers.length
                              ? "bg-secondary/50"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {verificationStep === 2 && (
                  <div className="py-6 text-center">
                    {isVerified ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                          <Check className="w-8 h-8 text-success" />
                        </div>
                        <p className="font-semibold mb-2">{bookTitle}</p>
                        <p className="text-sm text-muted-foreground mb-4">por {bookAuthor}</p>
                        <p className="text-sm text-muted-foreground mb-6">
                          Parabéns! O livro foi adicionado à sua estante e sua contagem foi atualizada.
                        </p>
                        <Button variant="hero" onClick={resetAddBook}>
                          Fechar
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                          <X className="w-8 h-8 text-destructive" />
                        </div>
                        <p className="font-semibold mb-2">Verificação não concluída</p>
                        <p className="text-sm text-muted-foreground mb-6">
                          Você indicou que ainda não terminou de ler o livro. Adicione-o quando concluir a leitura!
                        </p>
                        <Button variant="outline" onClick={resetAddBook}>
                          Tentar novamente
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Tier Selector */}
        <div className="editorial-card p-5 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-secondary" />
            <h2 className="font-semibold">Selecione o Patamar</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {rankingTiers.map(({ tier, books, label }) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`text-center p-3 rounded transition-all ${
                  selectedTier === tier 
                    ? "bg-secondary text-secondary-foreground" 
                    : "bg-muted/30 hover:bg-muted/50"
                }`}
              >
                <RankingBadge tier={tier} showLabel={false} size="sm" />
                <p className="font-medium mt-2 text-xs">{label}</p>
                <p className="text-xs text-muted-foreground">{books}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Tier Info */}
        <div className="editorial-card p-5 mb-8 border-l-4 border-secondary animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <RankingBadge tier={selectedTier} size="lg" />
              <div>
                <h3 className="font-serif text-xl font-semibold">
                  Ranking {tierConfig[selectedTier].label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tierUsers.length} leitores neste patamar
                </p>
              </div>
            </div>
            {currentUserTier === selectedTier && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-secondary/10 text-secondary text-sm font-medium">
                <Users className="w-4 h-4" />
                Seu patamar
              </div>
            )}
          </div>
        </div>

        {/* Top 3 Podium */}
        {top3.length >= 3 && (
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {/* 2nd Place */}
            <div className="editorial-card p-5 text-center order-2 md:order-1 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="w-14 h-14 rounded bg-muted flex items-center justify-center mx-auto mb-3 text-lg font-semibold">
                {top3[1]?.avatar}
              </div>
              <p className="text-xl mb-2">🥈</p>
              <h3 className="font-semibold">
                {top3[1]?.name}
                {top3[1]?.name === "Você" && <span className="text-secondary ml-1">(você)</span>}
              </h3>
              <div className="flex justify-center gap-4 mt-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Livros</p>
                  <p className="font-semibold">{top3[1]?.booksRead}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sequência</p>
                  <p className="font-semibold">{top3[1]?.streak} dias</p>
                </div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="editorial-card p-5 text-center order-1 md:order-2 border-accent/50 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <Crown className="w-6 h-6 text-accent mx-auto mb-2" />
              <div className="w-16 h-16 rounded bg-accent/20 flex items-center justify-center mx-auto mb-3 text-xl font-semibold text-accent">
                {top3[0]?.avatar}
              </div>
              <p className="text-2xl mb-2">🥇</p>
              <h3 className="font-serif text-lg font-semibold">
                {top3[0]?.name}
                {top3[0]?.name === "Você" && <span className="text-secondary ml-1">(você)</span>}
              </h3>
              <div className="flex justify-center gap-4 mt-3">
                <div>
                  <p className="text-muted-foreground text-sm">Livros</p>
                  <p className="font-semibold">{top3[0]?.booksRead}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Sequência</p>
                  <p className="font-semibold">{top3[0]?.streak} dias</p>
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="editorial-card p-5 text-center order-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="w-14 h-14 rounded bg-muted flex items-center justify-center mx-auto mb-3 text-lg font-semibold">
                {top3[2]?.avatar}
              </div>
              <p className="text-xl mb-2">🥉</p>
              <h3 className="font-semibold">
                {top3[2]?.name}
                {top3[2]?.name === "Você" && <span className="text-secondary ml-1">(você)</span>}
              </h3>
              <div className="flex justify-center gap-4 mt-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Livros</p>
                  <p className="font-semibold">{top3[2]?.booksRead}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sequência</p>
                  <p className="font-semibold">{top3[2]?.streak} dias</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Ranking List */}
        {restUsers.length > 0 && (
          <div className="editorial-card overflow-hidden animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="p-4 border-b border-border/60">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                Ranking Completo
              </h3>
            </div>
            <div className="divide-y divide-border/60">
              {restUsers.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors ${
                    user.name === "Você" ? "bg-secondary/5 border-l-2 border-secondary" : ""
                  }`}
                >
                  <span className="text-lg font-medium text-muted-foreground w-8">
                    #{index + 4}
                  </span>
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center font-medium">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {user.name}
                      {user.name === "Você" && (
                        <span className="ml-2 text-xs text-secondary">(você)</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-secondary">{user.booksRead} livros</p>
                    <p className="text-xs text-muted-foreground">{user.streak} dias</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tierUsers.length === 0 && (
          <div className="text-center py-12 editorial-card">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-lg font-semibold mb-2">Nenhum leitor neste patamar</h3>
            <p className="text-muted-foreground">
              Seja o primeiro a alcançar o nível {tierConfig[selectedTier].label}!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Ranking;
