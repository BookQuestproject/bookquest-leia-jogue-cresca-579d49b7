import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useProfile } from "@/hooks/useProfile";
import { useSocialChallenges } from "@/hooks/useSocialChallenges";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Swords, Send, Check, X, Trophy, Clock, User, Sparkles } from "lucide-react";

const Desafios = () => {
  const { user } = useAuth();
  const { isPremium } = useProfile();
  const { challenges, loading, createChallenge, respondChallenge, templates } = useSocialChallenges();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [sending, setSending] = useState(false);

  const pending = challenges.filter(c => c.status === "pending" && c.challenged_id === user?.id);
  const active = challenges.filter(c => c.status === "active");
  const completed = challenges.filter(c => c.status === "completed" || c.status === "declined");
  const sent = challenges.filter(c => c.status === "pending" && c.challenger_id === user?.id);

  const handleCreate = async () => {
    if (!targetEmail || !selectedTemplate) return;
    setSending(true);
    const ok = await createChallenge(targetEmail, selectedTemplate);
    setSending(false);
    if (ok) {
      setIsCreateOpen(false);
      setTargetEmail("");
      setSelectedTemplate("");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Sparkles className="h-4 w-4 text-green-400" />;
      case "completed": return <Trophy className="h-4 w-4 text-accent" />;
      case "pending": return <Clock className="h-4 w-4 text-blue-400" />;
      case "declined": return <X className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  const renderChallenge = (c: typeof challenges[0], showActions = false) => {
    const isChallenger = c.challenger_id === user?.id;
    const opponentName = isChallenger ? c.challenged_name : c.challenger_name;
    const myProgress = isChallenger ? c.challenger_progress : c.challenged_progress;
    const theirProgress = isChallenger ? c.challenged_progress : c.challenger_progress;
    const progressPct = Math.min((myProgress / c.goal_value) * 100, 100);

    return (
      <Card key={c.id} className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getStatusIcon(c.status)}
              <div>
                <h4 className="font-semibold text-sm text-foreground">{c.title}</h4>
                <p className="text-xs text-muted-foreground">{c.description}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-accent">+{c.xp_reward} ✦</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              vs {opponentName}
            </div>
          </div>

          {c.status === "active" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground">Você: {myProgress}/{c.goal_value}</span>
                <span className="text-muted-foreground">{opponentName}: {theirProgress}/{c.goal_value}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden bg-muted/60">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {c.status === "completed" && c.winner_id && (
            <p className="text-xs font-medium text-accent">
              🏆 {c.winner_id === user?.id ? "Você venceu!" : `${opponentName} venceu`}
            </p>
          )}

          {showActions && c.status === "pending" && c.challenged_id === user?.id && (
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={() => respondChallenge(c.id, true)} className="flex-1">
                <Check className="h-3.5 w-3.5 mr-1" />
                Aceitar
              </Button>
              <Button size="sm" variant="outline" onClick={() => respondChallenge(c.id, false)} className="flex-1">
                <X className="h-3.5 w-3.5 mr-1" />
                Recusar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout isPremium={isPremium}>
      <div className="space-y-6">
        <div className="flex items-center justify-between" data-tutorial="desafios-header">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Swords className="h-7 w-7 text-accent" />
              Desafios Sociais
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Desafie amigos e colegas de turma</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/80" data-tutorial="desafios-create">
            <Send className="h-4 w-4 mr-2" />
            Novo Desafio
          </Button>
        </div>

        {/* Pending invites */}
        {pending.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
              ⚔️ Desafios Recebidos ({pending.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pending.map(c => renderChallenge(c, true))}
            </div>
          </div>
        )}

        <Tabs defaultValue="active" className="w-full" data-tutorial="desafios-tabs">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="active">Ativos ({active.length})</TabsTrigger>
            <TabsTrigger value="sent">Enviados ({sent.length})</TabsTrigger>
            <TabsTrigger value="history">Histórico ({completed.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            {active.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="text-center py-10">
                  <Swords className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum desafio ativo</p>
                  <Button variant="outline" onClick={() => setIsCreateOpen(true)} className="mt-3">
                    Criar desafio
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {active.map(c => renderChallenge(c))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-4">
            {sent.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum desafio pendente</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sent.map(c => renderChallenge(c))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {completed.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum histórico ainda</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {completed.map(c => renderChallenge(c))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground flex items-center gap-2">
                <Swords className="h-5 w-5 text-accent" />
                Criar Desafio
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Email do oponente</label>
                <Input
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="amigo@email.com"
                  type="email"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Tipo de desafio</label>
                <div className="grid grid-cols-1 gap-2">
                  {templates.map(t => (
                    <button
                      key={t.type}
                      onClick={() => setSelectedTemplate(t.type)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                        selectedTemplate === t.type
                          ? "border-accent bg-accent/10"
                          : "border-border bg-muted/30 hover:bg-muted/50"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </div>
                      <span className="text-xs font-bold text-accent">+{t.xp} ✦</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!targetEmail || !selectedTemplate || sending}>
                {sending ? "Enviando..." : "Enviar Desafio"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Desafios;
