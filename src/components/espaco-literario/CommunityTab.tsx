// Re-exports the existing community logic as a tab
// This wraps the core community feed from the original Comunidade page

import { useState, useRef } from "react";
import {
  Users, MessageSquare, ThumbsUp, BookOpen, Search, ArrowLeft,
  Send, LogOut, Image, Smile, Share2, Bookmark, MoreHorizontal,
  Repeat2, Heart, X, Info
} from "lucide-react";
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
  cover: string;
  members: number;
  posts: Post[];
  isJoined: boolean;
  description?: string;
}

const StickerPicker = ({ onSelect }: { onSelect: (emoji: string) => void }) => (
  <div className="grid grid-cols-4 gap-2 p-2 bg-card border border-border rounded-lg shadow-lg w-48">
    {STICKERS.map(s => (
      <button
        key={s.id}
        onClick={() => onSelect(s.emoji)}
        className="text-2xl hover:bg-muted rounded-md p-1 transition"
        title={s.label}
      >
        {s.emoji}
      </button>
    ))}
  </div>
);

const initialBookCommunities: BookCommunity[] = [
  {
    id: "harry-potter",
    title: "Harry Potter e a Pedra Filosofal",
    author: "J.K. Rowling",
    cover: "/images/covers/harry-potter-1.jpg",
    members: 342,
    isJoined: true,
    description: "Comunidade dedicada ao primeiro livro da saga Harry Potter. Discuta teorias, personagens favoritos e momentos marcantes!",
    posts: [
      {
        id: 1,
        author: "MariaLeitora",
        avatar: "ML",
        content: "Acabei de terminar o capítulo do espelho de Ojesed. Que cena incrível! 😢",
        likes: 24,
        comments: [
          { id: 1, author: "PedroBooks", avatar: "PB", content: "Uma das melhores cenas do livro!", timestamp: "2h atrás" },
          { id: 2, author: "AnaWizard", avatar: "AW", content: "Chorei litros nessa parte 😭", timestamp: "1h atrás" }
        ],
        timestamp: "3h atrás",
        liked: false,
        bookmarked: false,
        reposted: false,
        reposts: 5
      },
      {
        id: 2,
        author: "LucasHP",
        avatar: "LH",
        content: "Teoria: Snape já sabia sobre a Pedra Filosofal desde o início. Alguém concorda?",
        likes: 18,
        comments: [],
        timestamp: "5h atrás",
        liked: true,
        bookmarked: true,
        reposted: false,
        reposts: 2
      }
    ]
  },
  {
    id: "pequeno-principe",
    title: "O Pequeno Príncipe",
    author: "Antoine de Saint-Exupéry",
    cover: "/images/covers/o-pequeno-principe.jpg",
    members: 256,
    isJoined: false,
    description: "Reflexões e discussões sobre O Pequeno Príncipe. Compartilhe suas interpretações!",
    posts: [
      {
        id: 3,
        author: "SofiaStars",
        avatar: "SS",
        content: "\"Tu te tornas eternamente responsável por aquilo que cativas.\" Essa frase mudou minha forma de ver relacionamentos.",
        likes: 45,
        comments: [
          { id: 3, author: "RafaelR", avatar: "RR", content: "Profundo demais! Saint-Exupéry era um gênio.", timestamp: "1h atrás" }
        ],
        timestamp: "1d atrás",
        liked: false,
        bookmarked: false,
        reposted: false,
        reposts: 12
      }
    ]
  },
  {
    id: "senhor-dos-aneis",
    title: "O Senhor dos Anéis",
    author: "J.R.R. Tolkien",
    cover: "/images/covers/senhor-dos-aneis.jpg",
    members: 189,
    isJoined: false,
    description: "Para os fãs de Tolkien. Discuta a Terra-média e todas as suas maravilhas!",
    posts: []
  }
];

