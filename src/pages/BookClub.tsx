import { Crown, Lock, MessageSquare, Calendar, Users, BookOpen, Star, Play, Video, User } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const BookClub = () => {
  const isPremium = false;

  const currentBook = {
    title: "O Nome do Vento",
    author: "Patrick Rothfuss",
    cover: "📕",
    status: "Pendente",
    startDate: "1 de Fevereiro de 2026",
    members: 234,
  };

  // Preview para não-premium - mostra estrutura mas não permite interação
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

        {/* Livro do Mês */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-xl mb-4">📖 Livro do Mês - Fevereiro 2026</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-32 h-44 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-6xl">{currentBook.cover}</span>
            </div>
            <div>
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 font-medium">
                {currentBook.status}
              </span>
              <h3 className="text-2xl font-bold mt-2">{currentBook.title}</h3>
              <p className="text-muted-foreground">{currentBook.author}</p>
              <p className="text-sm text-primary mt-2">📅 Início: {currentBook.startDate}</p>
              <p className="text-sm text-muted-foreground mt-1">👥 {currentBook.members} participantes</p>
            </div>
          </div>
        </div>

        {/* Seções do Book Club */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className={`glass-card rounded-2xl p-6 ${!isPremium ? "opacity-60" : ""}`}>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              📝 Resenhas
              {!isPremium && <Lock className="w-4 h-4 text-muted-foreground" />}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">Análises e discussões sobre o livro.</p>
            {isPremium ? (
              <Button variant="outline" className="w-full">Ver Resenhas</Button>
            ) : (
              <p className="text-xs text-muted-foreground italic">Assine para acessar</p>
            )}
          </div>
          <div className={`glass-card rounded-2xl p-6 ${!isPremium ? "opacity-60" : ""}`}>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              🎬 Vídeos
              {!isPremium && <Lock className="w-4 h-4 text-muted-foreground" />}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">Conteúdos em vídeo sobre a obra.</p>
            {isPremium ? (
              <Button variant="outline" className="w-full">Ver Vídeos</Button>
            ) : (
              <p className="text-xs text-muted-foreground italic">Assine para acessar</p>
            )}
          </div>
          <div className={`glass-card rounded-2xl p-6 ${!isPremium ? "opacity-60" : ""}`}>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              🔍 Análise Aprofundada
              {!isPremium && <Lock className="w-4 h-4 text-muted-foreground" />}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">Estudo detalhado dos temas e personagens.</p>
            {isPremium ? (
              <Button variant="outline" className="w-full">Ver Análise</Button>
            ) : (
              <p className="text-xs text-muted-foreground italic">Assine para acessar</p>
            )}
          </div>
          <div className={`glass-card rounded-2xl p-6 ${!isPremium ? "opacity-60" : ""}`}>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              👤 Prévia do Autor
              {!isPremium && <Lock className="w-4 h-4 text-muted-foreground" />}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">Conheça Patrick Rothfuss e sua obra.</p>
            {isPremium ? (
              <Button variant="outline" className="w-full">Ver Autor</Button>
            ) : (
              <p className="text-xs text-muted-foreground italic">Assine para acessar</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );

};

export default BookClub;
