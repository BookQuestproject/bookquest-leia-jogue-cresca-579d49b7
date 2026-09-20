import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, BookOpen, CheckCircle2, ChevronDown, Flag, Heart, HelpCircle,
  Lightbulb, MessageCircle, Pause, Play, Sparkles, Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// A metodologia pedagógica é usada somente como telemetria e organização interna.
const LEARNING_METHOD = {
  observe: "ler",
  engage: "engajar",
  interpret: "interpretar",
  advance: "avançar",
} as const;

const MOMENTS = [
  { type: "discovery", label: "Descoberta", icon: Lightbulb },
  { type: "character", label: "Personagem", icon: Users },
  { type: "reaction", label: "Minha reação", icon: MessageCircle },
  { type: "important", label: "Parte importante", icon: Flag },
  { type: "question", label: "Não entendi", icon: HelpCircle },
  { type: "liked", label: "Gostei muito", icon: Heart },
] as const;

type Phase = "ready" | "reading" | "summary";

type ChapterInfo = {
  journeyId: string | null;
  chapterNumber: number;
  title: string;
  startPage: number;
  endPage: number;
};

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;

const EduJornada = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { studentClasses } = useEduRole();

  const [page, setPage] = useState(0);
  const [pageDraft, setPageDraft] = useState("0");
  const [target, setTarget] = useState(20);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("ready");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedPage, setStartedPage] = useState(0);
  const [chapterInfo, setChapterInfo] = useState<ChapterInfo | null>(null);
  const [showTools, setShowTools] = useState(false);
  const [moment, setMoment] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [moments, setMoments] = useState<any[]>([]);
  const [loadingContext, setLoadingContext] = useState(true);
  const [savingPage, setSavingPage] = useState(false);
  const lastTick = useRef(Date.now());

  const currentClass = useMemo(
    () => (studentClasses as any[]).find((item) => item.id === classId),
    [studentClasses, classId],
  );
  const totalPages = Number(currentClass?.total_pages || 0);
  const progress = totalPages ? Math.min(100, Math.round((page / totalPages) * 100)) : 0;

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?redirect=/edu/aluno");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!currentClass || !user) return;
    (async () => {
      setLoadingContext(true);
      const [{ data: progressRow }, { data: link }] = await Promise.all([
        supabase
          .from("class_reading_progress")
          .select("current_page")
          .eq("class_id", currentClass.id)
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("edu_journey_classes" as any)
          .select("journey_id")
          .eq("class_id", currentClass.id)
          .limit(1)
          .maybeSingle(),
      ]);

      const saved = Number((progressRow as any)?.current_page || 0);
      setPage(saved);
      setPageDraft(String(saved));

      const journeyId = (link as any)?.journey_id ?? null;
      let title = `Capítulo 1`;
      let chapterNumber = 1;
      let startPage = 1;
      let endPage = totalPages || 0;

      if (journeyId) {
        const [{ data: journey }, { data: chapters }] = await Promise.all([
          supabase.from("edu_journeys" as any).select("total_chapters").eq("id", journeyId).maybeSingle(),
          supabase
            .from("edu_journey_chapters" as any)
            .select("chapter_number,title,start_page,end_page")
            .eq("journey_id", journeyId)
            .order("chapter_number", { ascending: true }),
        ]);

        const chapterRows = (chapters as any[]) || [];
        const exact = chapterRows.find((x) => saved >= x.start_page && saved <= x.end_page);
        if (exact) {
          chapterNumber = exact.chapter_number;
          title = exact.title || `Capítulo ${chapterNumber}`;
          startPage = exact.start_page;
          endPage = exact.end_page;
        } else {
          const totalChapters = Math.max(1, Number((journey as any)?.total_chapters || chapterRows.length || 1));
          const size = totalPages ? Math.ceil(totalPages / totalChapters) : 1;
          chapterNumber = Math.min(totalChapters, Math.max(1, saved > 0 ? Math.ceil(saved / size) : 1));
          startPage = (chapterNumber - 1) * size + 1;
          endPage = totalPages ? Math.min(totalPages, chapterNumber * size) : chapterNumber * size;
          title = `Capítulo ${chapterNumber}`;
        }
      } else if (totalPages) {
        endPage = totalPages;
      }

      setChapterInfo({ journeyId, chapterNumber, title, startPage, endPage });
      setLoadingContext(false);
    })();
  }, [currentClass?.id, user?.id, totalPages]);

  useEffect(() => {
    if (!running) return;
    lastTick.current = Date.now();
    const timer = window.setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTick.current) / 1000);
      if (delta > 0) {
        setElapsed((value) => value + delta);
        lastTick.current = now;
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const emit = async (
    eventType: string,
    payload: Record<string, unknown> = {},
    overrideSessionId?: string | null,
  ) => {
    if (!user || !currentClass) return;
    const { error } = await supabase.from("edu_journey_events" as any).insert({
      event_id: crypto.randomUUID(),
      user_id: user.id,
      class_id: currentClass.id,
      session_id: overrideSessionId ?? sessionId,
      event_type: eventType,
      chapter_number: chapterInfo?.chapterNumber ?? null,
      page_number: page,
      payload,
    });
    if (error && !/duplicate key/i.test(error.message)) console.error(error);
  };

  const persistPage = async () => {
    if (!user || !currentClass) return page;
    const parsed = Number(pageDraft);
    if (!Number.isFinite(parsed)) {
      toast.error("Digite uma página válida.");
      return page;
    }
    const next = Math.max(0, Math.min(totalPages || parsed, Math.round(parsed)));
    const previous = page;
    setSavingPage(true);
    const { error } = await supabase.from("class_reading_progress").upsert({
      user_id: user.id,
      class_id: currentClass.id,
      current_page: next,
      last_read_date: new Date().toISOString().slice(0, 10),
      pages_read_today: Math.max(0, next - previous),
      is_up_to_date: totalPages > 0 ? next >= totalPages : false,
    }, { onConflict: "user_id,class_id" });
    setSavingPage(false);
    if (error) {
      toast.error("Não consegui salvar a página.");
      return page;
    }
    setPage(next);
    setPageDraft(String(next));
    if (next !== previous) {
      await emit("page_updated", { previous_page: previous, current_page: next });
    }
    return next;
  };

  const start = async () => {
    if (!user || !currentClass || !chapterInfo) return;
    const startPageValue = await persistPage();
    const { data, error } = await supabase.from("edu_reading_sessions" as any).insert({
      user_id: user.id,
      class_id: currentClass.id,
      book_id: currentClass.book_id,
      started_page: startPageValue,
      target_minutes: target,
      chapter_number: chapterInfo.chapterNumber,
    }).select("id").single();

    if (error) {
      toast.error("Não foi possível iniciar a sessão.");
      return;
    }

    const id = (data as any)?.id ?? null;
    setSessionId(id);
    setStartedPage(startPageValue);
    setElapsed(0);
    setRunning(true);
    setPhase("reading");
    await emit("reading_session_started", {
      target_minutes: target,
      stage: LEARNING_METHOD.observe,
      chapter_number: chapterInfo.chapterNumber,
    }, id);
  };

  const pause = async () => {
    if (!sessionId || !user) return;
    await supabase.from("edu_reading_sessions" as any).update({
      status: "paused",
      elapsed_seconds: elapsed,
      paused_at: new Date().toISOString(),
    }).eq("id", sessionId).eq("user_id", user.id);
    setRunning(false);
    await emit("reading_session_paused", { elapsed_seconds: elapsed });
  };

  const resume = () => {
    setRunning(true);
    setPhase("reading");
    void emit("reading_session_resumed", { elapsed_seconds: elapsed, stage: LEARNING_METHOD.engage });
  };

  const finish = async () => {
    if (!sessionId || !user || !currentClass) return;
    const finalPage = await persistPage();
    const { error } = await supabase.from("edu_reading_sessions" as any).update({
      status: "completed",
      ended_page: finalPage,
      elapsed_seconds: elapsed,
      completed_at: new Date().toISOString(),
    }).eq("id", sessionId).eq("user_id", user.id).neq("status", "completed");

    if (error) {
      toast.error("Não foi possível finalizar a sessão.");
      return;
    }

    setRunning(false);
    await emit("reading_session_completed", {
      elapsed_seconds: elapsed,
      pages_advanced: Math.max(0, finalPage - startedPage),
      target_reached: elapsed >= target * 60,
      stage: LEARNING_METHOD.advance,
    });
    setPhase("summary");
    setShowTools(false);
    setMoment(null);
    toast.success("Sessão encerrada. Veja o que vem agora.");
  };

  const saveMoment = async () => {
    if (!user || !currentClass || !moment || page < 1) {
      toast.error("Salve uma página válida antes de registrar um momento.");
      return;
    }
    const { data, error } = await supabase.from("edu_student_moments" as any).insert({
      user_id: user.id,
      class_id: currentClass.id,
      session_id: sessionId,
      page_number: page,
      moment_type: moment,
      note: note.trim() || null,
      chapter_number: chapterInfo?.chapterNumber ?? null,
    }).select("*").single();

    if (error) {
      toast.error("Não foi possível salvar este momento.");
      return;
    }
    setMoments((items) => [data, ...items]);
    setMoment(null);
    setNote("");
    await emit("annotation_created", { moment_type: moment, note: note.trim() || null });
    toast.success("Momento salvo.");
  };

  const chapterReady = Boolean(chapterInfo && (chapterInfo.endPage === 0 || page >= chapterInfo.endPage));
  const targetProgress = Math.min(100, (elapsed / (target * 60)) * 100);

  if (authLoading || loadingContext || !currentClass || !chapterInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="mt-3 text-sm text-muted-foreground">Preparando sua leitura…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/edu/aluno")}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="min-w-0 text-right">
            <p className="text-sm font-semibold truncate">{currentClass.book_title || "Livro da turma"}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {chapterInfo.title} · página {page}{totalPages ? ` de ${totalPages}` : ""}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        {phase === "ready" && (
          <section className="mx-auto max-w-2xl">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Sua próxima sessão</p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-2">Leia no seu ritmo.</h1>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                {page > 0 ? `Você parou na página ${page}. Vamos continuar de onde a história ficou.` : "Comece uma sessão curta e deixe seu progresso acompanhar a leitura."}
              </p>
            </div>

            <Card className="border-primary/15 shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <Badge variant="outline">Capítulo {chapterInfo.chapterNumber}</Badge>
                    <h2 className="text-xl sm:text-2xl font-bold mt-3">{currentClass.book_title || "Leitura da turma"}</h2>
                    {currentClass.author && <p className="text-sm text-muted-foreground mt-1">{currentClass.author}</p>}
                    <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border border-border px-3 py-1.5">Página {page}</span>
                      <span className="rounded-full border border-border px-3 py-1.5">Meta de {target} min</span>
                    </div>
                  </div>
                </div>

                {totalPages > 0 && (
                  <div className="mt-7">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progresso do livro</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 mt-2" />
                  </div>
                )}

                <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto] items-end">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Meta desta sessão</label>
                    <Input
                      value={target}
                      onChange={(e) => setTarget(Math.max(5, Math.min(90, Number(e.target.value) || 20)))}
                      type="number"
                      min={5}
                      max={90}
                      className="mt-1.5 h-11"
                    />
                  </div>
                  <Button size="lg" onClick={start} className="h-11 px-6 gap-2">
                    <Play className="h-4 w-4" /> Começar leitura
                  </Button>
                </div>
              </CardContent>
            </Card>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Durante a leitura, só o essencial fica à vista. As ferramentas aparecem quando você precisar delas.
            </p>
          </section>
        )}

        {phase === "reading" && (
          <section className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Leitura em foco</p>
                <p className="text-sm text-muted-foreground mt-1">{chapterInfo.title}</p>
              </div>
              <Badge variant="outline">Página {page}</Badge>
            </div>

            <div className="rounded-[28px] border border-primary/15 bg-card shadow-sm overflow-hidden">
              <div className="px-6 sm:px-8 pt-8 pb-6 text-center">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-bold">Tempo de leitura</p>
                <div className="mt-3 text-6xl sm:text-7xl font-semibold tracking-tight tabular-nums">{formatTime(elapsed)}</div>
                <div className="max-w-md mx-auto mt-5">
                  <Progress value={targetProgress} className="h-2" />
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
                    <span>Meta · {target} min</span>
                    <span>{Math.max(0, target * 60 - elapsed) > 0 ? `${formatTime(Math.max(0, target * 60 - elapsed))} restantes` : "Meta alcançada"}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/70 px-6 sm:px-8 py-6">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto] items-end">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Página atual</label>
                    <Input
                      value={pageDraft}
                      onChange={(e) => setPageDraft(e.target.value)}
                      type="number"
                      min={0}
                      max={totalPages || undefined}
                      className="mt-1.5 h-11 text-base"
                    />
                  </div>
                  <Button variant="outline" onClick={persistPage} disabled={savingPage} className="h-11">
                    {savingPage ? "Salvando…" : "Salvar página"}
                  </Button>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                  {running ? (
                    <Button variant="outline" size="lg" onClick={pause} className="sm:flex-1 gap-2">
                      <Pause className="h-4 w-4" /> Pausar
                    </Button>
                  ) : (
                    <Button variant="outline" size="lg" onClick={resume} className="sm:flex-1 gap-2">
                      <Play className="h-4 w-4" /> Retomar
                    </Button>
                  )}
                  <Button size="lg" onClick={finish} disabled={savingPage} className="sm:flex-[1.2] gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Encerrar sessão
                  </Button>
                </div>
              </div>

              <button
                onClick={() => setShowTools((value) => !value)}
                className="w-full border-t border-border/70 px-6 sm:px-8 py-4 flex items-center justify-between text-sm font-semibold hover:bg-muted/30 transition-colors"
                aria-expanded={showTools}
              >
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Ferramentas da leitura
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showTools ? "rotate-180" : ""}`} />
              </button>

              {showTools && (
                <div className="border-t border-border/70 px-6 sm:px-8 py-6 bg-muted/15">
                  <p className="text-sm text-muted-foreground mb-3">Registre algo que merece ficar com você.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MOMENTS.map(({ type, label, icon: Icon }) => (
                      <button
                        key={type}
                        onClick={() => setMoment(type)}
                        className={`rounded-2xl border p-3 text-left transition-all ${moment === type ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/30"}`}
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        <p className="text-xs font-semibold mt-2">{label}</p>
                      </button>
                    ))}
                  </div>

                  {moment && (
                    <div className="mt-4 rounded-2xl border border-border bg-card p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">
                          Página {page} · {MOMENTS.find((item) => item.type === moment)?.label}
                        </p>
                        <button onClick={() => setMoment(null)} className="text-xs text-muted-foreground hover:text-foreground">Cancelar</button>
                      </div>
                      <Textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Anotação opcional…"
                        rows={3}
                      />
                      <Button onClick={saveMoment} className="gap-2">
                        <Flag className="h-4 w-4" /> Salvar momento
                      </Button>
                    </div>
                  )}

                  {moments.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-border/70">
                      <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Seus últimos momentos</p>
                      <div className="mt-2 space-y-2">
                        {moments.slice(0, 4).map((item) => (
                          <div key={item.id} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span className="text-muted-foreground">Página {item.page_number}</span>
                            <span className="font-medium">{MOMENTS.find((m) => m.type === item.moment_type)?.label || item.moment_type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {phase === "summary" && (
          <section className="mx-auto max-w-3xl">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Sessão concluída</p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-2">Você avançou.</h1>
              <p className="text-base text-muted-foreground mt-3">A leitura ficou registrada. Agora a jornada te mostra o próximo passo.</p>
            </div>

            <Card className="border-primary/15 shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs text-muted-foreground">Tempo</p>
                    <p className="text-2xl font-bold mt-1">{formatTime(elapsed)}</p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs text-muted-foreground">Página</p>
                    <p className="text-2xl font-bold mt-1">{page}</p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs text-muted-foreground">Avanço</p>
                    <p className="text-2xl font-bold mt-1">+{Math.max(0, page - startedPage)}</p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs text-muted-foreground">Momentos</p>
                    <p className="text-2xl font-bold mt-1">{moments.length}</p>
                  </div>
                </div>

                <div className="mt-7 rounded-2xl bg-primary/5 border border-primary/15 p-5">
                  <p className="text-xs uppercase tracking-wider font-bold text-primary">Próximo passo</p>
                  <h2 className="text-xl font-bold mt-2">
                    {chapterReady ? `Explore o que você percebeu em ${chapterInfo.title}.` : `Continue a leitura até o fim de ${chapterInfo.title}.`}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {chapterReady
                      ? "As experiências de capítulo transformam suas descobertas, escolhas e previsões em parte da sua jornada."
                      : `O capítulo segue até a página ${chapterInfo.endPage || "final"}. Depois da leitura, suas experiências ficam liberadas sem spoilers.`}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-7">
                  <Button variant="outline" onClick={() => { setPhase("reading"); setRunning(false); }} className="sm:flex-1">
                    Voltar para a sessão
                  </Button>
                  {chapterReady ? (
                    <Button
                      onClick={() => navigate(`/edu/experiencias/${classId}/${chapterInfo.chapterNumber}`)}
                      className="sm:flex-[1.25] gap-2"
                    >
                      Explorar capítulo <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  ) : (
                    <Button onClick={() => { setPhase("ready"); setSessionId(null); setElapsed(0); }} className="sm:flex-[1.25] gap-2">
                      Continuar leitura <Play className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
};

export default EduJornada;
