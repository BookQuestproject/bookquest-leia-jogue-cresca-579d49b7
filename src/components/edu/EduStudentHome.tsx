import {
  Award, BarChart3, BookOpen, Check, ChevronRight, ClipboardList, Flame,
  Flag, Lock, Megaphone, Sparkles, Target, Trophy, Users,
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
  onContinueReading: () => void;
  onActivities: () => void;
  onStats: () => void;
  onAnnouncements: () => void;
};

const colorForGenre = (value: string | null) => {
  if (!value) return "210 48% 42%";
  const normalized = value.toLowerCase();
  if (normalized.includes("fantasia")) return "265 48% 42%";
  if (normalized.includes("mistério")) return "350 42% 38%";
  if (normalized.includes("romance")) return "335 48% 45%";
  if (normalized.includes("aventura")) return "24 58% 40%";
  if (normalized.includes("não-ficção")) return "180 40% 36%";
  return "210 48% 42%";
};

const chapterPositions = ["-translate-x-10", "translate-x-8", "-translate-x-6", "translate-x-10", "-translate-x-8", "translate-x-6"];

const EduStudentHome = ({
  studentName,
  className,
  bookTitle,
  author,
  bookCoverUrl,
  themeColor = colorForGenre(null),
  currentPage,
  totalPages,
  progressPercent,
  pendingActivities,
  essencia,
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
  onContinueReading,
  onActivities,
  onStats,
  onAnnouncements,
}: Props) => {
  const selected = chapters.find((chapter) => chapter.number === selectedChapter) || chapters.find((chapter) => chapter.status === "current") || chapters[0];
  const goalProgress = dailyGoal > 0 ? Math.min(100, Math.round((dailyPagesRead / dailyGoal) * 100)) : 0;
  const visibleRanking = ranking.slice(0, 3);
  const meInTop = visibleRanking.some((row) => row.isMe);
  const hsl = `hsl(${themeColor})`;

  return (
    <div
      className="space-y-6"
      style={{
        "--book-theme": hsl,
      } as React.CSSProperties}
    >
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        <section className="min-w-0">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Sua jornada</p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
                Olá, {studentName.split(" ")[0]}.
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{className}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-semibold">{streak} dias de sequência</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-border bg-card min-h-[690px] shadow-sm">
            <div
              className="absolute inset-x-0 top-0 h-44 opacity-90"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${hsl}28, transparent 70%)`,
              }}
            />

            <div className="relative px-4 sm:px-8 pt-7 pb-10">
              <div className="mx-auto max-w-xl text-center">
                <div
                  className="relative inline-block rounded-3xl border border-white/40 bg-card px-5 py-4 shadow-lg"
                  style={{
                    boxShadow: `0 14px 40px ${hsl}20`,
                  }}
                >
                  <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-white/40 bg-card" />
                  <div className="relative z-10 flex items-center gap-3 text-left">
                    <div
                      className="h-11 w-11 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 overflow-hidden"
                      style={{ backgroundColor: hsl }}
                    >
                      {bookCoverUrl ? (
                        <img src={bookCoverUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <BookOpen className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: hsl }}>Livro da turma</p>
                      <p className="text-base sm:text-lg font-bold text-foreground truncate">{bookTitle || "Sua leitura"}</p>
                      <p className="text-xs text-muted-foreground truncate">{author || "Autor não informado"}</p>
                    </div>
                    <div className="hidden sm:block h-8 w-px bg-border" />
                    <div className="hidden sm:block text-right shrink-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Agora</p>
                      <p className="text-sm font-bold">Cap. {selected?.number ?? 1}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm font-semibold text-foreground mt-6">
                  Escolha um capítulo para explorar.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  O mapa acompanha seu avanço sem tirar o foco da leitura.
                </p>
              </div>

              <div className="relative mx-auto mt-8 max-w-[560px] min-h-[470px]">
                <div
                  className="absolute left-1/2 top-7 bottom-7 w-1 -translate-x-1/2 rounded-full opacity-25"
                  style={{ backgroundColor: hsl }}
                />

                <div className="relative flex flex-col items-center gap-7">
                  {chapters.map((chapter, index) => {
                    const active = chapter.number === selected?.number;
                    const completed = chapter.status === "completed";
                    const locked = chapter.status === "locked";
                    const position = chapterPositions[index % chapterPositions.length];

                    return (
                      <div key={chapter.number} className="relative w-full flex justify-center">
                        <button
                          type="button"
                          disabled={locked}
                          onClick={() => onSelectChapter(chapter.number)}
                          className={`group relative z-10 ${position} w-52 sm:w-60 text-left focus:outline-none disabled:cursor-not-allowed`}
                          aria-label={`Capítulo ${chapter.number}: ${chapter.title}${locked ? ", bloqueado" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-[70px] w-[70px] rounded-[22px] border-4 flex items-center justify-center shrink-0 shadow-md transition-all duration-200 ${active ? "scale-110" : "group-hover:scale-105"} `}
                              style={{
                                borderColor: locked ? "hsl(var(--border))" : active ? hsl : `${hsl}66`,
                                backgroundColor: locked ? "hsl(var(--muted))" : active ? hsl : "hsl(var(--card))",
                                color: locked ? "hsl(var(--muted-foreground))" : active ? "white" : hsl,
                                boxShadow: active ? `0 10px 30px ${hsl}35` : undefined,
                              }}
                            >
                              {locked ? <Lock className="h-5 w-5" /> : completed ? <Check className="h-6 w-6" /> : <span className="text-lg font-black">{chapter.number}</span>}
                            </div>
                            <div className={`min-w-0 ${active ? "opacity-100" : "opacity-90"}`}>
                              <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Capítulo {chapter.number}</p>
                              <p className={`text-sm font-bold leading-snug ${locked ? "text-muted-foreground" : "text-foreground"}`}>{chapter.title}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {completed ? "Concluído" : locked ? "Continue a leitura para desbloquear" : `Pág. ${chapter.startPage}–${chapter.endPage}`}
                              </p>
                            </div>
                          </div>
                        </button>

                        {index < chapters.length - 1 && (
                          <div
                            className="absolute left-1/2 top-[70px] h-7 w-0.5 -translate-x-1/2"
                            style={{ backgroundColor: `${hsl}30` }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div
                  className="absolute left-1/2 bottom-0 -translate-x-1/2 h-16 w-16 rounded-2xl rotate-45 flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: hsl }}
                >
                  <div className="-rotate-45 text-white">
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {selected && (
                <div className="mx-auto max-w-2xl mt-2 rounded-3xl border border-border bg-muted/25 p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.14em] font-bold text-muted-foreground">Capítulo selecionado</p>
                      <h2 className="text-lg font-bold text-foreground mt-1">{selected.title}</h2>
                      <p className="text-xs text-muted-foreground mt-1">Páginas {selected.startPage}–{selected.endPage}</p>
                    </div>
                    <Button
                      onClick={onContinueReading}
                      className="shrink-0 gap-2 h-11"
                      style={{ backgroundColor: hsl }}
                    >
                      {selected.status === "current" ? "Continuar leitura" : "Voltar à leitura"}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-6">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Ranking da turma</p>
                <h2 className="text-lg font-bold mt-1">Você está em <span className="text-primary">{rank > 0 ? `#${rank}` : "—"}</span></h2>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-amber-400/10 text-amber-500 flex items-center justify-center">
                <Trophy className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {visibleRanking.map((row, index) => (
                <div key={row.user_id} className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 px-3 py-2.5">
                  <span className="w-6 text-center text-sm font-black text-muted-foreground">{index + 1}</span>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary overflow-hidden shrink-0">
                    {row.avatar_url ? <img src={row.avatar_url} alt="" className="h-full w-full object-cover" /> : row.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{row.name}</span>
                  <span className="text-xs font-bold text-muted-foreground">{row.pages}p</span>
                </div>
              ))}
            </div>

            {!meInTop && rank > 0 && (
              <>
                <div className="my-3 border-t border-dashed border-border" />
                <div className="rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2.5 flex items-center gap-3">
                  <span className="w-6 text-center text-sm font-black text-primary">#{rank}</span>
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {studentName.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">Você</span>
                  <span className="text-xs font-bold text-primary">agora</span>
                </div>
              </>
            )}

            <Button variant="outline" onClick={onStats} className="w-full mt-4 gap-2">
              <BarChart3 className="h-4 w-4" /> Ver evolução
            </Button>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Missões de hoje</p>
                <h2 className="text-lg font-bold mt-1">Seu ritmo de leitura</h2>
              </div>
              <Target className="h-5 w-5 text-accent" />
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">Avançar na leitura</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dailyGoal > 0 ? `Leia ${dailyGoal} pág. hoje.` : "Continue registrando suas páginas."}
                  </p>
                  {dailyGoal > 0 && (
                    <div className="mt-3">
                      <Progress value={goalProgress} className="h-2" />
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                        <span>{dailyPagesRead} pág.</span>
                        <span>{goalProgress}%</span>
                      </div>
                    </div>
                  )}
                </div>
                {goalProgress >= 100 && <Check className="h-5 w-5 text-emerald-500 shrink-0" />}
              </div>
            </div>

            <button
              type="button"
              onClick={onActivities}
              className="mt-3 w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-left hover:bg-muted/35 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">Atividades</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pendingActivities > 0 ? `${pendingActivities} aguardando você.` : "Nada pendente por enquanto."}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>

            {classChallenge && (
              <div className="mt-3 rounded-2xl border border-border bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-amber-400/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{classChallenge.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{classChallenge.description || `Meta da turma: ${classChallenge.goal_value}.`}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Megaphone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Continuidade</p>
                <p className="text-sm font-bold mt-1">{daysRemaining > 0 ? `${daysRemaining} dias restantes` : "Continue no seu ritmo"}</p>
                <p className="text-xs text-muted-foreground mt-1">Volte amanhã e continue de onde parou.</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onAnnouncements} className="w-full mt-3 justify-between">
              Avisos da turma <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="hidden xl:block rounded-3xl border border-primary/15 bg-primary/[0.04] p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
              <Sparkles className="h-4 w-4" /> Progresso
            </div>
            <p className="text-2xl font-bold mt-2">{progressPercent}%</p>
            <p className="text-xs text-muted-foreground mt-1">do livro concluído</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={onStats} className="flex-1">Evolução</Button>
              <Button size="sm" variant="outline" onClick={onContinueReading} className="flex-1">Ler</Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EduStudentHome;
