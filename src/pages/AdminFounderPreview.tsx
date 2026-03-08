import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Shield, Crown, Eye, EyeOff, Star, Gem, Lock, Palette, Frame, User, Zap } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import FounderBadge from "@/components/FounderBadge";
import RankingBadge, { getTierFromPoints } from "@/components/RankingBadge";
import EssenciaIcon from "@/components/EssenciaIcon";

// Mock data for preview items that will be available to founders
const founderFrames = [
  { id: "gold-laurel", name: "Coroa de Louros Dourada", style: "border-4 border-[hsl(40_80%_50%)] shadow-[0_0_12px_hsl(40_80%_50%/0.3)]" },
  { id: "diamond", name: "Diamante Celestial", style: "border-4 border-[hsl(200_80%_60%)] shadow-[0_0_12px_hsl(200_80%_60%/0.3)]" },
  { id: "flame", name: "Chama Ancestral", style: "border-4 border-[hsl(15_80%_50%)] shadow-[0_0_12px_hsl(15_80%_50%/0.3)]" },
  { id: "void", name: "Aura do Vazio", style: "border-4 border-[hsl(270_60%_50%)] shadow-[0_0_12px_hsl(270_60%_50%/0.3)]" },
];

const founderAvatars = [
  { id: "phoenix", name: "Fênix Literária", emoji: "🔥", bg: "hsl(15 80% 50% / 0.15)" },
  { id: "owl", name: "Coruja Sábia", emoji: "🦉", bg: "hsl(40 80% 50% / 0.15)" },
  { id: "dragon", name: "Dragão do Conhecimento", emoji: "🐉", bg: "hsl(150 60% 40% / 0.15)" },
  { id: "star", name: "Estrela Fundadora", emoji: "⭐", bg: "hsl(40 90% 55% / 0.15)" },
];

const founderThemes = [
  { id: "golden-age", name: "Era Dourada", primary: "hsl(40 80% 50%)", bg: "hsl(30 25% 8%)", desc: "Tons dourados e escuros, transmite luxo e exclusividade" },
  { id: "midnight-scholar", name: "Erudito da Meia-Noite", primary: "hsl(220 60% 50%)", bg: "hsl(220 30% 8%)", desc: "Azul profundo com toques luminosos" },
  { id: "ember-light", name: "Luz de Brasa", primary: "hsl(15 80% 50%)", bg: "hsl(15 20% 8%)", desc: "Tons quentes avermelhados, aconchegante" },
  { id: "aurora", name: "Aurora Boreal", primary: "hsl(170 60% 45%)", bg: "hsl(170 20% 8%)", desc: "Verde-azulado etéreo, misterioso" },
];

const allBadges = [
  { type: "founder", label: "Fundador", desc: "Primeiros 200 leitores do BookQuest", exclusive: true },
  { type: "premium", label: "Premium", desc: "Assinante ativo do plano Premium", exclusive: false },
  { type: "streak-7", label: "Chama Semanal", desc: "7 dias seguidos de leitura", exclusive: false },
  { type: "streak-30", label: "Chama Mensal", desc: "30 dias seguidos de leitura", exclusive: false },
  { type: "first-book", label: "Primeiro Livro", desc: "Completou o primeiro livro", exclusive: false },
  { type: "bookworm", label: "Devorador de Livros", desc: "Completou 10 livros", exclusive: false },
];

const allTitles = [
  { title: "Leitor Fundador", exclusive: true, desc: "Título permanente para fundadores" },
  { title: "Mestre dos Livros", exclusive: false, desc: "Completou 20 livros" },
  { title: "Guardião do Conhecimento", exclusive: false, desc: "500 horas de leitura" },
  { title: "Explorador Literário", exclusive: false, desc: "Leu de 5 gêneros diferentes" },
];

