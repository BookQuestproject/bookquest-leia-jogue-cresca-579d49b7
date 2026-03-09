import { Crown, Lock, BookOpen, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminBookClubPanel } from "@/components/admin/AdminBookClubPanel";
import { useBookClubMonthly } from "@/hooks/useBookClubMonthly";

const BookClub = () => {
  const isPremium = false;
  const { isAdmin } = useAdmin();
  const { currentMonth } = useBookClubMonthly();

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

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-bold mb-4">
            <Crown className="w-4 h-4" />
            Premium
          </div>
          <h1 className="text-3xl font-bold mb-2">Book Club</h1>
          <p className="text-muted-foreground">
            Participe de leituras coletivas mensais com discussões guiadas e análises aprofundadas.
          </p>
        </div>

        {/* Admin Panel */}
        {isAdmin && (
          <div className="mb-8">
            <AdminBookClubPanel />
          </div>
        )}

        {/* Livro do Mês */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-xl mb-4">📖 Livro do Mês</h2>
          {currentMonth ? (
            <div className="flex flex-col md:flex-row gap-6">
              {currentMonth.book_cover_url ? (
                <img src={currentMonth.book_cover_url} alt={currentMonth.book_title} className="w-32 h-44 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-32 h-44 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
              <div>
                <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent font-medium">
                  Em andamento
                </span>
                <h3 className="text-2xl font-bold mt-2">{currentMonth.book_title}</h3>
                <p className="text-muted-foreground">{currentMonth.book_author}</p>
                {currentMonth.description && (
                  <p className="text-sm text-muted-foreground mt-2">{currentMonth.description}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">Nenhum livro selecionado</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                O livro do mês ainda não foi definido. Aguarde a seleção pela equipe do BookQuest.
              </p>
            </div>
          )}
        </div>

        {/* Seções do Book Club */}
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: "📝", title: "Resenhas", desc: "Análises e discussões sobre o livro." },
            { icon: "🎬", title: "Vídeos", desc: "Conteúdos em vídeo sobre a obra." },
            { icon: "🔍", title: "Análise Aprofundada", desc: "Estudo detalhado dos temas e personagens." },
            { icon: "👤", title: "Prévia do Autor", desc: "Conheça o autor e sua obra." },
          ].map((section) => (
            <div key={section.title} className={`glass-card rounded-2xl p-6 ${!isPremium ? "opacity-60" : ""}`}>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                {section.icon} {section.title}
                {!isPremium && <Lock className="w-4 h-4 text-muted-foreground" />}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">{section.desc}</p>
              {isPremium ? (
                <Button variant="outline" className="w-full">Ver {section.title}</Button>
              ) : (
                <p className="text-xs text-muted-foreground italic">Assine para acessar</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default BookClub;
