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

  if (!isPremium) {
    return (
      <Layout>
        <div className="py-8 max-w-2xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-8 lg:p-12 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Book Club</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Participe de leituras coletivas mensais com discussões guiadas e análises aprofundadas.
            </p>
            
            <div className="glass-card rounded-2xl p-6 mb-8 text-left">
              <div className="flex gap-4 items-center mb-4">
                <div className="w-20 h-28 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                  <span className="text-5xl">{currentBook.cover}</span>
                </div>
                <div>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 font-medium">
                    {currentBook.status}
                  </span>
                  <h3 className="font-bold text-lg mt-1">{currentBook.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentBook.author}</p>
                  <p className="text-xs text-primary mt-2">📅 Início: {currentBook.startDate}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-secondary">
                <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-bold">Resenhas</p>
                <p className="text-xs text-muted-foreground">Análises detalhadas</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary">
                <Video className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-bold">Vídeos</p>
                <p className="text-xs text-muted-foreground">Discussões em vídeo</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary">
                <User className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-bold">Prévia do Autor</p>
                <p className="text-xs text-muted-foreground">Conheça o escritor</p>
              </div>
            </div>

            <Link to="/premium">
              <Button variant="premium" size="lg" className="gap-2">
                <Crown className="w-5 h-5" />
                Assinar Premium - R$ 19,90/mês
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isPremium>
      <div className="py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-bold mb-4">
            <Crown className="w-4 h-4" />
            Premium
          </div>
          <h1 className="text-3xl font-bold mb-2">Book Club</h1>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-xl mb-4">📖 Livro do Mês - Fevereiro 2026</h2>
          <div className="flex gap-6">
            <div className="w-32 h-44 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
              <span className="text-6xl">{currentBook.cover}</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold">{currentBook.title}</h3>
              <p className="text-muted-foreground">{currentBook.author}</p>
              <p className="text-sm text-primary mt-2">📅 Início: {currentBook.startDate}</p>
              <p className="text-sm text-muted-foreground mt-1">👥 {currentBook.members} participantes</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4">📝 Resenhas</h3>
            <p className="text-muted-foreground">Análises e discussões sobre o livro.</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4">🎬 Vídeos</h3>
            <p className="text-muted-foreground">Conteúdos em vídeo sobre a obra.</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4">🔍 Análise Aprofundada</h3>
            <p className="text-muted-foreground">Estudo detalhado dos temas e personagens.</p>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4">👤 Prévia do Autor</h3>
            <p className="text-muted-foreground">Conheça Patrick Rothfuss e sua obra.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookClub;
