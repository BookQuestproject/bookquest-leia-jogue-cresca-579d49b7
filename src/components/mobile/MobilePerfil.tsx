import { useRef, useState } from "react";
import { BookOpen, Star, Crown, Clock, CheckCircle, Camera, ChevronRight, Flame, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RankingBadge, { getTierFromPoints, getNextTierInfo } from "@/components/RankingBadge";
import { useProfile } from "@/hooks/useProfile";
import { useReadingStats } from "@/hooks/useReadingStats";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getStreakColor } from "@/components/StreakFlame";
import FounderBadge from "@/components/FounderBadge";
import { useUserBadges } from "@/hooks/useUserBadges";
import ReferralCard from "@/components/ReferralCard";

const MobilePerfil = () => {
  const navigate = useNavigate();
  const { profile, isPremium, loading: profileLoading, refreshProfile } = useProfile();
  const { stats, loading: statsLoading, formatTime } = useReadingStats();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const userName = profile?.full_name || "Você";
  const userEmail = profile?.email || "";
  const literaryProfile = profile?.literary_profile as { genre?: string } | null;
  const literaryGenre = literaryProfile?.genre || "Não definido";
  const userPoints = (stats.completedChapters * 10) + Math.floor(stats.totalReadingTime / 60);
  const currentTier = getTierFromPoints(userPoints);
  const nextTier = getNextTierInfo(currentTier);
  const streakInfo = getStreakColor(0);
  const { activeTitle, isFounder } = useUserBadges();

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Formato inválido", description: "Use JPG, PNG ou WebP.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo de 5MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
      if (updateError) throw updateError;
      await refreshProfile();
      toast({ title: "Foto atualizada!" });
    } catch (error: any) {
      toast({ title: "Erro ao enviar foto", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="px-4 pt-2 pb-6 space-y-4 animate-fade-in">
      {/* Profile Header */}
      <div className="rounded-2xl p-5 bg-card border border-border/60 text-center">
        <div className="relative inline-block mb-3">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-primary/20" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {userName.substring(0, 2).toUpperCase()}
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/jpeg,image/png,image/webp" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-secondary-foreground disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <h1 className="text-lg font-bold">{userName}</h1>
        {activeTitle && (
          <p className="text-[11px] font-semibold mt-0.5" style={{ color: isFounder ? "hsl(40 80% 55%)" : "hsl(var(--accent))" }}>
            {activeTitle}
          </p>
        )}
        <div className="flex items-center justify-center gap-2 mt-1 mb-3">
          <RankingBadge tier={currentTier} size="sm" />
          {isFounder && <FounderBadge size="xs" />}
          {isPremium && !isFounder && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-muted/50">
            {statsLoading ? <Skeleton className="h-5 w-8 mx-auto" /> : (
              <p className="text-base font-bold text-primary">{stats.booksCompleted || 0}</p>
            )}
            <p className="text-[10px] text-muted-foreground">Livros</p>
          </div>
          <div className="p-2.5 rounded-xl bg-muted/50">
            {statsLoading ? <Skeleton className="h-5 w-8 mx-auto" /> : (
              <p className="text-base font-bold text-accent">{stats.completedChapters}</p>
            )}
            <p className="text-[10px] text-muted-foreground">Capítulos</p>
          </div>
          <div className="p-2.5 rounded-xl bg-muted/50">
            {statsLoading ? <Skeleton className="h-5 w-12 mx-auto" /> : (
              <p className="text-base font-bold text-info">{formatTime(stats.totalReadingTime)}</p>
            )}
            <p className="text-[10px] text-muted-foreground">Tempo</p>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      {nextTier && (
        <div className="rounded-xl p-4 bg-card border border-border/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              Próximo nível: <span className="text-foreground font-medium">{nextTier.label}</span>
            </span>
            <span className="text-xs font-bold text-accent">{userPoints}/{nextTier.pointsNeeded} ✦</span>
          </div>
          <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(userPoints / nextTier.pointsNeeded) * 100}%`,
                background: `linear-gradient(90deg, hsl(var(--accent)), hsl(40 80% 55%))`,
              }}
            />
          </div>
        </div>
      )}

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl p-4 bg-card border border-border/60">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-[11px] text-muted-foreground font-medium">Gênero</span>
          </div>
          <p className="text-sm font-bold text-primary">{literaryGenre}</p>
        </div>
        <div className="rounded-xl p-4 bg-card border border-border/60">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4" style={{ color: streakInfo.color }} />
            <span className="text-[11px] text-muted-foreground font-medium">Sequência</span>
          </div>
          <p className="text-sm font-bold" style={{ color: streakInfo.color }}>0 dias</p>
        </div>
      </div>

      {/* Reading Stats */}
      <div className="rounded-xl p-4 bg-card border border-border/60">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          Estatísticas
        </h3>
        {statsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
              <span className="text-xs text-muted-foreground">Tempo total</span>
              <span className="text-sm font-bold text-primary">{formatTime(stats.totalReadingTime)}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
              <span className="text-xs text-muted-foreground">Livros iniciados</span>
              <span className="text-sm font-bold text-info">{stats.booksStarted}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
              <span className="text-xs text-muted-foreground">Média por capítulo</span>
              <span className="text-sm font-bold text-accent">{formatTime(Math.round(stats.averageReadingTime))}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Links */}
      <div className="space-y-2">
        <button
          onClick={() => navigate("/configuracoes")}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border/60 active:scale-[0.98] transition-transform"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium flex-1 text-left">Configurações</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
        </button>
        {user && (
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border/60 active:scale-[0.98] transition-transform text-destructive"
          >
            <span className="text-sm font-medium flex-1 text-left">Sair</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MobilePerfil;
