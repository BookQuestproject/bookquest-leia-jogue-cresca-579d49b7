import { useState } from "react";
import { Users, MessageSquare, ThumbsUp, BookOpen, Search, Filter, Plus } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Post {
  id: number;
  author: string;
  avatar: string;
  content: string;
  book?: string;
  likes: number;
  comments: number;
  timestamp: string;
  category: string;
}

interface Group {
  id: number;
  name: string;
  members: number;
  icon: string;
}

const mockPosts: Post[] = [
  {
    id: 1,
    author: "Maria Silva",
    avatar: "MS",
    content: "Acabei de terminar 'O Morro dos Ventos Uivantes' e preciso discutir esse final! Alguém mais ficou arrasado? 😭",
    book: "O Morro dos Ventos Uivantes",
    likes: 24,
    comments: 12,
    timestamp: "2h",
    category: "Discussão",
  },
  {
    id: 2,
    author: "João Santos",
    avatar: "JS",
    content: "Recomendo muito 'Sapiens' para quem quer entender a história da humanidade de um jeito diferente. Mudou minha perspectiva sobre muitas coisas!",
    book: "Sapiens",
    likes: 45,
    comments: 8,
    timestamp: "5h",
    category: "Recomendação",
  },
  {
    id: 3,
    author: "Ana Oliveira",
    avatar: "AO",
    content: "Procurando parceiros para ler 'Harry Potter' juntos! Quem topa uma releitura?",
    likes: 67,
    comments: 23,
    timestamp: "8h",
    category: "Leitura Coletiva",
  },
  {
    id: 4,
    author: "Pedro Costa",
    avatar: "PC",
    content: "Dica: se vocês gostam de mistério, leiam 'E Não Sobrou Nenhum' da Agatha Christie. É impossível prever o final!",
    book: "E Não Sobrou Nenhum",
    likes: 32,
    comments: 15,
    timestamp: "1d",
    category: "Recomendação",
  },
];

const groups: Group[] = [
  { id: 1, name: "Amantes de Fantasia", members: 1234, icon: "🧙‍♂️" },
  { id: 2, name: "Clube do Mistério", members: 856, icon: "🔍" },
  { id: 3, name: "Romance Lovers", members: 2341, icon: "💕" },
  { id: 4, name: "Não-Ficção Brasil", members: 567, icon: "📚" },
  { id: 5, name: "Aventureiros Literários", members: 789, icon: "⚔️" },
];

const categories = ["Todos", "Discussão", "Recomendação", "Leitura Coletiva", "Dúvidas"];

const Comunidade = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = mockPosts.filter((post) => {
    const matchesCategory = selectedCategory === "Todos" || post.category === selectedCategory;
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Comunidade
            </h1>
            <p className="text-muted-foreground">
              Conecte-se com outros leitores, compartilhe recomendações e discuta seus livros favoritos
            </p>
          </div>
          <Button variant="hero">
            <Plus className="w-5 h-5" />
            Nova publicação
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar publicações..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="glass-card rounded-2xl p-6 card-hover">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {post.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{post.author}</span>
                        <span className="text-sm text-muted-foreground">• {post.timestamp}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {post.category}
                        </span>
                      </div>
                      <p className="text-foreground mb-3">{post.content}</p>
                      {post.book && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm mb-4">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span>{post.book}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">{post.comments}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Groups */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Grupos por Gênero
              </h3>
              <div className="space-y-3">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors text-left"
                  >
                    <span className="text-2xl">{group.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{group.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {group.members.toLocaleString("pt-BR")} membros
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Ver todos os grupos
              </Button>
            </div>

            {/* Stats */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Estatísticas da Comunidade</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-secondary">
                  <p className="text-2xl font-bold text-primary">5.2K</p>
                  <p className="text-sm text-muted-foreground">Membros</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary">
                  <p className="text-2xl font-bold text-warning">12K</p>
                  <p className="text-sm text-muted-foreground">Publicações</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary">
                  <p className="text-2xl font-bold text-accent">847</p>
                  <p className="text-sm text-muted-foreground">Online agora</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-secondary">
                  <p className="text-2xl font-bold text-legendary">32</p>
                  <p className="text-sm text-muted-foreground">Grupos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Comunidade;
