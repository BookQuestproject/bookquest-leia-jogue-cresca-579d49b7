import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const VISITED_KEY = "bookquest_visited_categories";

interface CategoryInfo {
  title: string;
  description: string;
}

const categoryMap: Record<string, CategoryInfo> = {
  "/biblioteca": {
    title: "📚 Biblioteca",
    description: "Explore todos os livros disponíveis no BookQuest. Use os filtros para encontrar por gênero, tema ou formato e adicione à sua estante.",
  },
  "/trilhas": {
    title: "🗺️ Trilhas Literárias",
    description: "Cada livro vira uma trilha com capítulos, cronômetro e quizzes. Leia no seu ritmo e acompanhe seu progresso capítulo a capítulo.",
  },
  "/estante": {
    title: "📖 Minha Estante",
    description: "Organize seus livros: lendo, quero ler, lido ou abandonado. Adicione avaliações e resenhas para compartilhar com a comunidade.",
  },
  "/missoes": {
    title: "🎯 Missões",
    description: "Complete missões diárias, semanais e mensais para ganhar pontos e subir no ranking. Novas missões aparecem automaticamente!",
  },
  "/ranking": {
    title: "🏆 Ranking Literário",
    description: "Compare seu progresso com outros leitores. Suba de Bronze a Lendário completando livros e missões!",
  },
  "/mentoria": {
    title: "✨ Mentoria Literária",
    description: "Sessões em grupo com mentores para criar e manter o hábito de leitura. Recurso exclusivo para assinantes Premium.",
  },
  "/comunidade": {
    title: "💬 Comunidade",
    description: "Participe de comunidades temáticas, discuta livros e conheça outros leitores. Troque ideias e recomendações!",
  },
  "/quiz": {
    title: "❓ Quiz Literário",
    description: "Descubra seu perfil de leitor respondendo perguntas sobre seus gostos e hábitos. O resultado personaliza sua experiência.",
  },
  "/noticias": {
    title: "📰 Notícias",
    description: "Fique por dentro das novidades do BookQuest: novos livros, funcionalidades e curiosidades literárias.",
  },
  "/bookclub": {
    title: "📕 Book Club",
    description: "Leia junto com outros membros Premium. Discussões semanais, metas de leitura compartilhadas e encontros virtuais.",
  },
  "/enem": {
    title: "🎓 ENEM e Vestibulares",
    description: "Materiais de estudo, resumos de obras obrigatórias e exercícios focados nos principais vestibulares do Brasil.",
  },
  "/perfil": {
    title: "👤 Meu Perfil",
    description: "Veja suas estatísticas de leitura, conquistas e personalize sua conta.",
  },
  "/configuracoes": {
    title: "⚙️ Configurações",
    description: "Ajuste tema, notificações e preferências da sua conta. Você também pode reiniciar o tutorial guiado aqui.",
  },
  "/admin": {
    title: "🛡️ Painel Admin",
    description: "Gerencie trilhas, livros, sessões de mentoria, materiais ENEM e configurações premium do BookQuest.",
  },
};

function getVisited(): string[] {
  try {
    return JSON.parse(localStorage.getItem(VISITED_KEY) || "[]");
  } catch {
    return [];
  }
}

function markVisited(path: string) {
  const visited = getVisited();
  if (!visited.includes(path)) {
    visited.push(path);
    localStorage.setItem(VISITED_KEY, JSON.stringify(visited));
  }
}

const CategoryIntro = () => {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [info, setInfo] = useState<CategoryInfo | null>(null);

  useEffect(() => {
    const path = location.pathname;
    // Skip home page
    if (path === "/" || path === "/auth" || path === "/quiz-onboarding") return;

    const cat = categoryMap[path];
    if (!cat) return;

    const visited = getVisited();
    if (visited.includes(path)) return;

    // Show intro after a short delay
    const timer = setTimeout(() => {
      setInfo(cat);
      setShow(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleDismiss = () => {
    setShow(false);
    markVisited(location.pathname);
  };

  if (!show || !info) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={handleDismiss}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm animate-fade-in" />

      {/* Card */}
      <div
        className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-scale-in z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-secondary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Primeira visita</span>
        </div>

        <h3 className="text-xl font-serif font-semibold mb-2">{info.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          {info.description}
        </p>

        <Button
          onClick={handleDismiss}
          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
          size="sm"
        >
          Entendi, vamos lá!
        </Button>
      </div>
    </div>
  );
};

export default CategoryIntro;
