import { Crown, Lock, MessageSquare, Calendar, Users, BookOpen, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

interface BookClubBook {
  id: number;
  title: string;
  author: string;
  cover: string;
  month: string;
  members: number;
  discussionCount: number;
  progress: number;
}

const currentBook: BookClubBook = {
  id: 1,
  title: "O Nome do Vento",
  author: "Patrick Rothfuss",
  cover: "📕",
  month: "Janeiro 2025",
  members: 234,
  discussionCount: 45,
  progress: 35,
};

const previousBooks: BookClubBook[] = [
  { id: 2, title: "Duna", author: "Frank Herbert", cover: "🏜️", month: "Dezembro 2024", members: 198, discussionCount: 67, progress: 100 },
  { id: 3, title: "A Guerra dos Tronos", author: "George R.R. Martin", cover: "⚔️", month: "Novembro 2024", members: 256, discussionCount: 89, progress: 100 },
];

const BookClub = () => {
  const isPremium = false; // Would come from user state

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
              Participe de leituras coletivas mensais com discussões guiadas e encontros virtuais. 
              Uma experiência exclusiva para assinantes Premium.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-secondary">
                <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-bold">Leitura Guiada</p>
                <p className="text-xs text-muted-foreground">Cronograma semanal</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary">
                <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-bold">Discussões</p>
                <p className="text-xs text-muted-foreground">Debates exclusivos</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-bold">Comunidade</p>
                <p className="text-xs text-muted-foreground">Leitores engajados</p>
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
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-bold mb-4">
            <Crown className="w-4 h-4" />
            Premium
          </div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            Book Club
          </h1>
          <p className="text-muted-foreground">
            Leitura coletiva mensal com discussões guiadas
          </p>
        </div>

        {/* Current Book */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Livro do Mês
          </h2>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-32 h-44 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                <span className="text-6xl">{currentBook.cover}</span>
              </div>
              <div className="flex-1">
                <span className="text-sm text-accent font-bold">{currentBook.month}</span>
                <h3 className="text-2xl font-bold mt-1">{currentBook.title}</h3>
                <p className="text-muted-foreground">{currentBook.author}</p>
                
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{currentBook.members} participantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{currentBook.discussionCount} discussões</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progresso coletivo</span>
                    <span className="font-bold">{currentBook.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${currentBook.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="hero" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Continuar Leitura
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Ver Discussões
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Previous Books */}
        <section>
          <h2 className="text-xl font-bold mb-4">Livros Anteriores</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {previousBooks.map((book, index) => (
              <div 
                key={book.id} 
                className="glass-card rounded-xl p-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-4">
                  <div className="w-16 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                    <span className="text-3xl">{book.cover}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">{book.month}</span>
                    <h3 className="font-bold">{book.title}</h3>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="text-sm">{book.discussionCount} discussões</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default BookClub;