const CommunityTab = () => {
  const [communities, setCommunities] = useState<BookCommunity[]>(initialBookCommunities);
  const [selectedCommunity, setSelectedCommunity] = useState<BookCommunity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [commentContent, setCommentContent] = useState<Record<number, string>>({});
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});
  const [showPostSticker, setShowPostSticker] = useState(false);
  const [showCommentSticker, setShowCommentSticker] = useState<number | null>(null);

  const handleLike = (postId: number) => {
    if (!selectedCommunity) return;
    setCommunities(prev => prev.map(c => {
      if (c.id !== selectedCommunity.id) return c;
      return {
        ...c,
        posts: c.posts.map(p =>
          p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
        )
      };
    }));
    setSelectedCommunity(prev => prev ? {
      ...prev,
      posts: prev.posts.map(p =>
        p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    } : null);
  };

  const handleBookmark = (postId: number) => {
    if (!selectedCommunity) return;
    setSelectedCommunity(prev => prev ? {
      ...prev,
      posts: prev.posts.map(p =>
        p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p
      )
    } : null);
  };

  const handleRepost = (postId: number) => {
    if (!selectedCommunity) return;
    setSelectedCommunity(prev => prev ? {
      ...prev,
      posts: prev.posts.map(p =>
        p.id === postId ? { ...p, reposted: !p.reposted, reposts: p.reposted ? p.reposts - 1 : p.reposts + 1 } : p
      )
    } : null);
  };

  const handleComment = (postId: number) => {
    const content = commentContent[postId]?.trim();
    if (!content || !selectedCommunity) return;
    const newComment: Comment = {
      id: Date.now(),
      author: "Você",
      avatar: "VC",
      content,
      timestamp: "agora"
    };
    setSelectedCommunity(prev => prev ? {
      ...prev,
      posts: prev.posts.map(p =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    } : null);
    setCommentContent(prev => ({ ...prev, [postId]: "" }));
  };

  const handleNewPost = () => {
    if (!newPostContent.trim() || !selectedCommunity) return;
    const newPost: Post = {
      id: Date.now(),
      author: "Você",
      avatar: "VC",
      content: newPostContent,
      likes: 0,
      comments: [],
      timestamp: "agora",
      liked: false,
      bookmarked: false,
      reposted: false,
      reposts: 0
    };
    setSelectedCommunity(prev => prev ? { ...prev, posts: [newPost, ...prev.posts] } : null);
    setNewPostContent("");
  };

  const handleJoinCommunity = (communityId: string) => {
    setCommunities(prev => prev.map(c =>
      c.id === communityId ? { ...c, isJoined: true, members: c.members + 1 } : c
    ));
    setSelectedCommunity(prev => prev?.id === communityId ? { ...prev, isJoined: true, members: prev.members + 1 } : prev);
  };

  const handleLeaveCommunity = (communityId: string) => {
    setCommunities(prev => prev.map(c =>
      c.id === communityId ? { ...c, isJoined: false, members: c.members - 1 } : c
    ));
    setSelectedCommunity(prev => prev?.id === communityId ? { ...prev, isJoined: false, members: prev.members - 1 } : prev);
  };

  const filteredCommunities = communities.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedCommunity) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedCommunity(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        {/* Community header */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card">
          <img src={selectedCommunity.cover} alt="" className="w-14 h-20 rounded-lg object-cover" />
          <div className="flex-1">
            <h3 className="font-bold text-foreground">{selectedCommunity.title}</h3>
            <p className="text-sm text-muted-foreground">{selectedCommunity.author}</p>
            <p className="text-xs text-muted-foreground mt-1">{selectedCommunity.members} membros</p>
          </div>
          {selectedCommunity.isJoined ? (
            <Button variant="outline" size="sm" onClick={() => handleLeaveCommunity(selectedCommunity.id)}>
              <LogOut className="w-3.5 h-3.5 mr-1" /> Sair
            </Button>
          ) : (
            <Button size="sm" onClick={() => handleJoinCommunity(selectedCommunity.id)}>Entrar</Button>
          )}
        </div>

        {selectedCommunity.description && (
          <p className="text-sm text-muted-foreground px-1">{selectedCommunity.description}</p>
        )}

        {/* New post composer */}
        {selectedCommunity.isJoined && (
          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
            <Textarea
              placeholder="Compartilhe sua opinião sobre o livro..."
              value={newPostContent}
              onChange={e => setNewPostContent(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex items-center justify-between">
              <div className="relative">
                <button
                  onClick={() => setShowPostSticker(!showPostSticker)}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <Smile className="w-5 h-5" />
                </button>
                {showPostSticker && (
                  <div className="absolute bottom-full left-0 mb-2 z-10">
                    <StickerPicker onSelect={emoji => {
                      setNewPostContent(prev => prev + emoji);
                      setShowPostSticker(false);
                    }} />
                  </div>
                )}
              </div>
              <Button size="sm" onClick={handleNewPost} disabled={!newPostContent.trim()}>
                <Send className="w-4 h-4 mr-1" /> Postar
              </Button>
            </div>
          </div>
        )}

        {/* Feed */}
        <div className="space-y-3">
          {selectedCommunity.posts.map(post => (
            <div key={post.id} className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {post.avatar}
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground">{post.author}</span>
                  <span className="text-xs text-muted-foreground ml-2">{post.timestamp}</span>
                </div>
              </div>
              <p className="text-sm text-foreground/90 mb-3">{post.content}</p>
              {post.sticker && <div className="text-3xl mb-2">{post.sticker}</div>}

              <div className="flex items-center gap-4 text-muted-foreground">
                <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1 text-xs hover:text-foreground ${post.liked ? "text-red-500" : ""}`}>
                  <Heart className={`w-4 h-4 ${post.liked ? "fill-red-500" : ""}`} /> {post.likes}
                </button>
                <button onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))} className="flex items-center gap-1 text-xs hover:text-foreground">
                  <MessageSquare className="w-4 h-4" /> {post.comments.length}
                </button>
                <button onClick={() => handleRepost(post.id)} className={`flex items-center gap-1 text-xs hover:text-foreground ${post.reposted ? "text-green-500" : ""}`}>
                  <Repeat2 className="w-4 h-4" /> {post.reposts}
                </button>
                <button onClick={() => handleBookmark(post.id)} className={`flex items-center gap-1 text-xs hover:text-foreground ml-auto ${post.bookmarked ? "text-accent" : ""}`}>
                  <Bookmark className={`w-4 h-4 ${post.bookmarked ? "fill-accent" : ""}`} />
                </button>
              </div>

              {/* Comments */}
              {showComments[post.id] && (
                <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                  {post.comments.map(comment => (
                    <div key={comment.id} className="flex gap-2 pl-2">
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">{comment.avatar}</div>
                      <div>
                        <span className="text-xs font-medium text-foreground">{comment.author}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">{comment.timestamp}</span>
                        <p className="text-xs text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <Input
                      placeholder="Comentar..."
                      value={commentContent[post.id] || ""}
                      onChange={e => setCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && handleComment(post.id)}
                      className="text-xs h-8"
                    />
                    <Button size="icon" className="h-8 w-8" onClick={() => handleComment(post.id)}>
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Input
        placeholder="Buscar comunidade por livro..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCommunities.map(community => (
          <button
            key={community.id}
            onClick={() => setSelectedCommunity(community)}
            className="text-left rounded-xl border border-border/50 bg-card p-4 hover:border-accent/30 hover:shadow-sm transition-all group"
          >
            <div className="flex gap-3">
              <img src={community.cover} alt="" className="w-12 h-[4.5rem] rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-accent transition-colors">{community.title}</h4>
                <p className="text-xs text-muted-foreground">{community.author}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {community.members}</span>
                  <span>{community.posts.length} posts</span>
                </div>
                {community.isJoined && (
                  <span className="inline-block mt-1.5 text-[10px] font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                    Participando
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CommunityTab;
