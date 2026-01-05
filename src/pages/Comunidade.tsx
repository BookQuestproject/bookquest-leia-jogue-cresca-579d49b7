import { useState } from "react";
import { Users, MessageSquare, ThumbsUp, BookOpen, Search, ArrowLeft, Send } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Post {
  id: number;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
  liked?: boolean;
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
}

interface BookCommunity {
  id: string;
  title: string;
  author: string;
  cover: string;
  members: number;
  posts: Post[];
}

const bookCommunities: BookCommunity[] = [
  {
    id: "harry-potter-1",
    title: "Harry Potter e a Pedra Filosofal",
    author: "J.K. Rowling",
    cover: "📘",
    members: 2341,
    posts: [
      {
        id: 1,
        author: "Maria Silva",
        avatar: "MS",
        content: "Acabei de terminar o capítulo 3! A cena das cartas chegando é incrível. O que vocês acham que simboliza?",
        likes: 24,
        comments: [
          { id: 1, author: "João Santos", avatar: "JS", content: "Acho que simboliza que não dá pra fugir do destino!", timestamp: "1h" },
          { id: 2, author: "Ana Costa", avatar: "AC", content: "Concordo! Também mostra a persistência do mundo mágico.", timestamp: "30min" },
        ],
        timestamp: "2h",
      },
      {
        id: 2,
        author: "Pedro Costa",
        avatar: "PC",
        content: "Quem mais acha que os Dursley representam o conformismo da sociedade?",
        likes: 45,
        comments: [],
        timestamp: "5h",
      },
    ],
  },
  {
    id: "percy-jackson",
    title: "Percy Jackson e o Ladrão de Raios",
    author: "Rick Riordan",
    cover: "⚡",
    members: 1856,
    posts: [
      {
        id: 1,
        author: "Lucas Almeida",
        avatar: "LA",
        content: "A forma como o autor mistura mitologia grega com o mundo moderno é genial!",
        likes: 32,
        comments: [
          { id: 1, author: "Carla Souza", avatar: "CS", content: "Sim! Faz a mitologia parecer muito mais acessível.", timestamp: "3h" },
        ],
        timestamp: "4h",
      },
    ],
  },
  {
    id: "dom-casmurro",
    title: "Dom Casmurro",
    author: "Machado de Assis",
    cover: "📕",
    members: 1234,
    posts: [
      {
        id: 1,
        author: "Fernanda Rocha",
        avatar: "FR",
        content: "Capitu traiu ou não traiu? Esse debate nunca vai acabar 😅",
        likes: 67,
        comments: [
          { id: 1, author: "Bruno Dias", avatar: "BD", content: "Acho que o mais interessante é que nunca saberemos!", timestamp: "6h" },
          { id: 2, author: "Amanda Costa", avatar: "AC", content: "Machado era um gênio por deixar essa ambiguidade.", timestamp: "5h" },
        ],
        timestamp: "8h",
      },
    ],
  },
  {
    id: "pequeno-principe",
    title: "O Pequeno Príncipe",
    author: "Antoine de Saint-Exupéry",
    cover: "🌹",
    members: 3456,
    posts: [
      {
        id: 1,
        author: "Julia Ferreira",
        avatar: "JF",
        content: "\"O essencial é invisível aos olhos\" - essa frase mudou minha vida.",
        likes: 89,
        comments: [],
        timestamp: "1d",
      },
    ],
  },
  {
    id: "1984",
    title: "1984",
    author: "George Orwell",
    cover: "👁️",
    members: 2100,
    posts: [],
  },
  {
    id: "orgulho-preconceito",
    title: "Orgulho e Preconceito",
    author: "Jane Austen",
    cover: "💕",
    members: 1890,
    posts: [],
  },
];

const Comunidade = () => {
  const [selectedCommunity, setSelectedCommunity] = useState<BookCommunity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});

  const filteredCommunities = bookCommunities.filter((community) =>
    community.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLike = (postId: number) => {
    // Would update in backend
    console.log("Liked post:", postId);
  };

  const handleComment = (postId: number) => {
    if (newComment[postId]?.trim()) {
      console.log("New comment on post:", postId, newComment[postId]);
      setNewComment({ ...newComment, [postId]: "" });
    }
  };

  if (selectedCommunity) {
    return (
      <Layout>
        <div className="py-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedCommunity(null)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar às comunidades
          </button>

          {/* Community Header */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                <span className="text-5xl">{selectedCommunity.cover}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{selectedCommunity.title}</h1>
                <p className="text-muted-foreground">{selectedCommunity.author}</p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{selectedCommunity.members.toLocaleString("pt-BR")} membros</span>
                </div>
              </div>
              <Button variant="hero">Participando</Button>
            </div>
          </div>

          {/* New Post */}
          <div className="glass-card rounded-2xl p-4 mb-6">
            <Textarea 
              placeholder="Compartilhe seus pensamentos sobre o livro..." 
              className="mb-3"
            />
            <div className="flex justify-end">
              <Button variant="hero" size="sm">Publicar</Button>
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {selectedCommunity.posts.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-2xl">
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Nenhuma publicação ainda</h3>
                <p className="text-muted-foreground">Seja o primeiro a compartilhar algo!</p>
              </div>
            ) : (
              selectedCommunity.posts.map((post) => (
                <div key={post.id} className="glass-card rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {post.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{post.author}</span>
                        <span className="text-sm text-muted-foreground">• {post.timestamp}</span>
                      </div>
                      <p className="text-foreground mb-4">{post.content}</p>
                      
                      <div className="flex items-center gap-6 mb-4">
                        <button 
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        <button 
                          onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm">{post.comments.length}</span>
                        </button>
                      </div>

                      {/* Comments Section */}
                      {showComments[post.id] && (
                        <div className="border-t border-border pt-4 space-y-4">
                          {/* Existing Comments */}
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                                {comment.avatar}
                              </div>
                              <div className="flex-1 bg-secondary rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-sm">{comment.author}</span>
                                  <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            </div>
                          ))}

                          {/* New Comment Input */}
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                              VC
                            </div>
                            <div className="flex-1 flex gap-2">
                              <Input
                                placeholder="Escreva um comentário..."
                                value={newComment[post.id] || ""}
                                onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                                onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                              />
                              <Button size="icon" variant="hero" onClick={() => handleComment(post.id)}>
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Comunidades Literárias
          </h1>
          <p className="text-muted-foreground">
            Cada livro tem sua própria comunidade. Discuta, compartilhe e conecte-se com outros leitores!
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar comunidade por título ou autor..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Communities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community, index) => (
            <button
              key={community.id}
              onClick={() => setSelectedCommunity(community)}
              className="glass-card rounded-2xl overflow-hidden card-hover animate-fade-in text-left"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Cover */}
              <div className="h-28 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-5xl">{community.cover}</span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-1">{community.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{community.author}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{community.members.toLocaleString("pt-BR")} membros</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span>{community.posts.length} posts</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredCommunities.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Nenhuma comunidade encontrada</h3>
            <p className="text-muted-foreground">
              Tente buscar por outro título ou autor
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Comunidade;