const AdminFounderPreview = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();
  const { profile, isPremium } = useProfile();
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(founderFrames[0].id);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(founderThemes[0].id);
  const [earlyAccessEnabled, setEarlyAccessEnabled] = useState(false);

  if (!user) return <Navigate to="/auth" replace />;
  if (loading) return (
    <Layout>
      <div className="py-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    </Layout>
  );
  if (!isAdmin) return <Navigate to="/home" replace />;

  const userName = profile?.full_name?.split(" ")[0] || "Admin";
  const currentFrame = founderFrames.find(f => f.id === selectedFrame);
  const currentTheme = founderThemes.find(t => t.id === selectedTheme);

  return (
    <Layout isPremium={isPremium}>
      <div className="py-8 max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin · Preview</span>
            </div>
            <h1 className="text-2xl font-bold">Preview do Plano Fundador</h1>
            <p className="text-sm text-muted-foreground mt-1">Visualize e teste todos os benefícios antes de disponibilizar</p>
          </div>
          <Button
            variant={previewMode ? "destructive" : "default"}
            className="gap-2"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? "Desativar Preview" : "Ativar Preview"}
          </Button>
        </div>

        {previewMode && (
          <div className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-3">
            <Eye className="w-5 h-5 text-accent flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-accent">Modo Preview Ativo</p>
              <p className="text-xs text-muted-foreground">Você está vendo o sistema como um usuário Fundador veria</p>
            </div>
          </div>
        )}

        {/* Profile Preview */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Preview do Perfil
          </h2>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-5">
              {/* Avatar with frame */}
              <div className="relative">
                <div className={`w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground ${previewMode ? currentFrame?.style : ""} transition-all`}>
                  {selectedAvatar ? (
                    <span className="text-3xl">{founderAvatars.find(a => a.id === selectedAvatar)?.emoji}</span>
                  ) : (
                    userName.substring(0, 2).toUpperCase()
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-xl font-bold">{userName}</h3>
                  <RankingBadge tier="gold" size="sm" showLabel={false} />
                  {previewMode && <FounderBadge size="sm" />}
                </div>
                {previewMode && (
                  <p className="text-xs font-semibold mb-1" style={{ color: "hsl(40 80% 55%)" }}>
                    Leitor Fundador
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {previewMode && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "hsl(40 80% 50% / 0.15)", color: "hsl(40 80% 55%)" }}>
                      <Shield className="w-3 h-3" /> Fundador
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold">
                    <Crown className="w-3 h-3" /> Premium
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            Badges
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {allBadges.map(badge => (
              <div
                key={badge.type}
                className={`rounded-xl p-4 border transition-all ${
                  badge.exclusive 
                    ? "border-[hsl(40_80%_50%/0.3)] bg-[hsl(40_80%_50%/0.05)]"
                    : "border-border bg-card"
                } ${!previewMode && badge.exclusive ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {badge.type === "founder" ? (
                    <FounderBadge size="sm" showLabel={false} />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="w-3 h-3 text-primary" />
                    </div>
                  )}
                  <span className="text-sm font-bold">{badge.label}</span>
                  {badge.exclusive && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "hsl(40 80% 50% / 0.15)", color: "hsl(40 80% 55%)" }}>
                      FUNDADOR
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{badge.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Titles */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5" style={{ color: "hsl(40 80% 55%)" }} />
            Títulos Especiais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTitles.map(t => (
              <div
                key={t.title}
                className={`rounded-xl p-4 border transition-all ${
                  t.exclusive 
                    ? "border-[hsl(40_80%_50%/0.3)] bg-[hsl(40_80%_50%/0.05)]"
                    : "border-border bg-card"
                } ${!previewMode && t.exclusive ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold" style={t.exclusive ? { color: "hsl(40 80% 55%)" } : {}}>
                    {t.title}
                  </span>
                  {t.exclusive && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "hsl(40 80% 50% / 0.15)", color: "hsl(40 80% 55%)" }}>
                      FUNDADOR
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Profile Frames */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Frame className="w-5 h-5 text-primary" />
            Molduras de Perfil
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {founderFrames.map(frame => (
              <button
                key={frame.id}
                onClick={() => setSelectedFrame(frame.id)}
                className={`rounded-xl p-4 border text-center transition-all ${
                  selectedFrame === frame.id ? "ring-2 ring-accent" : ""
                } ${!previewMode ? "opacity-50 pointer-events-none" : ""} border-border bg-card hover:bg-muted/50`}
              >
                <div className={`w-16 h-16 rounded-full bg-primary/20 mx-auto mb-3 flex items-center justify-center text-xl font-bold text-primary-foreground ${frame.style}`}>
                  {userName.substring(0, 2).toUpperCase()}
                </div>
                <p className="text-xs font-medium">{frame.name}</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold mt-1 inline-block" style={{ background: "hsl(40 80% 50% / 0.15)", color: "hsl(40 80% 55%)" }}>
                  FUNDADOR
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Exclusive Avatars */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Gem className="w-5 h-5" style={{ color: "hsl(40 80% 55%)" }} />
            Avatares Exclusivos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {founderAvatars.map(avatar => (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(selectedAvatar === avatar.id ? null : avatar.id)}
                className={`rounded-xl p-4 border text-center transition-all ${
                  selectedAvatar === avatar.id ? "ring-2 ring-accent" : ""
                } ${!previewMode ? "opacity-50 pointer-events-none" : ""} border-border bg-card hover:bg-muted/50`}
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl"
                  style={{ background: avatar.bg }}
                >
                  {avatar.emoji}
                </div>
                <p className="text-xs font-medium">{avatar.name}</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold mt-1 inline-block" style={{ background: "hsl(40 80% 50% / 0.15)", color: "hsl(40 80% 55%)" }}>
                  FUNDADOR
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Profile Themes */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Temas de Perfil
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {founderThemes.map(theme => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`rounded-xl p-5 border text-left transition-all ${
                  selectedTheme === theme.id ? "ring-2 ring-accent" : ""
                } ${!previewMode ? "opacity-50 pointer-events-none" : ""} border-border hover:border-muted-foreground/20`}
                style={{ background: theme.bg }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${theme.primary}20` }}>
                    <Palette className="w-4 h-4" style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: theme.primary }}>{theme.name}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "hsl(40 80% 50% / 0.15)", color: "hsl(40 80% 55%)" }}>
                      FUNDADOR
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{theme.desc}</p>
                {/* Theme color preview */}
                <div className="flex gap-2 mt-3">
                  <div className="w-6 h-6 rounded-full" style={{ background: theme.primary }} />
                  <div className="w-6 h-6 rounded-full" style={{ background: `${theme.primary}60` }} />
                  <div className="w-6 h-6 rounded-full" style={{ background: theme.bg, border: "1px solid hsl(0 0% 50% / 0.2)" }} />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Early Access Simulation */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Early Access
          </h2>
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold">Simular acesso antecipado</p>
                <p className="text-xs text-muted-foreground">Ative para ver como funcionalidades "Early Access" aparecem</p>
              </div>
              <Button
                variant={earlyAccessEnabled ? "destructive" : "outline"}
                size="sm"
                onClick={() => setEarlyAccessEnabled(!earlyAccessEnabled)}
              >
                {earlyAccessEnabled ? "Desativar" : "Ativar"}
              </Button>
            </div>

            {earlyAccessEnabled && (
              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground mb-3">Funcionalidades com selo "Early Access":</p>
                {[
                  { name: "Clube de Debate Literário", desc: "Debates semanais sobre obras" },
                  { name: "Modo Leitura Noturna", desc: "Tema otimizado para leitura à noite" },
                  { name: "Desafios Multiplayer", desc: "Compita com amigos em tempo real" },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{feature.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent font-bold">
                          EARLY ACCESS
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                    <Lock className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AdminFounderPreview;
