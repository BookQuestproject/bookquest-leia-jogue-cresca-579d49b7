import { useState } from "react";
import {
  Users, MessageSquare, ArrowLeft, Send, LogOut, Smile,
  Bookmark, Repeat2, Heart, Search
} from "lucide-react";
import { useCommunities, useCommunityDetail, type Community } from "@/hooks/useCommunities";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

/* ───── Community Detail View ───── */
const CommunityDetailView = ({ community, onBack, onMembershipChange }: {
  community: Community;
  onBack: () => void;
  onMembershipChange: () => void;
}) => {
  const { user } = useAuth();
  const {
    posts, loading, joinCommunity, leaveCommunity,
    createPost, addComment, toggleLike, toggleBookmark
  } = useCommunityDetail(community.id);

  const [newPostContent, setNewPostContent] = useState("");
  const [commentContent, setCommentContent] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [showPostSticker, setShowPostSticker] = useState(false);
  const [isMember, setIsMember] = useState(community.is_member);

  const handleJoin = async () => {
    const ok = await joinCommunity();
    if (ok) { setIsMember(true); onMembershipChange(); }
  };

  const handleLeave = async () => {
    const ok = await leaveCommunity();
    if (ok) { setIsMember(false); onMembershipChange(); }
  };

  const handleNewPost = async () => {
    if (!newPostContent.trim()) return;
    const ok = await createPost(newPostContent.trim());
    if (ok) setNewPostContent("");
  };

  const handleComment = async (postId: string) => {
    const content = commentContent[postId]?.trim();
    if (!content) return;
    const ok = await addComment(postId, content);
    if (ok) setCommentContent(prev => ({ ...prev, [postId]: "" }));
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Community header */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card">
        {community.cover && (
          <img src={community.cover} alt="" className="w-14 h-20 rounded-lg object-cover" />
        )}
        <div className="flex-1">
          <h3 className="font-bold text-foreground">{community.title}</h3>
          <p className="text-sm text-muted-foreground">{community.author}</p>
          <p className="text-xs text-muted-foreground mt-1">{community.member_count} {community.member_count === 1 ? 'membro' : 'membros'}</p>
        </div>
        {user && (
          isMember ? (
            <Button variant="outline" size="sm" onClick={handleLeave}>
              <LogOut className="w-3.5 h-3.5 mr-1" /> Sair
            </Button>
          ) : (
            <Button size="sm" onClick={handleJoin}>Entrar</Button>
          )
        )}
      </div>

      {community.description && (
        <p className="text-sm text-muted-foreground px-1">{community.description}</p>
      )}

      {/* New post composer */}
      {user && isMember && (
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

      {!user && (
        <div className="text-center py-4 text-sm text-muted-foreground rounded-xl border border-border/50 bg-card">
          Faça login para participar da comunidade
        </div>
      )}

      {user && !isMember && (
        <div className="text-center py-4 text-sm text-muted-foreground rounded-xl border border-border/50 bg-card">
          Entre na comunidade para publicar e comentar
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-xl bg-muted/50 animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm">Nenhum post ainda. Seja o primeiro!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.profile?.avatar_url || ""} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {(post.profile?.full_name || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-medium text-foreground">{post.profile?.username ? `@${post.profile.username}` : (post.profile?.full_name || "Leitor")}</span>
                  <span className="text-xs text-muted-foreground ml-2">{formatTime(post.created_at)}</span>
                </div>
              </div>
              <p className="text-sm text-foreground/90 mb-3">{post.content}</p>
              {post.sticker && <div className="text-3xl mb-2">{post.sticker}</div>}

              <div className="flex items-center gap-4 text-muted-foreground">
                <button
                  onClick={() => toggleLike(post.id, post.liked)}
                  className={`flex items-center gap-1 text-xs hover:text-foreground ${post.liked ? "text-red-500" : ""}`}
                >
                  <Heart className={`w-4 h-4 ${post.liked ? "fill-red-500" : ""}`} />
                  {post.likes_count + (post.liked ? 0 : 0)}
                </button>
                <button
                  onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                  className="flex items-center gap-1 text-xs hover:text-foreground"
                >
                  <MessageSquare className="w-4 h-4" /> {post.comments.length}
                </button>
                <button
                  onClick={() => toggleBookmark(post.id, post.bookmarked)}
                  className={`flex items-center gap-1 text-xs hover:text-foreground ml-auto ${post.bookmarked ? "text-accent" : ""}`}
                >
                  <Bookmark className={`w-4 h-4 ${post.bookmarked ? "fill-accent" : ""}`} />
                </button>
              </div>

              {/* Comments */}
              {showComments[post.id] && (
                <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                  {post.comments.map(comment => (
                    <div key={comment.id} className="flex gap-2 pl-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={comment.profile?.avatar_url || ""} />
                        <AvatarFallback className="text-[10px]">
                          {(comment.profile?.full_name || "U")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-xs font-medium text-foreground">{comment.profile?.username ? `@${comment.profile.username}` : (comment.profile?.full_name || "Leitor")}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">{formatTime(comment.created_at)}</span>
                        <p className="text-xs text-muted-foreground">{comment.content}</p>
                        {comment.sticker && <span className="text-lg">{comment.sticker}</span>}
                      </div>
                    </div>
                  ))}
                  {user && isMember && (
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
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ───── Main Community Tab ───── */
const CommunityTab = () => {
  const { communities, loading, refetch } = useCommunities();
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCommunities = communities.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedCommunity) {
    return (
      <CommunityDetailView
        community={selectedCommunity}
        onBack={() => { setSelectedCommunity(null); refetch(); }}
        onMembershipChange={refetch}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm" data-tutorial="comunidade-search">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar comunidade por livro ou autor..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : filteredCommunities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium">Nenhuma comunidade encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-tutorial="comunidade-grid">
          {filteredCommunities.map(community => (
            <button
              key={community.id}
              onClick={() => setSelectedCommunity(community)}
              className="text-left rounded-xl border border-border/50 bg-card p-4 hover:border-accent/30 hover:shadow-sm transition-all group"
            >
              <div className="flex gap-3">
                {community.cover && (
                  <img src={community.cover} alt="" className="w-12 h-[4.5rem] rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-accent transition-colors">
                    {community.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{community.author}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {community.member_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> {community.post_count}
                    </span>
                  </div>
                  {community.is_member && (
                    <span className="inline-block mt-1.5 text-[10px] font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                      Participando
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityTab;
