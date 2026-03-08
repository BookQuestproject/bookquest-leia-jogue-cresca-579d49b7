import { useState } from "react";
import {
  Users, BookOpen, Plus, ArrowLeft, Send, LogIn, Crown, MessageSquare, ChevronRight
} from "lucide-react";
import { useBookClubs, useClubDetail, type BookClub } from "@/hooks/useBookClubs";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { bookTrails } from "@/pages/Trilhas";
import { Link } from "react-router-dom";

/* ───── Club Detail View ───── */
const ClubDetailView = ({ club, onBack }: { club: BookClub; onBack: () => void }) => {
  const { user } = useAuth();
  const { discussions, members, loading, postDiscussion } = useClubDetail(club.id);
  const { joinClub, leaveClub } = useBookClubs();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    const ok = await postDiscussion(newMessage.trim());
    if (ok) setNewMessage("");
    setSending(false);
  };

  const bookData = bookTrails.find(b => b.id === club.book_id);

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar aos clubes
      </button>

      {/* Club Header */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="flex gap-4">
          {(club.book_cover || bookData?.cover) && (
            <img src={club.book_cover || bookData?.cover} alt={club.book_title} className="w-16 h-24 rounded-lg object-cover flex-shrink-0" />
          )}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">{club.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">📖 {club.book_title}</p>
            {club.description && <p className="text-sm text-muted-foreground/80 mt-2">{club.description}</p>}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {members.length} leitores</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Progresso médio: Cap. {club.avg_chapter || 0}</span>
            </div>
          </div>
        </div>

        {user && (
          <div className="mt-4">
            {club.is_member ? (
              <Button variant="outline" size="sm" onClick={() => leaveClub(club.id)}>Sair do clube</Button>
            ) : (
              <Button size="sm" onClick={() => joinClub(club.id)} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Entrar no clube
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Members */}
      <div className="rounded-xl border border-border/50 bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Participantes ({members.length})</h3>
        <div className="flex flex-wrap gap-2">
          {members.slice(0, 20).map(m => (
            <div key={m.user_id} className="flex items-center gap-1.5 bg-muted/50 rounded-full pl-1 pr-2.5 py-1">
              <Avatar className="w-5 h-5">
                <AvatarImage src={m.profile?.avatar_url || ""} />
                <AvatarFallback className="text-[10px]">{(m.profile?.full_name || "U")[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-foreground">{m.profile?.full_name || "Leitor"}</span>
              <span className="text-[10px] text-muted-foreground">Cap. {m.current_chapter}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Discussions */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="p-4 border-b border-border/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Discussão
          </h3>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-border/20">
          {discussions.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma mensagem ainda. Comece a discussão!
            </div>
          ) : (
            discussions.map(d => (
              <div key={d.id} className="p-3 flex gap-2.5">
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarImage src={d.profile?.avatar_url || ""} />
                  <AvatarFallback className="text-[10px]">{(d.profile?.full_name || "U")[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">{d.profile?.full_name || "Leitor"}</span>
                    {d.chapter_ref && <span className="text-[10px] bg-accent/10 text-accent px-1.5 rounded">Cap. {d.chapter_ref}</span>}
                    <span className="text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{d.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Post input */}
        {user && club.is_member && (
          <div className="p-3 border-t border-border/30 flex gap-2">
            <Input
              placeholder="Escreva sobre o livro..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="text-sm"
            />
            <Button size="icon" onClick={handleSend} disabled={!newMessage.trim() || sending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}

        {user && !club.is_member && (
          <div className="p-4 text-center text-sm text-muted-foreground border-t border-border/30">
            Entre no clube para participar da discussão
          </div>
        )}
      </div>
    </div>
  );
};

/* ───── Clubs Tab ───── */
const ClubsTab = () => {
  const { user } = useAuth();
  const { isPremium, isAdmin } = useProfile();
  const { clubs, loading, createClub } = useBookClubs();
  const [selectedClub, setSelectedClub] = useState<BookClub | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Create form state
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formBookId, setFormBookId] = useState("");
  const [creating, setCreating] = useState(false);

  const canCreate = isPremium || isAdmin;

  const handleCreate = async () => {
    if (!formName || !formBookId) return;
    setCreating(true);
    const book = bookTrails.find(b => b.id === formBookId);
    const success = await createClub({
      name: formName,
      description: formDesc,
      book_id: formBookId,
      book_title: book?.title || formBookId,
      book_cover: book?.cover,
    });
    if (success) {
      setShowCreate(false);
      setFormName("");
      setFormDesc("");
      setFormBookId("");
    }
    setCreating(false);
  };

  const filteredClubs = clubs.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.book_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedClub) {
    return <ClubDetailView club={selectedClub} onBack={() => setSelectedClub(null)} />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Input
          placeholder="Buscar clubes..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        {user && canCreate ? (
          <Button onClick={() => setShowCreate(true)} className="gap-1.5" size="sm">
            <Plus className="w-4 h-4" /> Criar clube
          </Button>
        ) : user && !canCreate ? (
          <Link to="/premium">
            <Button variant="outline" size="sm" className="gap-1.5 text-accent border-accent/30">
              <Crown className="w-4 h-4" /> Premium para criar clubes
            </Button>
          </Link>
        ) : null}
      </div>

      {/* Clubs grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium">Nenhum clube encontrado</p>
          <p className="text-sm mt-1">Crie o primeiro clube de leitura!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClubs.map(club => {
            const bookData = bookTrails.find(b => b.id === club.book_id);
            return (
              <button
                key={club.id}
                onClick={() => setSelectedClub(club)}
                className="text-left rounded-xl border border-border/50 bg-card p-4 hover:border-accent/30 hover:shadow-sm transition-all group"
              >
                <div className="flex gap-3">
                  {(club.book_cover || bookData?.cover) && (
                    <img src={club.book_cover || bookData?.cover} alt="" className="w-12 h-[4.5rem] rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-accent transition-colors">
                      {club.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">📖 {club.book_title}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {club.member_count}</span>
                      <span>Cap. {club.avg_chapter || 0}</span>
                    </div>
                    {club.is_member && (
                      <span className="inline-block mt-1.5 text-[10px] font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                        Participando
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 self-center group-hover:text-accent transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Clube de Leitura</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-foreground">Nome do clube</label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ex: Leitura de Fantasia" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Livro</label>
              <select
                value={formBookId}
                onChange={e => setFormBookId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                {bookTrails.map(b => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Descrição (opcional)</label>
              <Textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Sobre o que é este clube?" className="mt-1" />
            </div>
            <Button onClick={handleCreate} disabled={!formName || !formBookId || creating} className="w-full">
              {creating ? "Criando..." : "Criar clube"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClubsTab;
