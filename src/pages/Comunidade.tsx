import { useState } from "react";
import { Users, MessageSquare, ThumbsUp, BookOpen, Search, ArrowLeft, Send, LogOut } from "lucide-react";
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
  liked: boolean;
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
  coverUrl: string;
  members: number;
  posts: Post[];
  isJoined: boolean;
}

const initialBookCommunities: BookCommunity[] = [
  {
    id: "harry-potter-1",
    title: "Harry Potter e a Pedra Filosofal",
    author: "J.K. Rowling",
    coverUrl: "https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_UF1000,1000_QL80_.jpg",
    members: 2341,
    isJoined: true,
    posts: [
      {
        id: 1,
        author: "Maria Silva",
        avatar: "MS",
        content: "Acabei de terminar o capítulo 3! A cena das cartas chegando é incrível. O que vocês acham que simboliza?",
        likes: 24,
        liked: false,
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
        liked: false,
        comments: [],
        timestamp: "5h",
      },
    ],
  },
  {
    id: "percy-jackson",
    title: "Percy Jackson e o Ladrão de Raios",
    author: "Rick Riordan",
    coverUrl: "https://m.media-amazon.com/images/I/91GN7qkugiL._AC_UF1000,1000_QL80_.jpg",
    members: 1856,
    isJoined: true,
    posts: [
      {
        id: 1,
        author: "Lucas Almeida",
        avatar: "LA",
        content: "A forma como o autor mistura mitologia grega com o mundo moderno é genial!",
        likes: 32,
        liked: false,
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
    coverUrl: "https://m.media-amazon.com/images/I/81F0Ob-qe8L._AC_UF1000,1000_QL80_.jpg",
    members: 1234,
    isJoined: false,
    posts: [
      {
        id: 1,
        author: "Fernanda Rocha",
        avatar: "FR",
        content: "Capitu traiu ou não traiu? Esse debate nunca vai acabar 😅",
        likes: 67,
        liked: false,
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
    coverUrl: "https://m.media-amazon.com/images/I/71OZY035QKL._AC_UF1000,1000_QL80_.jpg",
    members: 3456,
    isJoined: false,
    posts: [
      {
        id: 1,
        author: "Julia Ferreira",
        avatar: "JF",
        content: "\"O essencial é invisível aos olhos\" - essa frase mudou minha vida.",
        likes: 89,
        liked: false,
        comments: [],
        timestamp: "1d",
      },
    ],
  },
  {
    id: "1984",
    title: "1984",
    author: "George Orwell",
    coverUrl: "https://m.media-amazon.com/images/I/819js3EICwL._AC_UF1000,1000_QL80_.jpg",
    members: 2100,
    isJoined: false,
    posts: [],
  },
  {
    id: "orgulho-preconceito",
    title: "Orgulho e Preconceito",
    author: "Jane Austen",
    coverUrl: "https://m.media-amazon.com/images/I/91HHqVTAJQL._AC_UF1000,1000_QL80_.jpg",
    members: 1890,
    isJoined: false,
    posts: [],
  },
];

const Comunidade = () => {
  const [communities, setCommunities] = useState<BookCommunity[]>(initialBookCommunities);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [newPostContent, setNewPostContent] = useState("");

  const selectedCommunity = communities.find(c => c.id === selectedCommunityId);

  const filteredCommunities = communities.filter((community) =>
    community.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLike = (postId: number) => {
    if (!selectedCommunityId) return;
    
    setCommunities(prev => prev.map(community => {
      if (community.id !== selectedCommunityId) return community;
      
      return {
        ...community,
        posts: community.posts.map(post => {
          if (post.id !== postId) return post;
          return {
            ...post,
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1,
          };
        }),
      };
    }));
  };

  const handleComment = (postId: number) => {
    if (!newComment[postId]?.trim() || !selectedCommunityId) return;
    
    const newCommentObj: Comment = {
      id: Date.now(),
      author: "Você",
      avatar: "VC",
      content: newComment[postId],
      timestamp: "agora",
    };

    setCommunities(prev => prev.map(community => {
      if (community.id !== selectedCommunityId) return community;
      
      return {
        ...community,
        posts: community.posts.map(post => {
          if (post.id !== postId) return post;
          return {
            ...post,
            comments: [...post.comments, newCommentObj],
          };
        }),
      };
    }));

    setNewComment({ ...newComment, [postId]: "" });
  };

  const handleNewPost = () => {
    if (!newPostContent.trim() || !selectedCommunityId) return;

    const newPost: Post = {
      id: Date.now(),
      author: "Você",
      avatar: "VC",
      content: newPostContent,
      likes: 0,
      liked: false,
      comments: [],
      timestamp: "agora",
    };

    setCommunities(prev => prev.map(community => {
      if (community.id !== selectedCommunityId) return community;
      return {
        ...community,
        posts: [newPost, ...community.posts],
      };
    }));

    setNewPostContent("");
  };

  const handleJoinCommunity = () => {
    if (!selectedCommunityId) return;
    
    setCommunities(prev => prev.map(community => {
      if (community.id !== selectedCommunityId) return community;
      return {
        ...community,
        isJoined: true,
        members: community.members + 1,
      };
    }));
  };

  const handleLeaveCommunity = () => {
    if (!selectedCommunityId) return;
    
    setCommunities(prev => prev.map(community => {
      if (community.id !== selectedCommunityId) return community;
      return {
        ...community,
        isJoined: false,
        members: community.members - 1,
      };
    }));
    
    setSelectedCommunityId(null);
  };

  if (selectedCommunity) {
    return (
      <Layout>
        <div className="py-8">
          {/* Back Button */}
          <button
            onClick={() => setSelectedCommunityId(null)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar às comunidades
          </button>

          {/* Community Header */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                <img 
                  src={selectedCommunity.coverUrl} 
                  alt={selectedCommunity.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=280&fit=crop";
                  }}
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{selectedCommunity.title}</h1>
                <p className="text-muted-foreground">{selectedCommunity.author}</p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Users className="w-4 h-4 text-secondary" />
                  <span>{selectedCommunity.members.toLocaleString("pt-BR")} membros</span>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedCommunity.isJoined ? (
                  <Button 
                    variant="outline" 
                    className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLeaveCommunity}
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </Button>
                ) : (
                  <Button variant="hero" onClick={handleJoinCommunity}>
                    Participar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* New Post - Only show if joined */}
          {selectedCommunity.isJoined && (
            <div className="glass-card rounded-2xl p-4 mb-6">
              <Textarea 
                placeholder="Compartilhe seus pensamentos sobre o livro..." 
                className="mb-3"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              <div className="flex justify-end">
                <Button 
                  variant="hero" 
                  size="sm" 
                  onClick={handleNewPost}
                  disabled={!newPostContent.trim()}
                >
                  Publicar
                </Button>
              </div>
            </div>
          )}

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
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold">
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
                          className={`flex items-center gap-2 transition-colors ${
                            post.liked 
                              ? "text-secondary" 
                              : "text-muted-foreground hover:text-secondary"
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${post.liked ? "fill-current" : ""}`} />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        <button 
                          onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                          className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors"
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
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                                {comment.avatar}
                              </div>
                              <div className="flex-1 bg-muted/50 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-sm">{comment.author}</span>
                                  <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            </div>
                          ))}

                          {/* New Comment Input - Only show if joined */}
                          {selectedCommunity.isJoined && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-secondary-foreground">
                                VC
                              </div>
                              <div className="flex-1 flex gap-2">
                                <Input
                                  placeholder="Escreva um comentário..."
                                  value={newComment[post.id] || ""}
                                  onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                                  onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                                />
                                <Button 
                                  size="icon" 
                                  variant="hero" 
                                  onClick={() => handleComment(post.id)}
                                  disabled={!newComment[post.id]?.trim()}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
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
        <div className="mb-8 animate-fade-in" data-tutorial="comunidade-header">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-secondary" />
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
              onClick={() => setSelectedCommunityId(community.id)}
              className="glass-card rounded-2xl overflow-hidden card-hover animate-fade-in text-left"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Cover */}
              <div className="h-40 bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                <img 
                  src={community.coverUrl} 
                  alt={community.title}
                  className="w-24 h-36 object-cover rounded shadow-lg transform hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=280&fit=crop";
                  }}
                />
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
                
                {community.isJoined && (
                  <div className="mt-3 text-xs text-secondary font-medium">
                    ✓ Participando
                  </div>
                )}
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
