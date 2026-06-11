import { useState, useRef } from "react";
import {
  Users, MessageSquare, ThumbsUp, BookOpen, Search, ArrowLeft,
  Send, LogOut, Image, Smile, Share2, Bookmark, MoreHorizontal,
  Repeat2, Heart, X, Info
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose
} from "@/components/ui/dialog";

/* ───── Stickers ───── */
const STICKERS = [
  { id: "clap", emoji: "👏", label: "Aplausos" },
  { id: "fire", emoji: "🔥", label: "Fogo" },
  { id: "heart-eyes", emoji: "😍", label: "Amei" },
  { id: "mind-blown", emoji: "🤯", label: "Incrível" },
  { id: "thinking", emoji: "🤔", label: "Hmm" },
  { id: "laugh", emoji: "😂", label: "Haha" },
  { id: "cry", emoji: "😢", label: "Triste" },
  { id: "book", emoji: "📖", label: "Livro" },
  { id: "star", emoji: "⭐", label: "Estrela" },
  { id: "rocket", emoji: "🚀", label: "Foguete" },
  { id: "brain", emoji: "🧠", label: "Inteligente" },
  { id: "skull", emoji: "💀", label: "Morri" },
  { id: "100", emoji: "💯", label: "100%" },
  { id: "crown", emoji: "👑", label: "Rei" },
  { id: "wizard", emoji: "🧙", label: "Mago" },
  { id: "sword", emoji: "⚔️", label: "Batalha" },
];

/* ───── Types ───── */
interface Post {
  id: number;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
  liked: boolean;
  bookmarked: boolean;
  reposted: boolean;
  reposts: number;
  sticker?: string;
  imageUrl?: string;
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  sticker?: string;
}

interface BookCommunity {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  members: number;
  posts: Post[];
  isJoined: boolean;
  description: string;
}

