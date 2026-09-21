import { useNavigate } from "react-router-dom";
import {
  BookOpen, Check, ChevronRight, Flame, Lock, Megaphone, Sparkles, Target, Trophy, Share2, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import BookQuestTrailMap, { BookQuestTrailChapter } from "@/components/BookQuestTrailMap";
import EduBookCover from "@/components/edu/EduBookCover";

type RankingRow = {
  user_id: string;
  name: string;
  avatar_url?: string | null;
  pages: number;
  isMe?: boolean;
};

type Props = {
  studentName: string;
  className: string;
  bookTitle: string | null;
  author: string | null;
  bookCoverUrl?: string | null;
  themeColor?: string;
  currentPage: number;
  totalPages: number;
  progressPercent: number;
  pendingActivities: number;
  streak: number;
  rank: number;
  dailyPagesRead: number;
  dailyGoal: number;
  daysRemaining: number;
  routineMinutes: number;
  readingBarrier: string;
  preferredSupport: string;
  chapters: BookQuestTrailChapter[];
  selectedChapter: number;
  ranking: RankingRow[];
  onSelectChapter: (chapterNumber: number) => void;
  onStartChapter: (chapterNumber: number) => void;
  onActivities: () => void;
  onStats: () => void;
  onAnnouncements: () => void;
};

const STREAK_STAGES = [
  { min: 0, color: "hsl(45 82% 48%)", label: "Acendendo", next: 2 },
  { min: 2, color: "hsl(24 90% 52%)", label: "Laranja", next: 5 },
  { min: 5, color: "hsl(4 78% 52%)", label: "Vermelho", next: 10 },
  { min: 10, color: "hsl(198 85% 52%)", label: "Azul", next: 20 },
  { min: 20, color: "hsl(150 62% 44%)", label: "Verde", next: 30 },
  { min: 30, color: "hsl(274 72% 58%)", label: "Roxo", next: null },
];

const streakStage = (streak: number) =>
  [...STREAK_STAGES].reverse().find((stage) => streak >= stage.min) || STREAK_STAGES[0];

const EduStudentHome = ({
  studentName,
  className,
  bookTitle,
  author,
  bookCoverUrl,
  themeColor,
  currentPage,
  totalPages,
  progressPercent,
  pendingActivities,
  streak,
  rank,
  dailyPagesRead,
  dailyGoal,
  daysRemaining,
  routineMinutes,
  readingBarrier,
  preferredSupport,
  chapters,
  selectedChapter,
  ranking,
  onSelectChapter,
  onStartChapter,
  onActivities,
  onStats,
  onAnnouncements,
}: Props) => {
  const selected = chapters.find((chapter) => chapter.id === selectedChapter) || chapters.find((chapter) => chapter.status === "current") || chapters[0];
  const currentChapter = chapters.find((chapter) => chapter.status === "current") || selected;
  const stage = streakStage(streak);
  const nextStage = stage.next;
  const streakProgress = nextStage ? Math.min(100, Math.round((streak / nextStage) * 100)) : 100;
  const goalProgress = dailyGoal > 0 ? Math.min(100, Math.round((dailyPagesRead / dailyGoal) * 100)) : 0;
  const accent = themeColor ? `hsl(${themeColor})` : "hsl(210 60% 42%)";
  const navigate = useNavigate();

  const handleShareExperience = async () => {
    const text = `Estou lendo "${bookTitle || "um livro"}" no BookQuest EDU. Já avancei para a página ${currentPage}${totalPages ? ` de ${totalPages}` : ""}. 📚`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Minha leitura no BookQuest", text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // User canceled the native share sheet.
    }
  };

  const handleReportProblem = () => {
    const subject = encodeURIComponent(`Problema no BookQuest EDU — ${bookTitle || "leitura"}`);
    const body = encodeURIComponent(
      `Olá, quero relatar um problema no BookQuest EDU.\\n\\nLivro: ${bookTitle || "não informado"}\\nTurma: ${className}\\nPágina: ${currentPage}${totalPages ? `/${totalPages}` : ""}\\n\\nDescrição do problema:\\n`
    );
    window.location.href = `mailto:hello@bookquest.app?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${accent}, hsl(45 82% 48%), hsl(274 72% 58%))` }} />
        <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-12 w-12 rounded-2xl overflow-hidden flex items-center justify-center text-white shrink-0" style={{ backgroundColor: accent }}>
                <EduBookCover src={bookCoverUrl} title={bookTitle || "Livro da turma"} alt={bookTitle || "Livro"} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-muted-foreground">Lendo agora</p>
                <h1 className="text-base sm:text-lg font-bold truncate">{bookTitle || "Livro da turma"}</h1>
                <p className="text-xs text-muted-foreground truncate">{author || "Autor não informado"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:w-[230px]">
              <button
                type="button"
                onClick={() => currentChapter && onStartChapter(currentChapter.id)}
                disabled={!currentChapter || currentChapter.status === "locked"}
                className="text-left rounded-2xl border border-border bg-muted/20 px-3 py-2 hover:border-primary/40 hover:bg-primary/5 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
                title="Abrir este capítulo"
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Capítulo atual</p>
                <p className="text-sm font-bold mt-0.5">Cap. {currentChapter?.id || 1}</p>
              </button>
              <div className="rounded-2xl border border-border bg-muted/20 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Página</p>
                <p className="text-sm font-bold mt-0.5">{currentPage}{totalPages ? ` / ${totalPages}` : ""}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">
        <section className="rounded-[30px] border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-4 sm:px-8 pt-7 pb-2 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Sua trilha literária</p>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2">Continue sua história.</h2>
            <p className="text-sm text-muted-foreground mt-2">Os capítulos seguem a mesma trilha do BookQuest.</p>
          </div>
          <div className="px-3 sm:px-8 py-3 sm:py-5 overflow-x-auto">
            <div className="min-w-[540px]">
              <BookQuestTrailMap
                chapters={chapters}
                themeColor={themeColor || "210 55% 30%"}
                onChapterClick={(chapter) => {
                  onSelectChapter(chapter.id);
                  onStartChapter(chapter.id);
                }}
                className="max-w-[540px]"
                endLabel="🏁 Chegada da trilha"
              />
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] font-bold text-muted-foreground">Sua sequência</p>
                <p className="text-3xl font-black mt-1">{streak} <span className="text-sm font-semibold text-muted-foreground">dias</span></p>
                <p className="text-sm font-semibold mt-1" style={{ color: stage.color }}>{stage.label}</p>
              </div>
              <Flame className="h-8 w-8" style={{ color: stage.color }} />
            </div>
            <Progress value={streakProgress} className="h-2 mt-4" />
            <p className="text-xs text-muted-foreground mt-2">
              {nextStage ? `Mais ${Math.max(0, nextStage - streak)} dia${nextStage - streak === 1 ? "" : "s"} para a próxima cor.` : "Último marco de cor alcançado."}
            </p>
            <div className="flex items-center gap-2 mt-4">
              {STREAK_STAGES.slice(1).map((item) => (
                <span key={item.min} className="h-3 w-3 rounded-full" title={`${item.min} dias`} style={{ backgroundColor: item.color }} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] font-bold text-muted-foreground">Hoje</p>
                <p className="text-lg font-bold mt-1">Sua missão de leitura</p>
              </div>
              <Target className="h-6 w-6 text-accent" />
            </div>
            <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                {goalProgress >= 100 ? <Check className="h-5 w-5 text-emerald-500" /> : <Sparkles className="h-5 w-5 text-accent" />}
                <p className="text-sm font-bold">
                  {readingBarrier === "time"
                    ? `Sessão rápida de ${routineMinutes} min`
                    : readingBarrier === "focus"
                      ? `Leitura em foco por ${routineMinutes} min`
                      : readingBarrier === "interest"
                        ? "Encontre uma descoberta no capítulo"
                        : readingBarrier === "difficulty"
                          ? "Encontre uma pista que faça sentido"
                          : dailyGoal > 0
                            ? `Ler ${dailyGoal} páginas`
                            : "Continue sua leitura"}
                </p>
              </div>
              {dailyGoal > 0 && (
                <>
                  <Progress value={goalProgress} className="h-2 mt-3" />
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
                    <span>{dailyPagesRead} pág. feitas</span>
                    <span>{goalProgress}%</span>
                  </div>
                </>
              )}
            </div>
            <div className="mt-3 rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Próximo passo</p>
              <p className="text-sm font-semibold mt-1">
                {preferredSupport === "discoveries" ? "Preste atenção a uma pista ou detalhe." :
                  preferredSupport === "characters" ? "Observe o que um personagem escolhe ou muda." :
                  preferredSupport === "competition" ? "Mantenha sua sequência e acompanhe sua posição." :
                  currentChapter ? currentChapter.title : "Abra a trilha para continuar."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-400/10 text-amber-500 flex items-center justify-center">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] font-bold text-muted-foreground">Ranking</p>
                <p className="text-lg font-bold mt-1">{rank > 0 ? `#${rank}` : "—"} na turma</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">{pendingActivities > 0 ? `${pendingActivities} atividade${pendingActivities > 1 ? "s" : ""} aguardando você.` : "Você está em dia com as atividades."}</p>
          </div>
        </aside>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] font-bold text-muted-foreground">Mais do BookQuest</p>
            <h2 className="text-lg font-bold mt-1">Sua leitura continua aqui.</h2>
            <p className="text-sm text-muted-foreground mt-1">Use os recursos do BookQuest normal sem sair da sua experiência EDU.</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="outline" onClick={() => void handleShareExperience()} className="gap-2">
              <Share2 className="h-4 w-4" /> Compartilhar experiência
            </Button>
            <Button variant="ghost" onClick={handleReportProblem} className="gap-2">
              <Mail className="h-4 w-4" /> Relatar problema
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
          {[
            ["Missões", "/missoes"],
            ["Conquistas", "/conquistas"],
            ["Vocabulário", "/vocabulario"],
            ["Comunidade", "/comunidade"],
          ].map(([label, path]) => (
            <button key={path} type="button" onClick={() => navigate(path)} className="rounded-2xl border border-border px-3 py-3 text-left hover:bg-muted/40 transition-colors">
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Abrir recurso</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
export default EduStudentHome;
