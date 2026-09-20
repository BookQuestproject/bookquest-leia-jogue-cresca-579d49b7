import {
  Award, BarChart3, BookOpen, Check, ChevronRight, ClipboardList, Flame,
  Lock, Megaphone, Sparkles, Target, Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Chapter = {
  number: number;
  title: string;
  startPage: number;
  endPage: number;
  status: "completed" | "current" | "locked";
  icon?: React.ReactNode;
};

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
  essencia: number;
  streak: number;
  rank: number;
  dailyPagesRead: number;
  dailyGoal: number;
  daysRemaining: number;
  chapters: Chapter[];
  selectedChapter: number;
  ranking: RankingRow[];
  classChallenge?: {
    title: string;
    description?: string | null;
    goal_value: number;
    challenge_type: string;
  } | null;
  onSelectChapter: (chapterNumber: number) => void;
  onStartChapter: (chapterNumber: number) => void;
  onActivities: () => void;
  onStats: () => void;
  onAnnouncements: () => void;
};

const BOOK_PALETTE = [
  "hsl(45 82% 46%)",
  "hsl(265 58% 52%)",
  "hsl(158 48% 40%)",
  "hsl(345 58% 52%)",
  "hsl(197 70% 45%)",
  "hsl(24 72% 48%)",
  "hsl(183 52% 38%)",
];

const STREAK_STAGES = [
  { min: 0, label: "Acendendo", color: "hsl(45 82% 48%)", next: 2 },
  { min: 2, label: "Fogo laranja", color: "hsl(24 90% 52%)", next: 5 },
  { min: 5, label: "Fogo vermelho", color: "hsl(4 78% 52%)", next: 10 },
  { min: 10, label: "Fogo azul", color: "hsl(198 85% 52%)", next: 20 },
  { min: 20, label: "Fogo verde", color: "hsl(150 62% 44%)", next: 30 },
  { min: 30, label: "Fogo roxo", color: "hsl(274 72% 58%)", next: null },
];

const getStreakStage = (streak: number) =>
  [...STREAK_STAGES].reverse().find((stage) => streak >= stage.min) || STREAK_STAGES[0];

