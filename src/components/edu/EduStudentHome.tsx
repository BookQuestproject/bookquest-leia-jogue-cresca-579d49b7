import {
  BookOpen, Check, ChevronRight, Flame, Lock, Megaphone, Sparkles, Target, Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import BookQuestTrailMap, { BookQuestTrailChapter } from "@/components/BookQuestTrailMap";

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

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${accent}, hsl(45 82% 48%), hsl(274 72% 58%))` }} />
        <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-12 w-12 rounded-2xl overflow-hidden flex items-center justify-center text-white shrink-0" style={{ backgroundColor: accent }}>
                {bookCoverUrl ? <img src={bookCoverUrl} alt="" className="h-full w-full object-cover" /> : <BookOpen className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-muted-foreground">Lendo agora</p>
                <h1 className="text-base sm:text-lg font-bold truncate">{bookTitle || "Livro da turma"}</h1>
                <p className="text-xs text-muted-foreground truncate">{author || "Autor não informado"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[110px_110px_auto] gap-2">
              <div className="rounded-2xl border border-border bg-muted/20 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Capítulo</p>
                <p className="text-sm font-bold mt-0.5">Cap. {currentChapter?.id || 1}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/20 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Página</p>
                <p className="text-sm font-bold mt-0.5">{currentPage}{totalPages ? ` / ${totalPages}` : ""}</p>
              </div>
              <Button
                size="lg"
                onClick={() => currentChapter && onStartChapter(currentChapter.id)}
                disabled={!currentChapter || currentChapter.status === "locked"}
                className="col-span-2 sm:col-span-1 gap-2 min-h-11 shadow-sm"
                style={{ backgroundColor: accent }}
              >
                <BookOpen className="h-4 w-4" /> Continuar leitura
              </Button>
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
                onChapterClick={(chapter) => onSelectChapter(chapter.id)}
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
                <p className="text-sm font-bold">{dailyGoal > 0 ? `Ler ${dailyGoal} páginas` : "Continue sua leitura"}</p>
              </div>
              <Progress value={goalProgress} className="h-2 mt-3" />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
                <span>{dailyPagesRead} pág. feitas</span>
                <span>{goalProgress}%</span>
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Próximo passo</p>
              <p className="text-sm font-semibold mt-1">
                {currentChapter ? currentChapter.title : "Abra a trilha para continuar."}
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
    </div>
  );
};
export default EduStudentHome;
