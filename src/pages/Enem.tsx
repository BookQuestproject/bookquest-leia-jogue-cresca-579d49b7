import { Crown, Lock, GraduationCap, BookOpen, CheckCircle, Star, Play } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

interface ExamTrail {
  id: string;
  name: string;
  description: string;
  icon: string;
  books: number;
  progress: number;
}

const examTrails: ExamTrail[] = [
  { id: "enem-literatura", name: "ENEM - Literatura", description: "Obras mais cobradas no ENEM", icon: "📝", books: 15, progress: 0 },
  { id: "fuvest-2025", name: "FUVEST 2025", description: "Lista obrigatória FUVEST", icon: "🎓", books: 9, progress: 0 },
  { id: "unicamp-2025", name: "UNICAMP 2025", description: "Lista obrigatória UNICAMP", icon: "🏛️", books: 12, progress: 0 },
  { id: "unesp-2025", name: "UNESP 2025", description: "Lista obrigatória UNESP", icon: "📚", books: 8, progress: 0 },
];

const featuredBooks = [
  { title: "Memórias Póstumas de Brás Cubas", author: "Machado de Assis", cover: "📕" },
  { title: "Grande Sertão: Veredas", author: "Guimarães Rosa", cover: "🌿" },
  { title: "A Hora da Estrela", author: "Clarice Lispector", cover: "⭐" },
  { title: "Capitães da Areia", author: "Jorge Amado", cover: "🌊" },
];

const Enem = () => {
  const isPremium = false; // Would come from user state

  // Preview para não-premium
  return (
    <Layout isPremium={isPremium}>
      <div className="py-8">
        {/* Premium Banner */}
        {!isPremium && (
          <div className="glass-card rounded-2xl p-4 mb-6 bg-accent/5 border-accent/20 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-bold text-sm">Conteúdo Premium</p>
                  <p className="text-xs text-muted-foreground">Visualização prévia - assine para interagir</p>
                </div>
              </div>
              <Link to="/premium">
                <Button variant="premium" size="sm" className="gap-2">
                  <Crown className="w-4 h-4" />
                  Assinar - R$ 19,90/mês
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-bold mb-4">
            <Crown className="w-4 h-4" />
            Premium
          </div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            ENEM e Vestibulares
          </h1>
          <p className="text-muted-foreground">
            Trilhas focadas em leituras obrigatórias para vestibulares. Inclui resumos, análises e questões.
          </p>
        </div>

        {/* Featured Books Preview */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <p className="text-sm font-bold mb-4">Algumas das obras incluídas:</p>
          <div className="flex gap-4 flex-wrap">
            {featuredBooks.map((book, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center"
              >
                <div className="w-16 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-2xl">{book.cover}</span>
                </div>
                <p className="text-xs text-center max-w-[80px] line-clamp-2">{book.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Exam Trails */}
        <div className={`grid md:grid-cols-2 gap-6 mb-10 ${!isPremium ? "opacity-70" : ""}`}>
          {examTrails.map((trail, index) => (
            <div 
              key={trail.id}
              className="glass-card rounded-2xl p-6 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center text-3xl">
                  {trail.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {trail.name}
                    {!isPremium && <Lock className="w-4 h-4 text-muted-foreground" />}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">{trail.description}</p>
                  <p className="text-xs text-muted-foreground">{trail.books} obras incluídas</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-bold">{trail.progress}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${trail.progress}%` }}
                  />
                </div>
                {isPremium ? (
                  <Button variant="hero" className="w-full gap-2">
                    <Play className="w-4 h-4" />
                    Começar Trilha
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center">Assine para acessar</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Seu Progresso</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-secondary">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-xs text-muted-foreground">Obras lidas</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-secondary">
              <p className="text-2xl font-bold text-accent">0</p>
              <p className="text-xs text-muted-foreground">Resumos vistos</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-secondary">
              <p className="text-2xl font-bold text-success">0</p>
              <p className="text-xs text-muted-foreground">Questões feitas</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-secondary">
              <p className="text-2xl font-bold text-info">0%</p>
              <p className="text-xs text-muted-foreground">Taxa de acerto</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );

};

export default Enem;
