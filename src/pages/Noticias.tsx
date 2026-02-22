import { useState } from "react";
import { Newspaper, Bell, Sparkles, Star, Calendar, TrendingUp, BookOpen, Flame } from "lucide-react";
import Layout from "@/components/layout/Layout";

interface NewsItem {
  id: number;
  type: "update" | "curiosity" | "announcement";
  title: string;
  content: string;
  date: string;
  isNew?: boolean;
  isPinned?: boolean;
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    type: "announcement",
    title: "Novo recurso: Trilhas por Livro!",
    content: "Agora cada trilha representa um livro completo. Cada capítulo tem uma pergunta estratégica para testar sua compreensão. Experimente agora!",
    date: "04 Jan 2026",
    isNew: true,
    isPinned: true,
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
    label: "Atualização",
    gradient: "from-blue-500/20 to-blue-600/10",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
    border: "border-blue-500/20",
  },
  curiosity: {
    icon: Sparkles,
    label: "Curiosidade",
    gradient: "from-purple-500/20 to-purple-600/10",
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-400",
    border: "border-purple-500/20",
  },
  announcement: {
    icon: Star,
    label: "Anúncio",
    gradient: "from-accent/20 to-accent/10",
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
    border: "border-accent/20",
  },
};

const quickStats = [
  { icon: BookOpen, label: "Livros disponíveis", value: "50+" },
  { icon: Flame, label: "Leitores ativos", value: "1.2K" },
  { icon: TrendingUp, label: "Capítulos lidos hoje", value: "340" },
];

const Noticias = () => {
  const [selectedType, setSelectedType] = useState<"all" | "update" | "curiosity" | "announcement">("all");

  const filteredNews = newsItems.filter(
    item => selectedType === "all" || item.type === selectedType
  );

  const pinnedNews = filteredNews.filter(item => item.isPinned);
  const regularNews = filteredNews.filter(item => !item.isPinned);

  const filters = [
    { id: "all", label: "Todas" },
    { id: "announcement", label: "Anúncios" },
    { id: "update", label: "Atualizações" },
    { id: "curiosity", label: "Curiosidades" },
  ];

  return (
    <Layout>
      <div className="py-8 max-w-4xl mx-auto">
        {/* Hero Header */}
        <div className="mb-10 animate-fade-in" data-tutorial="noticias-header">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary/15 flex items-center justify-center">
              <Newspaper className="w-7 h-7 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-serif font-semibold">
                Notícias
              </h1>
              <p className="text-muted-foreground">
                Atualizações, curiosidades literárias e novidades do BookQuest
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {quickStats.map((stat, i) => (
            <div key={i} className="editorial-card p-4 text-center">
              <stat.icon className="w-5 h-5 text-secondary mx-auto mb-2" />
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto py-1 -my-1" data-tutorial="noticias-filters">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedType(filter.id as any)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedType === filter.id
                  ? "bg-secondary text-secondary-foreground ring-2 ring-secondary"
                  : "bg-muted text-primary hover:bg-muted/80"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Pinned / Featured News */}
        {pinnedNews.length > 0 && (
          <div className="mb-8 space-y-4">
            {pinnedNews.map((item) => {
              const config = typeConfig[item.type];
              const Icon = config.icon;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl p-6 border-2 ${config.border} bg-gradient-to-br ${config.gradient} animate-fade-in`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-7 h-7 ${config.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-bold">
                          DESTAQUE
                        </span>
                        {item.isNew && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-primary text-primary-foreground font-bold">
                            NOVO
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-serif font-semibold mb-2">{item.title}</h2>
                      <p className="text-muted-foreground leading-relaxed">{item.content}</p>
                      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.date}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Regular News */}
        <div className="space-y-4">
          {regularNews.map((item, index) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-5 animate-fade-in card-hover"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${config.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.iconBg} ${config.iconColor} font-medium`}>
                        {config.label}
                      </span>
                      {item.isNew && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">
                          NOVO
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.content}</p>

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
          <div className="text-center py-20">
            <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma notícia encontrada</h3>
            <p className="text-muted-foreground">Tente selecionar outra categoria</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Noticias;
