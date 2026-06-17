import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, User, Bell, Globe, Shield, LogOut, ChevronRight, BookOpen, Users, HelpCircle, Volume2, Sparkles, RotateCcw } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTutorial } from "@/contexts/TutorialContext";
import { useProfile } from "@/hooks/useProfile";
import { isSoundEnabled, setSoundEnabled } from "@/hooks/useSoundEffects";


const Configuracoes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { startTutorial, isCompleted: tutorialCompleted } = useTutorial();
  const { profile } = useProfile();
  
  // Estados das configurações
  const [notifications, setNotifications] = useState({
    readingReminder: true,
    newMissions: true,
    community: false,
  });
  const [soundOn, setSoundOnState] = useState(isSoundEnabled());
  
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showInCommunity: true,
  });
  const [readingPreferences, setReadingPreferences] = useState({
    dailyGoal: 30, // minutos
    preferredGenres: ["Fantasia", "Romance"],
  });

  // Atualizar notificações
  const updateNotification = (key: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Notificações atualizadas",
      description: `${key === "readingReminder" ? "Lembrete de leitura" : key === "newMissions" ? "Novas missões" : "Comunidade"} ${value ? "ativado" : "desativado"}.`,
    });
  };

  // Atualizar privacidade
  const updatePrivacy = (key: keyof typeof privacy, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Privacidade atualizada",
      description: "Suas configurações foram salvas.",
    });
  };

  return (
    <Layout>
      <div className="py-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in" data-tutorial="config-header">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Personalize sua experiência no BookQuest
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Account */}
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Conta
              </h2>
            </div>
            <div className="divide-y divide-border">
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors">
                <div>
                  <p className="font-medium">Nome de exibição</p>
                  <p className="text-sm text-muted-foreground">Você</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors">
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">usuario@email.com</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors">
                <div>
                  <p className="font-medium">Alterar senha</p>
                  <p className="text-sm text-muted-foreground">••••••••</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notificações
              </h2>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Lembrete de leitura</p>
                  <p className="text-sm text-muted-foreground">Receba lembretes diários para ler</p>
                </div>
                <Switch 
                  checked={notifications.readingReminder}
                  onCheckedChange={(checked) => updateNotification("readingReminder", checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Novas missões</p>
                  <p className="text-sm text-muted-foreground">Aviso de novas missões disponíveis</p>
                </div>
                <Switch 
                  checked={notifications.newMissions}
                  onCheckedChange={(checked) => updateNotification("newMissions", checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Comunidade</p>
                  <p className="text-sm text-muted-foreground">Respostas e menções nas comunidades</p>
                </div>
                <Switch 
                  checked={notifications.community}
                  onCheckedChange={(checked) => updateNotification("community", checked)}
                />
              </div>
            </div>
          </section>

          {/* Reading Preferences */}
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Preferências de Leitura
              </h2>
            </div>
            <div className="divide-y divide-border">
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors">
                <div>
                  <p className="font-medium">Meta diária de leitura</p>
                  <p className="text-sm text-muted-foreground">{readingPreferences.dailyGoal} minutos por dia</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors">
                <div>
                  <p className="font-medium">Gêneros preferidos</p>
                  <p className="text-sm text-muted-foreground">{readingPreferences.preferredGenres.join(", ")}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </section>

          {/* Community Preferences */}
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Preferências de Comunidade
              </h2>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Receber notificações de comunidades</p>
                  <p className="text-sm text-muted-foreground">Novos posts nas comunidades que participa</p>
                </div>
                <Switch 
                  checked={notifications.community}
                  onCheckedChange={(checked) => updateNotification("community", checked)}
                />
              </div>
            </div>
          </section>

          {/* Language */}
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Idioma
              </h2>
            </div>
            <div className="p-4">
              <button className="w-full flex items-center justify-between hover:bg-muted p-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇧🇷</span>
                  <span className="font-medium">Português (Brasil)</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </section>

          {/* Privacy */}
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacidade
              </h2>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Perfil público</p>
                  <p className="text-sm text-muted-foreground">Outros podem ver seu ranking e estatísticas</p>
                </div>
                <Switch 
                  checked={privacy.publicProfile}
                  onCheckedChange={(checked) => updatePrivacy("publicProfile", checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Mostrar na comunidade</p>
                  <p className="text-sm text-muted-foreground">Aparecer em listas públicas e ranking</p>
                </div>
                <Switch 
                  checked={privacy.showInCommunity}
                  onCheckedChange={(checked) => updatePrivacy("showInCommunity", checked)}
                />
              </div>
            </div>
          </section>

          {/* Sons */}
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-primary" />
                Sons
              </h2>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Efeitos sonoros</p>
                  <p className="text-sm text-muted-foreground">Sons ao clicar em botões e completar ações</p>
                </div>
                <Switch 
                  checked={soundOn}
                  onCheckedChange={(checked) => {
                    setSoundOnState(checked);
                    setSoundEnabled(checked);
                    toast({ title: checked ? "Sons ativados" : "Sons desativados" });
                  }}
                />
              </div>
            </div>
          </section>

          {/* Quiz Literário — histórico e refazer */}
          {(() => {
            const lp = (profile?.literary_profile ?? null) as any;
            const history: any[] = Array.isArray(lp?.history) ? [...lp.history] : [];
            // Fallback: if no history but the user has a literary profile, treat current snapshot as one entry
            if (history.length === 0 && lp && (lp.genre || lp.recommendations)) {
              history.push({
                genre: lp.genre,
                genreInfo: lp.genreInfo,
                level: lp.level,
                timePerDay: lp.timePerDay,
                ageRange: lp.ageRange,
                recommendations: lp.recommendations,
                takenAt: lp.completedAt,
                skipped: !!lp.skipped,
              });
            }
            const ordered = [...history].reverse(); // newest first
            const fmtDate = (iso?: string) => {
              if (!iso) return "—";
              try { return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }); }
              catch { return iso; }
            };
            return (
              <section className="glass-card rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between gap-3">
                  <h2 className="font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Quiz Literário
                  </h2>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => navigate("/quiz-literario?retake=1")}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Refazer quiz
                  </Button>
                </div>
                <div className="p-4">
                  {ordered.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Você ainda não tem histórico de recomendações. Faça o quiz para descobrir livros sob medida.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        {ordered.length} {ordered.length === 1 ? "tentativa registrada" : "tentativas registradas"} · você pode refazer o quiz quantas vezes quiser.
                      </p>
                      <ul className="space-y-3">
                        {ordered.map((h, idx) => {
                          const recs: any[] = Array.isArray(h?.recommendations) ? h.recommendations : [];
                          return (
                            <li key={idx} className="rounded-xl border border-border bg-muted/30 p-4">
                              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold uppercase tracking-wide">
                                    {h?.skipped ? "Pulado" : (h?.genre || "Resultado")}
                                  </span>
                                  {h?.level && (
                                    <span className="text-[11px] text-muted-foreground capitalize">Nível: {h.level}</span>
                                  )}
                                  {h?.timePerDay && (
                                    <span className="text-[11px] text-muted-foreground">· {h.timePerDay} min/dia</span>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">{fmtDate(h?.takenAt)}</span>
                              </div>
                              {h?.genreInfo?.description && (
                                <p className="text-sm text-foreground/80 mb-2">{h.genreInfo.description}</p>
                              )}
                              {recs.length > 0 ? (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-1">Livros recomendados:</p>
                                  <ul className="text-sm space-y-1">
                                    {recs.map((r, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <BookOpen className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                                        <span>
                                          <span className="font-medium">{r.title}</span>
                                          {r.author && <span className="text-muted-foreground"> — {r.author}</span>}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : (
                                !h?.skipped && (
                                  <p className="text-xs text-muted-foreground">Sem recomendações registradas nesta tentativa.</p>
                                )
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}


          <section className="glass-card rounded-2xl overflow-hidden" data-tutorial="config-tutorial-reset">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Tutorial
              </h2>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-3">
                {tutorialCompleted
                  ? "Você já completou o tutorial. Quer ver novamente?"
                  : "Aprenda a usar todas as funcionalidades do BookQuest."}
              </p>
              <Button variant="outline" className="w-full gap-2" onClick={() => {
                // Reset home spotlight tutorial
                startTutorial();
                // Reset all category intro tutorials
                localStorage.removeItem("bookquest_visited_categories_v3");
                toast({
                  title: "Tutoriais reiniciados",
                  description: "Os tutoriais guiados aparecerão novamente ao visitar cada seção.",
                });
              }}>
                <HelpCircle className="w-4 h-4" />
                Ver tutorial novamente
              </Button>
            </div>
          </section>

          {/* Logout */}
          <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive">
            <LogOut className="w-5 h-5" />
            Sair da conta
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Configuracoes;