const getBookColor = (theme: string | undefined, index: number) =>
  theme ? `hsl(${theme})` : BOOK_PALETTE[index % BOOK_PALETTE.length];

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
  classChallenge,
  onSelectChapter,
  onStartChapter,
  onActivities,
  onStats,
  onAnnouncements,
  sidebarExpanded,
  onToggleSidebar,
}: Props) => {
  const selected = chapters.find((chapter) => chapter.number === selectedChapter)
    || chapters.find((chapter) => chapter.status === "current")
    || chapters[0];
  const currentTrailChapter = chapters.find((chapter) => chapter.status === "current") || selected;
  const goalProgress = dailyGoal > 0 ? Math.min(100, Math.round((dailyPagesRead / dailyGoal) * 100)) : 0;
  const visibleRanking = ranking.slice(0, 3);
  const meInTop = visibleRanking.some((row) => row.isMe);
  const bookHsl = getBookColor(themeColor, 0);
  const streakStage = getStreakStage(streak);
  const streakNext = streakStage.next;
  const streakProgress = streakNext ? Math.min(100, Math.round((streak / streakNext) * 100)) : 100;
  const chapterProgress = currentTrailChapter && currentTrailChapter.endPage > currentTrailChapter.startPage
    ? Math.max(0, Math.min(100, Math.round(((currentPage - currentTrailChapter.startPage + 1) / (currentTrailChapter.endPage - currentTrailChapter.startPage + 1)) * 100)))
    : 0;

  return (
    <div className="space-y-6">
      <section
        className="sticky top-3 z-20 rounded-3xl border border-border bg-card/95 backdrop-blur-xl shadow-md overflow-hidden"
        aria-label="Leitura atual"
      >
        <div
          className="h-1"
          style={{ background: `linear-gradient(90deg, ${bookHsl}, ${BOOK_PALETTE[1]}, ${BOOK_PALETTE[3]})` }}
        />
        <div className="px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="h-12 w-12 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center text-white"
              style={{ backgroundColor: bookHsl }}
            >
              {bookCoverUrl ? <img src={bookCoverUrl} alt="" className="h-full w-full object-cover" /> : <BookOpen className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Lendo agora</p>
              <h1 className="text-base sm:text-lg font-bold truncate">{bookTitle || "Livro da turma"}</h1>
              <p className="text-xs text-muted-foreground truncate">{author || "Autor não informado"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:w-auto">
            <div className="rounded-2xl border border-border bg-muted/25 px-3 py-2 min-w-[104px]">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Capítulo</p>
              <p className="text-sm font-bold mt-0.5">Cap. {currentTrailChapter?.number || 1}</p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/25 px-3 py-2 min-w-[104px]">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Página</p>
              <p className="text-sm font-bold mt-0.5">{currentPage}{totalPages ? ` / ${totalPages}` : ""}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Button
                size="lg"
                onClick={() => currentTrailChapter && onStartChapter(currentTrailChapter.number)}
                disabled={!currentTrailChapter || currentTrailChapter.status === "locked"}
                className="w-full h-full min-h-11 gap-2 shadow-sm"
                style={{ backgroundColor: bookHsl }}
              >
                <BookOpen className="h-4 w-4" />
                Continuar leitura
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Sua jornada</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
                Olá, {studentName.split(" ")[0]}.
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{className}</p>
            </div>
            <div
              className="hidden sm:flex items-center gap-2 rounded-2xl border px-3 py-2"
              style={{ borderColor: `${streakStage.color}35`, backgroundColor: `${streakStage.color}0d` }}
            >
              <Flame className="h-4 w-4" style={{ color: streakStage.color }} />
              <div>
                <p className="text-xs font-bold">{streak} dias</p>
                <p className="text-[10px] text-muted-foreground">{streakStage.label}</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-border bg-card shadow-sm">
            <div
              className="absolute inset-x-0 top-0 h-40"
              style={{
                background: `linear-gradient(180deg, ${bookHsl}10 0%, transparent 100%)`,
              }}
            />

            <div className="relative px-4 sm:px-8 pt-8 pb-10">
              <div className="mx-auto max-w-xl text-center">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Mapa da leitura</p>
                <h3 className="text-lg sm:text-xl font-bold mt-2">Escolha seu próximo capítulo</h3>
              </div>

              <div className="relative mx-auto mt-10 max-w-[520px] px-2">
                <div
                  className="absolute left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 rounded-full opacity-15"
                  style={{ backgroundColor: bookHsl }}
                />

                <div className="relative flex flex-col items-center gap-16">
                  {chapters.map((chapter, index) => {
                    const active = chapter.number === selected?.number;
                    const completed = chapter.status === "completed";
                    const locked = chapter.status === "locked";
                    const nodeColor = locked ? "hsl(var(--muted-foreground))" : active ? bookHsl : getBookColor(undefined, index);

                    return (
                      <div key={chapter.number} className="relative w-full flex justify-center">
                        <button
                          type="button"
                          disabled={locked}
                          onClick={() => onSelectChapter(chapter.number)}
                          className="group relative z-10 focus:outline-none disabled:cursor-not-allowed"
                          aria-label={`Capítulo ${chapter.number}: ${chapter.title}${locked ? ", bloqueado" : ""}`}
                        >
                          <div
                            className={`h-[84px] w-[84px] sm:h-24 sm:w-24 rounded-[30px] border-4 flex items-center justify-center shadow-md transition-all duration-200 ${
                              active ? "scale-110" : "group-hover:scale-105"
                            }`}
                            style={{
                              borderColor: locked ? "hsl(var(--border))" : `${nodeColor}99`,
                              backgroundColor: locked ? "hsl(var(--muted))" : active ? nodeColor : "hsl(var(--card))",
                              color: locked ? "hsl(var(--muted-foreground))" : active ? "white" : nodeColor,
                              boxShadow: active ? `0 14px 34px ${nodeColor}35` : undefined,
                            }}
                          >
                            {locked ? <Lock className="h-5 w-5" /> : completed ? <Check className="h-7 w-7" /> : (
                              <span className="text-2xl font-black">{chapter.number}</span>
                            )}
                          </div>

                          <div className={`absolute left-1/2 top-full mt-3 -translate-x-1/2 w-[min(250px,75vw)] rounded-2xl border px-4 py-2.5 text-center bg-card shadow-sm ${active ? "border-primary/30" : "border-border"}`}>
                            <p className={`text-sm font-bold leading-snug ${locked ? "text-muted-foreground" : "text-foreground"}`}>
                              {chapter.title}
                            </p>
                          </div>
                        </button>

                        {index < chapters.length - 1 && (
                          <div
                            className="absolute left-1/2 top-[96px] h-16 w-0.5 -translate-x-1/2"
                            style={{ background: `linear-gradient(180deg, ${getBookColor(undefined, index)}, ${getBookColor(undefined, index + 1)})`, opacity: 0.24 }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selected && (
                <div className="mx-auto max-w-xl mt-24 rounded-3xl border border-border bg-muted/20 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.14em] font-bold text-muted-foreground">Capítulo selecionado</p>
                      <h4 className="text-lg font-bold truncate mt-1">{selected.title}</h4>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground shrink-0">{selected.status === "completed" ? "Concluído" : selected.status === "locked" ? "Bloqueado" : "Disponível"}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selected.status === "current" && currentTrailChapter && (
                      <div className="w-full">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                          <span>Progresso no capítulo</span>
                          <span>{chapterProgress}%</span>
                        </div>
                        <Progress value={chapterProgress} className="h-2" />
                      </div>
                    )}
                    <Button
                      disabled={selected.status === "locked"}
                      onClick={() => onStartChapter(selected.number)}
                      className="mt-1 gap-2"
                      style={{ backgroundColor: selected.status === "locked" ? undefined : getBookColor(undefined, selected.number - 1) }}
                    >
                      {selected.status === "locked" ? "Bloqueado" : selected.status === "completed" ? "Revisar capítulo" : "Abrir capítulo"}
                      {selected.status !== "locked" && <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="hidden md:flex w-[72px] xl:w-[300px] shrink-0" aria-label="Progresso e missões">
          <div className="w-full space-y-4">
            <div
              className="rounded-3xl border border-border bg-card p-3 xl:p-5 shadow-sm"
              style={{ borderTopColor: `${streakStage.color}80` }}
            >
              <div className="flex items-center justify-center xl:justify-between gap-3">
                <div className="text-center xl:text-left">
                  <p className="hidden xl:block text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Sequência</p>
                  <p className="text-2xl font-black mt-1">{streak}</p>
                  <p className="hidden xl:block text-xs text-muted-foreground">{streakStage.label}</p>
                </div>
                <Flame className="h-7 w-7" style={{ color: streakStage.color }} />
              </div>
              <div className="hidden xl:block mt-4">
                <Progress value={streakProgress} className="h-2" />
                <p className="text-[10px] text-muted-foreground mt-2">
                  {streakNext ? `Mais ${Math.max(0, streakNext - streak)} dia${streakNext - streak === 1 ? "" : "s"} para mudar de cor.` : "Você alcançou o último marco de fogo."}
                </p>
              </div>
              <div className="hidden xl:flex items-center justify-center gap-1.5 mt-4">
                {STREAK_STAGES.slice(1).map((stage) => (
                  <span
                    key={stage.min}
                    title={`${stage.min} dias · ${stage.label}`}
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-3 xl:p-5 shadow-sm">
              <div className="flex items-center justify-center xl:justify-between gap-2">
                <div className="hidden xl:block">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Ranking</p>
                  <p className="text-lg font-bold mt-1">#{rank > 0 ? rank : "—"}</p>
                </div>
                <Trophy className="h-6 w-6 text-amber-500" />
              </div>
              <div className="hidden xl:block mt-4 space-y-2">
                {visibleRanking.map((row, index) => (
                  <div key={row.user_id} className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-2.5 py-2">
                    <span className="w-5 text-center text-xs font-black text-muted-foreground">{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold">{row.name}</span>
                    <span className="text-[10px] font-bold text-muted-foreground">{row.pages}p</span>
                  </div>
                ))}
                {!meInTop && rank > 0 && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 px-2.5 py-2 flex items-center gap-2">
                    <span className="text-xs font-black text-primary">#{rank}</span>
                    <span className="text-xs font-semibold">Você</span>
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={onStats} className="w-full mt-3 gap-2">
                <BarChart3 className="h-4 w-4" /> <span className="hidden xl:inline">Ver evolução</span>
              </Button>
            </div>

            <div className="rounded-3xl border border-border bg-card p-3 xl:p-5 shadow-sm">
              <div className="flex items-center justify-center xl:justify-between">
                <div className="hidden xl:block">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Missões</p>
                  <p className="text-sm font-bold mt-1">Hoje</p>
                </div>
                <Target className="h-6 w-6 text-accent" />
              </div>

              <div className="hidden xl:block mt-4 space-y-3">
                <div className="rounded-2xl border border-border bg-muted/20 p-3">
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Ritmo de leitura</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {dailyGoal > 0 ? `Leia ${dailyGoal} pág. hoje.` : "Continue registrando sua leitura."}
                      </p>
                    </div>
                  </div>
                  {dailyGoal > 0 && <Progress value={goalProgress} className="h-1.5 mt-3" />}
                  <p className="text-[10px] text-muted-foreground mt-1.5">{dailyPagesRead}/{dailyGoal || "—"} páginas</p>
                </div>

                <div className="rounded-2xl border border-border bg-muted/20 p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Próximo passo</p>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        {currentTrailChapter?.status === "current"
                          ? `Avance até o fim de ${currentTrailChapter.title}.`
                          : "Abra o capítulo disponível no mapa."}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onActivities}
                  className="w-full rounded-2xl border border-border bg-muted/20 p-3 text-left hover:bg-muted/35 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-xs font-bold">Atividades</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {pendingActivities > 0 ? `${pendingActivities} esperando você.` : "Nada pendente."}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>

                {classChallenge && (
                  <div className="rounded-2xl border border-border bg-muted/20 p-3">
                    <div className="flex items-start gap-2">
                      <Award className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold">{classChallenge.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{classChallenge.description || `Meta da turma: ${classChallenge.goal_value}.`}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button variant="ghost" onClick={onAnnouncements} className="w-full justify-between text-xs">
                  Avisos da turma <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EduStudentHome;
