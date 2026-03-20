import { BookOpen, Star, Crown, Settings, Edit2, Clock, CheckCircle, Camera } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import RankingBadge, { getTierFromPoints, getNextTierInfo } from "@/components/RankingBadge";
import ProgressBar from "@/components/ProgressBar";
import { useProfile } from "@/hooks/useProfile";
import { useReadingStats } from "@/hooks/useReadingStats";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import AchievementsSection from "@/components/AchievementsSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import MobilePerfil from "@/components/mobile/MobilePerfil";
import FounderBadge from "@/components/FounderBadge";
import { useUserBadges } from "@/hooks/useUserBadges";
import ReferralCard from "@/components/ReferralCard";
import AvatarCropModal from "@/components/AvatarCropModal";

const readingHistory = [
  { id: 1, title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", completedAt: "Dez 2023", pages: 208 },
  { id: 2, title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", completedAt: "Jan 2024", pages: 96 },
];

const Perfil = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { profile, isPremium, loading: profileLoading, refreshProfile } = useProfile();
  const { stats, loading: statsLoading, formatTime } = useReadingStats();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { activeTitle, isFounder } = useUserBadges();
  const [cropImage, setCropImage] = useState<string | null>(null);

  const userName = profile?.full_name || "Você";
  const userEmail = profile?.email || "usuario@email.com";
  const literaryProfile = profile?.literary_profile as { genre?: string } | null;
  const literaryGenre = literaryProfile?.genre || "Não definido";

  const booksRead = stats.booksCompleted || 0;
  const userPoints = (stats.completedChapters * 10) + Math.floor(stats.totalReadingTime / 60);
  const currentTier = getTierFromPoints(userPoints);
  const nextTier = getNextTierInfo(currentTier);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Formato inválido", description: "Use JPG, PNG ou WebP.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo de 5MB.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setCropImage(reader.result as string);
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    event.target.value = "";
  };

  const handleCroppedUpload = async (blob: Blob) => {
    if (!user) return;
    setUploading(true);
    try {
      const filePath = `${user.id}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { upsert: true, contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      if (updateError) throw updateError;

      await refreshProfile();
      setCropImage(null);
      toast({ title: "Foto atualizada!", description: "Sua foto de perfil foi salva." });
    } catch (error: any) {
      toast({ title: "Erro ao enviar foto", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (isMobile) {
    return (
      <Layout>
        <MobilePerfil />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8" data-tutorial="perfil-header">
          {/* Profile Card */}
          <div className="glass-card rounded-3xl p-6 lg:p-8 flex-1 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-primary/20" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                    {userName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/jpeg,image/png,image/webp" className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center hover:bg-secondary/80 transition-colors disabled:opacity-50 text-secondary-foreground"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{userName}</h1>
                  <RankingBadge tier={currentTier} size="sm" />
                  {isFounder && <FounderBadge size="sm" />}
                  {isPremium && !isFounder && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-bold">
                      <Crown className="w-3 h-3" />
                      Premium
                    </span>
                  )}
                </div>
                {activeTitle && (
                  <p className="text-xs font-semibold mb-1" style={{ color: isFounder ? "hsl(40 80% 55%)" : "hsl(var(--accent))" }}>
                    {activeTitle}
                  </p>
                )}
                <p className="text-muted-foreground mb-4">{userEmail}</p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-xl bg-muted">
                    {statsLoading ? <Skeleton className="h-6 w-8 mx-auto mb-1" /> : <div className="text-xl font-bold text-primary">{booksRead}</div>}
                    <div className="text-xs text-muted-foreground">Livros</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted">
                    {statsLoading ? <Skeleton className="h-6 w-8 mx-auto mb-1" /> : (
                      <div className="text-xl font-bold text-accent flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" />{stats.completedChapters}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">Capítulos</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted">
                    {statsLoading ? <Skeleton className="h-6 w-12 mx-auto mb-1" /> : (
                      <div className="text-xl font-bold text-info flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" />{formatTime(stats.totalReadingTime)}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">Tempo</div>
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>

            {nextTier && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Próximo nível: <span className="text-foreground font-medium">{nextTier.label}</span>
                  </span>
                  <span className="text-sm font-bold text-primary">{userPoints} / {nextTier.pointsNeeded} ✦</span>
                </div>
                <ProgressBar value={userPoints} max={nextTier.pointsNeeded} />
              </div>
            )}
          </div>

          {/* Reading Stats Card */}
          <div className="glass-card rounded-3xl p-6 lg:p-8 w-full lg:w-80 animate-fade-in" data-tutorial="perfil-stats" style={{ animationDelay: "0.1s" }}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-sm text-muted-foreground mb-1">Estatísticas de Leitura</h3>
              {statsLoading ? (
                <div className="space-y-3 mt-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
                    <span className="text-sm text-muted-foreground">Tempo total</span>
                    <span className="font-bold text-primary">{formatTime(stats.totalReadingTime)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
                    <span className="text-sm text-muted-foreground">Livros iniciados</span>
                    <span className="font-bold text-info">{stats.booksStarted}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
                    <span className="text-sm text-muted-foreground">Média por capítulo</span>
                    <span className="font-bold text-accent">{formatTime(Math.round(stats.averageReadingTime))}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Literary Genre Card */}
        <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Star className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm text-muted-foreground mb-1">Seu gênero literário</h3>
              <p className="text-2xl font-bold text-primary mb-1">{literaryGenre}</p>
              <p className="text-sm text-muted-foreground">Identificado pelo quiz literário</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/premium")} className="gap-1">
              <Crown className="w-3.5 h-3.5 text-accent" />
              Refazer quiz
            </Button>
          </div>
        </div>

        <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.18s" }}><ReferralCard /></div>
        <div className="mb-8 animate-fade-in" data-tutorial="perfil-achievements" style={{ animationDelay: "0.2s" }}><AchievementsSection /></div>

        {/* Reading History */}
        <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Histórico de Leitura
          </h2>
          <div className="space-y-4">
            {readingHistory.map((book) => (
              <div key={book.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted">
                <div className="w-12 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{book.title}</p>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{book.completedAt}</p>
                  <p className="text-xs text-muted-foreground">{book.pages} páginas</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">Adicionar livro lido</Button>
        </div>
      </div>

      {cropImage && (
        <AvatarCropModal
          open={!!cropImage}
          imageSrc={cropImage}
          onClose={() => setCropImage(null)}
          onConfirm={handleCroppedUpload}
          loading={uploading}
        />
      )}
    </Layout>
  );
};

export default Perfil;
