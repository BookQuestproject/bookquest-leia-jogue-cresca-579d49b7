import { useState } from "react";
import { Newspaper, Bell, Sparkles, Star, Filter, Check } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useNews } from "@/hooks/useNews";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  { label: "Leitores Ativos", value: "2.4K+", icon: "👥" },
  { label: "Livros Disponíveis", value: "35+", icon: "📚" },
  { label: "Comunidades", value: "12", icon: "🌐" },
];

const Noticias = () => {
  const { news, loading, markAsRead, markAllAsRead, getUnreadCount } = useNews();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const filteredNews = news.filter((item) => {
    if (selectedType && item.type !== selectedType) return false;
    if (showOnlyUnread && item.is_read) return false;
    return true;
  });

  const pinnedNews = filteredNews.filter((item) => item.is_pinned);
  const regularNews = filteredNews.filter((item) => !item.is_pinned);

  const unreadCount = getUnreadCount();

  const handleNewsClick = (newsId: string) => {
    markAsRead(newsId);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-background border border-border p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Newspaper className="h-8 w-8 text-accent" />
              <h1 className="text-3xl font-bold text-foreground">Notícias</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Fique por dentro das últimas atualizações, curiosidades literárias e novidades do BookQuest
            </p>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickStats.map((stat, idx) => (
            <Card key={idx} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-3xl">{stat.icon}</span>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={showOnlyUnread ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Não lidas {unreadCount > 0 && `(${unreadCount})`}
          </Button>
          
          <div className="h-6 w-px bg-border" />

          <Button
            variant={selectedType === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(null)}
          >
            Todas
          </Button>
          
          {Object.entries(typeConfig).map(([type, config]) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type)}
              className="gap-2"
            >
              <config.icon className="h-4 w-4" />
              {config.label}
            </Button>
          ))}

          {unreadCount > 0 && (
            <>
              <div className="h-6 w-px bg-border" />
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="gap-2 text-accent hover:text-accent"
              >
                <Check className="h-4 w-4" />
                Marcar todas como lidas
              </Button>
            </>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card border-border animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Pinned News */}
            {pinnedNews.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  📌 Em Destaque
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {pinnedNews.map((item) => {
                    const config = typeConfig[item.type];
                    const Icon = config.icon;
                    const isNew = new Date(item.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

                    return (
                      <Card
                        key={item.id}
                        className={`bg-gradient-to-br ${config.gradient} border ${config.border} hover:shadow-lg transition-all cursor-pointer relative overflow-hidden ${
                          item.is_read ? 'opacity-70' : ''
                        }`}
                        onClick={() => handleNewsClick(item.id)}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/10 to-transparent rounded-full blur-2xl" />
                        <CardContent className="p-6 relative z-10">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`p-2.5 rounded-lg ${config.iconBg}`}>
                              <Icon className={`h-5 w-5 ${config.iconColor}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {config.label}
                                </span>
                                {isNew && !item.is_read && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-accent/20 text-accent rounded-full">
                                    Novo
                                  </span>
                                )}
                                {!item.is_read && (
                                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                                )}
                              </div>
                              <h3 className="text-lg font-bold text-foreground mb-2">
                                {item.title}
                              </h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {item.content}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-4">
                            {new Date(item.created_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Regular News */}
            {regularNews.length > 0 && (
              <div className="space-y-4">
                {pinnedNews.length > 0 && (
                  <h2 className="text-xl font-semibold text-foreground">Todas as Notícias</h2>
                )}
                <div className="space-y-3">
                  {regularNews.map((item) => {
                    const config = typeConfig[item.type];
                    const Icon = config.icon;
                    const isNew = new Date(item.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

                    return (
                      <Card
                        key={item.id}
                        className={`bg-card border ${config.border} hover:border-accent/50 transition-all cursor-pointer ${
                          item.is_read ? 'opacity-70' : ''
                        }`}
                        onClick={() => handleNewsClick(item.id)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${config.iconBg} flex-shrink-0`}>
                              <Icon className={`h-4 w-4 ${config.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {config.label}
                                </span>
                                {isNew && !item.is_read && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-accent/20 text-accent rounded-full">
                                    Novo
                                  </span>
                                )}
                                {!item.is_read && (
                                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse flex-shrink-0" />
                                )}
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {new Date(item.created_at).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <h3 className="text-base font-semibold text-foreground mb-1">
                                {item.title}
                              </h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {item.content}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredNews.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="text-center py-12">
                  <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    {showOnlyUnread
                      ? "Você está em dia! Nenhuma notícia não lida."
                      : "Nenhuma notícia encontrada."}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Noticias;