/* ───── Data ───── */
const initialBookCommunities: BookCommunity[] = [
  {
    id: "harry-potter-1",
    title: "Harry Potter e a Pedra Filosofal",
    author: "J.K. Rowling",
    coverUrl: "https://m.media-amazon.com/images/I/81iqZ2HHD-L._AC_UF1000,1000_QL80_.jpg",
    members: 2341,
    isJoined: true,
    description: "Comunidade dedicada ao primeiro livro da saga que encantou o mundo. Discuta teorias, personagens e momentos inesquecíveis!",
    posts: [
      {
        id: 1, author: "Maria Silva", avatar: "MS",
        content: "Acabei de terminar o capítulo 3! A cena das cartas chegando é incrível. O que vocês acham que simboliza?",
        likes: 24, liked: false, bookmarked: false, reposted: false, reposts: 3,
        comments: [
          { id: 1, author: "João Santos", avatar: "JS", content: "Acho que simboliza que não dá pra fugir do destino!", timestamp: "1h" },
          { id: 2, author: "Ana Costa", avatar: "AC", content: "Concordo! Também mostra a persistência do mundo mágico.", timestamp: "30min" },
        ],
        timestamp: "2h",
      },
      {
        id: 2, author: "Pedro Costa", avatar: "PC",
        content: "Quem mais acha que os Dursley representam o conformismo da sociedade? 🤔",
        likes: 45, liked: false, bookmarked: false, reposted: false, reposts: 8,
        comments: [],
        timestamp: "5h",
      },
      {
        id: 3, author: "Lucas Almeida", avatar: "LA",
        content: "",
        sticker: "🧙",
        likes: 12, liked: false, bookmarked: false, reposted: false, reposts: 1,
        comments: [],
        timestamp: "6h",
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
    description: "Mitologia grega encontra o mundo moderno. Debata batalhas, profecias e a jornada de Percy!",
    posts: [
      {
        id: 1, author: "Lucas Almeida", avatar: "LA",
        content: "A forma como o autor mistura mitologia grega com o mundo moderno é genial!",
        likes: 32, liked: false, bookmarked: false, reposted: false, reposts: 5,
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
    description: "Capitu traiu ou não? O maior debate da literatura brasileira acontece aqui. Análises, teorias e paixão literária.",
    posts: [
      {
        id: 1, author: "Fernanda Rocha", avatar: "FR",
        content: "Capitu traiu ou não traiu? Esse debate nunca vai acabar 😅",
        likes: 67, liked: false, bookmarked: false, reposted: false, reposts: 15,
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
    description: "Reflexões filosóficas, citações inesquecíveis e a magia de ver o mundo com olhos de criança.",
    posts: [
      {
        id: 1, author: "Julia Ferreira", avatar: "JF",
        content: "\"O essencial é invisível aos olhos\" - essa frase mudou minha vida.",
        likes: 89, liked: false, bookmarked: false, reposted: false, reposts: 22,
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
    description: "Big Brother está te observando. Distopias, vigilância e controle social — discuta o clássico de Orwell.",
    posts: [],
  },
  {
    id: "orgulho-preconceito",
    title: "Orgulho e Preconceito",
    author: "Jane Austen",
    coverUrl: "https://m.media-amazon.com/images/I/91HHqVTAJQL._AC_UF1000,1000_QL80_.jpg",
    members: 1890,
    isJoined: false,
    description: "Romance, ironia e a sociedade inglesa do século XIX. Mr. Darcy lovers, uni-vos!",
    posts: [],
  },
  {
    id: "culpa-estrelas",
    title: "A Culpa é das Estrelas",
    author: "John Green",
    coverUrl: "https://m.media-amazon.com/images/I/71M+bMBKRpL._AC_UF1000,1000_QL80_.jpg",
    members: 2780,
    isJoined: false,
    description: "Amor, perda e infinitos dentro de infinitos. Uma comunidade para chorar e refletir juntos.",
    posts: [
      {
        id: 1, author: "Camila Torres", avatar: "CT",
        content: "\"Alguns infinitos são maiores que outros infinitos.\" John Green consegue destruir corações com uma frase.",
        likes: 54, liked: false, bookmarked: false, reposted: false, reposts: 12,
        comments: [],
        timestamp: "12h",
      },
    ],
  },
  {
    id: "hobbit",
    title: "O Hobbit",
    author: "J.R.R. Tolkien",
    coverUrl: "https://m.media-amazon.com/images/I/91b0C2YNSrL._AC_UF1000,1000_QL80_.jpg",
    members: 1950,
    isJoined: false,
    description: "A jornada de Bilbo Bolseiro. Aventura, dragões e a Terra-média aguardam seus comentários!",
    posts: [],
  },
  {
    id: "cem-anos-solidao",
    title: "Cem Anos de Solidão",
    author: "Gabriel García Márquez",
    coverUrl: "https://m.media-amazon.com/images/I/91bMJ6VmyrL._AC_UF1000,1000_QL80_.jpg",
    members: 1430,
    isJoined: false,
    description: "Realismo mágico em Macondo. Gerações, destinos e a solidão que atravessa o tempo.",
    posts: [],
  },
];

const GUIDE_KEY = "bookquest_community_guide_seen";

/* ───── Component ───── */
const Comunidade = () => {
  const [communities, setCommunities] = useState<BookCommunity[]>(initialBookCommunities);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>({});
  const [newPostContent, setNewPostContent] = useState("");
  const [showStickerPicker, setShowStickerPicker] = useState<number | "post" | null>(null);
  const [selectedPostSticker, setSelectedPostSticker] = useState<string | null>(null);
  const [commentStickers, setCommentStickers] = useState<{ [key: number]: string | null }>({});
  const [showGuide, setShowGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);

  const stickerRef = useRef<HTMLDivElement>(null);

  const selectedCommunity = communities.find(c => c.id === selectedCommunityId);

  const filteredCommunities = communities.filter((community) =>
    community.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ── Guide ── */
  const guideSteps = [
    {
      icon: "📚",
      title: "Bem-vindo à Comunidade!",
      text: "Este é um espaço dedicado a cada obra literária. Aqui, leitores se reúnem para discutir, debater e compartilhar suas experiências de leitura.",
    },
    {
      icon: "✍️",
      title: "Publique seus pensamentos",
      text: "Crie posts com análises, opiniões, memes ou qualquer conteúdo relacionado ao livro. Use stickers para se expressar de forma divertida!",
    },
    {
      icon: "💬",
      title: "Comente e interaja",
      text: "Responda posts de outros leitores, curta, reposte e salve os conteúdos que mais gostar. A comunidade é sua!",
    },
    {
      icon: "🤝",
      title: "Conecte-se",
      text: "Participe de comunidades dos livros que você ama. Quanto mais você interage, mais rica fica a experiência de todos!",
    },
  ];

  const openCommunityWithGuide = (id: string) => {
    setSelectedCommunityId(id);
    const seen = localStorage.getItem(GUIDE_KEY);
    if (!seen) {
      setShowGuide(true);
      setGuideStep(0);
    }
  };

  const closeGuide = () => {
    setShowGuide(false);
    localStorage.setItem(GUIDE_KEY, "true");
  };

  /* ── Actions ── */
  const handleLike = (postId: number) => {
    if (!selectedCommunityId) return;
    setCommunities(prev => prev.map(community => {
      if (community.id !== selectedCommunityId) return community;
      return {
        ...community,
        posts: community.posts.map(post => {
          if (post.id !== postId) return post;
          return { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 };
        }),
      };
    }));
  };

  const handleBookmark = (postId: number) => {
    if (!selectedCommunityId) return;
    setCommunities(prev => prev.map(community => {
      if (community.id !== selectedCommunityId) return community;
      return {
        ...community,
        posts: community.posts.map(post => {
          if (post.id !== postId) return post;
          return { ...post, bookmarked: !post.bookmarked };
        }),
      };
    }));
  };

  const handleRepost = (postId: number) => {
    if (!selectedCommunityId) return;
    setCommunities(prev => prev.map(community => {
      if (community.id !== selectedCommunityId) return community;
      return {
        ...community,
        posts: community.posts.map(post => {
          if (post.id !== postId) return post;
          return { ...post, reposted: !post.reposted, reposts: post.reposted ? post.reposts - 1 : post.reposts + 1 };
        }),
      };
    }));
  };

  const handleComment = (postId: number) => {
    const text = newComment[postId]?.trim();
    const sticker = commentStickers[postId];
    if (!text && !sticker) return;
    if (!selectedCommunityId) return;

    const newCommentObj: Comment = {
      id: Date.now(),
      author: "Você",
      avatar: "VC",
      content: text || "",
      timestamp: "agora",
      sticker: sticker || undefined,
    };

    setCommunities(prev => prev.map(community => {
      if (community.id !== selectedCommunityId) return community;
      return {
        ...community,
        posts: community.posts.map(post => {
          if (post.id !== postId) return post;
          return { ...post, comments: [...post.comments, newCommentObj] };
        }),
      };
    }));

    setNewComment({ ...newComment, [postId]: "" });
    setCommentStickers({ ...commentStickers, [postId]: null });
  };

  const handleNewPost = () => {
    if (!newPostContent.trim() && !selectedPostSticker) return;
    if (!selectedCommunityId) return;

    const newPost: Post = {
      id: Date.now(),
      author: "Você",
      avatar: "VC",
      content: newPostContent,
      likes: 0, liked: false, bookmarked: false, reposted: false, reposts: 0,
      comments: [],
      timestamp: "agora",
      sticker: selectedPostSticker || undefined,
    };

    setCommunities(prev => prev.map(community => {
      if (community.id !== selectedCommunityId) return community;
      return { ...community, posts: [newPost, ...community.posts] };
    }));

    setNewPostContent("");
    setSelectedPostSticker(null);
  };

  const handleJoinCommunity = () => {
    if (!selectedCommunityId) return;
    setCommunities(prev => prev.map(community => {
      if (community.id !== selectedCommunityId) return community;
      return { ...community, isJoined: true, members: community.members + 1 };
    }));
  };

  const handleLeaveCommunity = () => {
    if (!selectedCommunityId) return;
    setCommunities(prev => prev.map(community => {
      if (community.id !== selectedCommunityId) return community;
      return { ...community, isJoined: false, members: community.members - 1 };
    }));
    setSelectedCommunityId(null);
  };

  /* ── Sticker Picker ── */
  const StickerPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => (
    <div
      ref={stickerRef}
      className="absolute bottom-full mb-2 left-0 z-50 bg-card border border-border rounded-xl shadow-xl p-3 w-64 animate-fade-in"
    >
      <p className="text-xs font-semibold text-muted-foreground mb-2">Stickers</p>
      <div className="grid grid-cols-4 gap-1">
        {STICKERS.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.emoji)}
            className="flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-muted transition-colors"
            title={s.label}
          >
            <span className="text-2xl">{s.emoji}</span>
            <span className="text-[10px] text-muted-foreground">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  /* ───── Community Feed View ───── */
  if (selectedCommunity) {
    return (
      <Layout>
        {/* Guide Dialog */}
        <Dialog open={showGuide} onOpenChange={(open) => { if (!open) closeGuide(); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <span className="text-3xl">{guideSteps[guideStep].icon}</span>
                {guideSteps[guideStep].title}
              </DialogTitle>
              <DialogDescription className="text-sm pt-2 leading-relaxed">
                {guideSteps[guideStep].text}
              </DialogDescription>
            </DialogHeader>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-2 py-2">
              {guideSteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === guideStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={closeGuide}>
                Pular
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (guideStep < guideSteps.length - 1) {
                    setGuideStep(guideStep + 1);
                  } else {
                    closeGuide();
                  }
                }}
              >
                {guideStep < guideSteps.length - 1 ? "Próximo" : "Entendi!"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="py-6 max-w-2xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setSelectedCommunityId(null)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <BookCover
                src={selectedCommunity.coverUrl}
                alt={selectedCommunity.title}
                title={selectedCommunity.title}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
              />
              <div className="min-w-0">
                <h1 className="font-bold text-lg truncate">{selectedCommunity.title}</h1>
                <p className="text-xs text-muted-foreground">
                  {selectedCommunity.members.toLocaleString("pt-BR")} membros
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setShowGuide(true); setGuideStep(0); }}
                title="Como funciona"
              >
                <Info className="w-4 h-4" />
              </Button>
              {selectedCommunity.isJoined ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleLeaveCommunity}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair
                </Button>
              ) : (
                <Button variant="default" size="sm" onClick={handleJoinCommunity}>
                  Participar
                </Button>
              )}
            </div>
          </div>

          {/* Community Description Banner */}
          <div className="rounded-xl border border-border bg-card/50 p-4 mb-6">
            <p className="text-sm text-muted-foreground">{selectedCommunity.description}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {selectedCommunity.members.toLocaleString("pt-BR")} membros</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {selectedCommunity.posts.length} posts</span>
            </div>
          </div>

          {/* New Post Composer */}
          {selectedCommunity.isJoined && (
            <div className="rounded-xl border border-border bg-card p-4 mb-6">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                  VC
                </div>
                <div className="flex-1">
                  <Textarea
                    placeholder="O que você está pensando sobre o livro?"
                    className="border-0 bg-transparent resize-none p-0 focus-visible:ring-0 min-h-[60px] text-sm"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                  {selectedPostSticker && (
                    <div className="flex items-center gap-2 mt-2 bg-muted rounded-lg p-2 w-fit">
                      <span className="text-3xl">{selectedPostSticker}</span>
                      <button onClick={() => setSelectedPostSticker(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1 relative">
                      <button
                        onClick={() => setShowStickerPicker(showStickerPicker === "post" ? null : "post")}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Stickers"
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                      {showStickerPicker === "post" && (
                        <StickerPicker onSelect={(emoji) => { setSelectedPostSticker(emoji); setShowStickerPicker(null); }} />
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={handleNewPost}
                      disabled={!newPostContent.trim() && !selectedPostSticker}
                    >
                      Publicar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-0 divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
            {selectedCommunity.posts.length === 0 ? (
              <div className="text-center py-16 px-6">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-bold mb-1">Nenhuma publicação ainda</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCommunity.isJoined
                    ? "Seja o primeiro a compartilhar algo!"
                    : "Participe da comunidade para começar a postar."}
                </p>
              </div>
            ) : (
              selectedCommunity.posts.map((post) => (
                <div key={post.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-bold flex-shrink-0">
                      {post.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Post Header */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{post.author}</span>
                        <span className="text-xs text-muted-foreground">· {post.timestamp}</span>
                      </div>

                      {/* Post Content */}
                      {post.content && <p className="text-sm mb-2 whitespace-pre-wrap">{post.content}</p>}
                      {post.sticker && (
                        <div className="mb-2">
                          <span className="text-5xl">{post.sticker}</span>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex items-center justify-between max-w-xs mt-2">
                        <button
                          onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group"
                        >
                          <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <span className="text-xs">{post.comments.length}</span>
                        </button>

                        <button
                          onClick={() => handleRepost(post.id)}
                          className={`flex items-center gap-1.5 transition-colors group ${
                            post.reposted ? "text-accent" : "text-muted-foreground hover:text-accent"
                          }`}
                        >
                          <div className="p-1.5 rounded-full group-hover:bg-accent/10 transition-colors">
                            <Repeat2 className="w-4 h-4" />
                          </div>
                          <span className="text-xs">{post.reposts}</span>
                        </button>

                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1.5 transition-colors group ${
                            post.liked ? "text-destructive" : "text-muted-foreground hover:text-destructive"
                          }`}
                        >
                          <div className="p-1.5 rounded-full group-hover:bg-destructive/10 transition-colors">
                            <Heart className={`w-4 h-4 ${post.liked ? "fill-current" : ""}`} />
                          </div>
                          <span className="text-xs">{post.likes}</span>
                        </button>

                        <button
                          onClick={() => handleBookmark(post.id)}
                          className={`transition-colors group ${
                            post.bookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"
                          }`}
                        >
                          <div className="p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                            <Bookmark className={`w-4 h-4 ${post.bookmarked ? "fill-current" : ""}`} />
                          </div>
                        </button>

                        <button className="text-muted-foreground hover:text-foreground transition-colors group">
                          <div className="p-1.5 rounded-full group-hover:bg-muted transition-colors">
                            <Share2 className="w-4 h-4" />
                          </div>
                        </button>
                      </div>

                      {/* Comments Section */}
                      {showComments[post.id] && (
                        <div className="mt-3 pt-3 border-t border-border space-y-3">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2">
                              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                {comment.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="bg-muted/50 rounded-xl px-3 py-2">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="font-bold text-xs">{comment.author}</span>
                                    <span className="text-[10px] text-muted-foreground">{comment.timestamp}</span>
                                  </div>
                                  {comment.content && <p className="text-xs">{comment.content}</p>}
                                  {comment.sticker && <span className="text-2xl">{comment.sticker}</span>}
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Comment Input */}
                          {selectedCommunity.isJoined && (
                            <div className="flex gap-2 items-start">
                              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0">
                                VC
                              </div>
                              <div className="flex-1">
                                {commentStickers[post.id] && (
                                  <div className="flex items-center gap-2 mb-1 bg-muted rounded-lg p-1.5 w-fit">
                                    <span className="text-xl">{commentStickers[post.id]}</span>
                                    <button onClick={() => setCommentStickers({ ...commentStickers, [post.id]: null })} className="text-muted-foreground hover:text-foreground">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                                <div className="flex gap-1.5 items-center">
                                  <div className="relative flex-1 flex gap-1.5">
                                    <Input
                                      placeholder="Responder..."
                                      className="text-xs h-8"
                                      value={newComment[post.id] || ""}
                                      onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                                      onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                                    />
                                    <div className="relative">
                                      <button
                                        onClick={() => setShowStickerPicker(showStickerPicker === post.id ? null : post.id)}
                                        className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                      >
                                        <Smile className="w-4 h-4" />
                                      </button>
                                      {showStickerPicker === post.id && (
                                        <StickerPicker
                                          onSelect={(emoji) => {
                                            setCommentStickers({ ...commentStickers, [post.id]: emoji });
                                            setShowStickerPicker(null);
                                          }}
                                        />
                                      )}
                                    </div>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={() => handleComment(post.id)}
                                      disabled={!newComment[post.id]?.trim() && !commentStickers[post.id]}
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
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

  /* ───── Communities List View ───── */
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
        <div className="relative mb-8" data-tutorial="comunidade-search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar comunidade por título ou autor..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Communities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-tutorial="comunidade-grid">
          {filteredCommunities.map((community, index) => (
            <button
              key={community.id}
              onClick={() => openCommunityWithGuide(community.id)}
              className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all text-left animate-fade-in"
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              {/* Cover Banner */}
              <div className="h-36 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden relative">
                <BookCover
                  src={community.coverUrl}
                  alt={community.title}
                  title={community.title}
                  className="w-20 h-30 object-cover rounded shadow-lg"
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-base mb-0.5 line-clamp-1">{community.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">{community.author}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{community.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{community.members.toLocaleString("pt-BR")} membros</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{community.posts.length} posts</span>
                  </div>
                </div>

                {community.isJoined && (
                  <div className="mt-3 text-xs text-primary font-medium">
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
