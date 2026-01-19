import { useState } from "react";
import { Newspaper, Bell, Sparkles, BookOpen, Star, Calendar, ChevronRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

interface NewsItem {
  id: number;
  type: "update" | "curiosity" | "announcement";
  title: string;
  content: string;
  date: string;
  isNew?: boolean;
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    type: "announcement",
    title: "Novo recurso: Trilhas por Livro!",
    content: "Agora cada trilha representa um livro completo. Cada capítulo tem uma pergunta estratégica para testar sua compreensão. Experimente agora!",
    date: "04 Jan 2026",
    isNew: true,
  },
  {
    id: 2,
    type: "curiosity",
    title: "Você sabia? Leitura e memória",
    content: "Estudos mostram que pessoas que leem ficção têm maior capacidade de empatia e compreensão social. O cérebro ativa as mesmas áreas que usamos para entender emoções reais!",
    date: "03 Jan 2026",
  },
  {
    id: 3,
    type: "update",
    title: "Sistema de Ranking atualizado",
    content: "O ranking agora é dividido por patamar! Você compete apenas com leitores do seu nível. Bronze compete com Bronze, Ouro com Ouro, e assim por diante.",
    date: "02 Jan 2026",
    isNew: true,
  },
  {
    id: 4,
    type: "curiosity",
    title: "A biblioteca de Alexandria",
    content: "A antiga Biblioteca de Alexandria chegou a ter cerca de 400.000 rolos de papiro. Seria o equivalente a aproximadamente 100.000 livros modernos!",
    date: "01 Jan 2026",
  },
  {
    id: 5,
    type: "announcement",
    title: "Livro do Mês - Fevereiro 2026",
    content: "O Book Club de fevereiro vai ler 'O Nome do Vento' de Patrick Rothfuss. Prepare-se para uma jornada épica! Início dia 1º de fevereiro.",
    date: "30 Dez 2025",
  },
  {
    id: 6,
    type: "update",
    title: "Novo sistema de tocha (streak)",
    content: "A tocha agora muda de cor conforme seus dias consecutivos! De laranja a preto absoluto para os leitores mais dedicados com 250+ dias.",
    date: "28 Dez 2025",
  },
  {
    id: 7,
    type: "curiosity",
    title: "O poder da leitura diária",
    content: "Ler apenas 20 minutos por dia expõe você a cerca de 1.8 milhão de palavras por ano. Isso pode melhorar significativamente seu vocabulário e habilidades de escrita.",
    date: "25 Dez 2025",
  },
  {
    id: 8,
    type: "announcement",
    title: "Bem-vindo ao BookQuest!",
    content: "Estamos felizes em ter você aqui! O BookQuest foi criado para transformar a leitura em uma jornada gamificada e divertida. Explore as trilhas, complete missões e suba no ranking!",
    date: "20 Dez 2025",
  },
];

const typeConfig = {
  update: {
    icon: Bell,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Atualização",
  },
  curiosity: {
    icon: Sparkles,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    label: "Curiosidade",
  },
  announcement: {
    icon: Star,
    color: "text-accent",
    bg: "bg-accent/10",
    label: "Anúncio",
  },
};

const Noticias = () => {
  const [selectedType, setSelectedType] = useState<"all" | "update" | "curiosity" | "announcement">("all");

  const filteredNews = newsItems.filter(
    item => selectedType === "all" || item.type === selectedType
  );

  const filters = [
    { id: "all", label: "Todas" },
    { id: "announcement", label: "Anúncios" },
    { id: "update", label: "Atualizações" },
    { id: "curiosity", label: "Curiosidades" },
  ];

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-primary" />
            Notícias
          </h1>
          <p className="text-muted-foreground">
            Atualizações do app, curiosidades literárias e novidades
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedType(filter.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedType === filter.id
                  ? "bg-secondary text-secondary-foreground ring-2 ring-secondary"
                  : "bg-muted text-primary hover:bg-muted/80"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* News List */}
        <div className="space-y-4">
          {filteredNews.map((item, index) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;

            return (
              <div 
                key={item.id}
                className="glass-card rounded-2xl p-5 animate-fade-in card-hover"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium`}>
                        {config.label}
                      </span>
                      {item.isNew && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">
                          NOVO
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.content}</p>
                    
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-16">
            <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Nenhuma notícia encontrada</h3>
            <p className="text-muted-foreground">
              Tente selecionar outra categoria
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Noticias;
