import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle2, Flag, Lightbulb, MessageCircle, Pause, Play, Sparkles, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import { useUserStats } from "@/hooks/useUserStats";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Metodologia pedagógica interna: usada para organizar eventos e acompanhamento, sem aparecer como nomenclatura da interface.
const LEARNING_METHOD = { observe: "ler", engage: "engajar", interpret: "interpretar", advance: "avançar" } as const;

const MOMENTS = [
  ["discovery", "🔎", "Descoberta"], ["character", "🎭", "Personagem"],
  ["reaction", "💭", "Minha reação"], ["important", "❗", "Parte importante"],
  ["question", "❓", "Não entendi"], ["liked", "❤️", "Gostei muito"],
] as const;

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;

const EduJornada = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { studentClasses } = useEduRole();
  const { essencia } = useUserStats();
  const [page, setPage] = useState(0);
  const [pageDraft, setPageDraft] = useState("0");
  const [target, setTarget] = useState(20);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedPage, setStartedPage] = useState(0);
  const [moment, setMoment] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [moments, setMoments] = useState<any[]>([]);
  const lastTick = useRef(Date.now());

  const currentClass = useMemo(() => (studentClasses as any[]).find((item) => item.id === classId), [studentClasses, classId]);
  const totalPages = Number(currentClass?.total_pages || 0);
  const progress = totalPages ? Math.min(100, Math.round(page / totalPages * 100)) : 0;

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?redirect=/edu/aluno");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!currentClass || !user) return;
    (async () => {
      const { data } = await supabase.from("class_reading_progress").select("current_page").eq("class_id", currentClass.id).eq("user_id", user.id).maybeSingle();
      const saved = Number(data?.current_page || 0);
      setPage(saved); setPageDraft(String(saved));
    })();
  }, [currentClass?.id, user?.id]);

  useEffect(() => {
    if (!running) return;
    lastTick.current = Date.now();
    const timer = window.setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTick.current) / 1000);
      if (delta > 0) { setElapsed((value) => value + delta); lastTick.current = now; }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const emit = async (eventType: string, payload: Record<string, unknown> = {}) => {
    if (!user || !currentClass) return;
    const { error } = await supabase.from("edu_journey_events" as any).insert({
      event_id: crypto.randomUUID(), user_id: user.id, class_id: currentClass.id,
      session_id: sessionId, event_type: eventType, page_number: page, payload,
    });
    if (error && !/duplicate key/i.test(error.message)) console.error(error);
  };

  const savePage = async () => {
    if (!user || !currentClass) return;
    const next = Math.max(0, Math.min(totalPages || Number(pageDraft), Number(pageDraft) || 0));
    const previous = page;
    setPage(next); setPageDraft(String(next));
    const { error } = await supabase.from("class_reading_progress").upsert({
      user_id: user.id, class_id: currentClass.id, current_page: next,
      last_read_date: new Date().toISOString().slice(0, 10),
      pages_read_today: Math.max(0, next - previous),
      is_up_to_date: totalPages > 0 ? next >= totalPages : false,
    }, { onConflict: "user_id,class_id" });
    if (error) toast.error("Não consegui salvar a página.");
    else await emit("page_updated", { previous_page: previous, current_page: next });
  };

  const start = async () => {
    if (!user || !currentClass) return;
    const { data, error } = await supabase.from("edu_reading_sessions" as any).insert({
      user_id: user.id, class_id: currentClass.id, book_id: currentClass.book_id,
      started_page: page, target_minutes: target, chapter_number: null,
    }).select("id").single();
    if (error) { toast.error("Não foi possível iniciar a sessão."); return; }
    setSessionId((data as any)?.id ?? null); setStartedPage(page); setElapsed(0); setRunning(true);
    await emit("reading_session_started", { target_minutes: target, stage: LEARNING_METHOD.observe });
  };

  const pause = async () => {
    if (!sessionId || !user) return;
    await supabase.from("edu_reading_sessions" as any).update({ status: "paused", elapsed_seconds: elapsed, paused_at: new Date().toISOString() }).eq("id", sessionId).eq("user_id", user.id);
    setRunning(false); await emit("reading_session_paused", { elapsed_seconds: elapsed });
  };

  const finish = async () => {
    if (!sessionId || !user || !currentClass) return;
    await savePage();
    const { error } = await supabase.from("edu_reading_sessions" as any).update({
      status: "completed", ended_page: page, elapsed_seconds: elapsed, completed_at: new Date().toISOString(),
    }).eq("id", sessionId).eq("user_id", user.id).neq("status", "completed");
    if (error) { toast.error("Não foi possível finalizar."); return; }
    setRunning(false); await emit("reading_session_completed", {
      elapsed_seconds: elapsed, pages_advanced: Math.max(0, page - startedPage),
      target_reached: elapsed >= target * 60, stage: LEARNING_METHOD.advance,
    });
    toast.success("Sessão concluída. Sua jornada foi atualizada.");
    setSessionId(null);
  };

  const saveMoment = async () => {
    if (!user || !currentClass || !moment || page < 1) return;
    const { data, error } = await supabase.from("edu_student_moments" as any).insert({
      user_id: user.id, class_id: currentClass.id, session_id: sessionId,
      page_number: page, moment_type: moment, note: note.trim() || null,
    }).select("*").single();
    if (error) { toast.error("Não foi possível salvar."); return; }
    setMoments((items) => [data, ...items]); setMoment(null); setNote("");
    await emit("annotation_created", { moment_type: moment, note: note.trim() || null });
  };

  if (authLoading || !currentClass) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando sua jornada…</div>;

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/edu/aluno")}><ArrowLeft className="h-4 w-4 mr-1" />Jornada</Button>
          <div className="text-right"><p className="font-semibold">{currentClass.book_title || "Livro da turma"}</p><p className="text-xs text-muted-foreground">{currentClass.name}</p></div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-5 space-y-4">
        <Card className="border-primary/20">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3"><div><Badge>Sessão de leitura</Badge><h1 className="text-2xl font-bold mt-2">Leia no seu ritmo.</h1><p className="text-sm text-muted-foreground">Registre sua leitura e marque o que chamou sua atenção.</p></div><div className="text-sm font-semibold">{progress}%</div></div>
            <Progress value={progress} className="h-2 mt-4" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-4">
          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4" />Leitura</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Página atual</p><div className="flex items-center gap-2 mt-2"><Input value={pageDraft} onChange={(e) => setPageDraft(e.target.value)} onBlur={savePage} type="number" min={0} max={totalPages || undefined} className="w-28" /><span className="text-sm text-muted-foreground">de {totalPages || "—"}</span></div></div>
            <div className="rounded-xl border p-4"><div className="flex justify-between"><div><p className="text-xs text-muted-foreground">Tempo</p><p className="text-2xl font-bold">{formatTime(elapsed)}</p></div><div className="text-right"><p className="text-xs text-muted-foreground">Meta</p><Input value={target} onChange={(e) => setTarget(Math.max(5, Number(e.target.value) || 20))} type="number" min={5} max={90} className="w-20 h-8" /></div></div><Progress value={Math.min(100, elapsed / (target * 60) * 100)} className="h-2 mt-3" />{elapsed >= target * 60 && <p className="text-sm text-primary font-semibold mt-3">🎉 Meta alcançada. Você pode continuar ou finalizar.</p>}<div className="flex gap-2 mt-4">{!sessionId ? <Button onClick={start} className="gap-2"><Play className="h-4 w-4" />Começar sessão</Button> : running ? <><Button variant="outline" onClick={pause} className="gap-2"><Pause className="h-4 w-4" />Pausar</Button><Button onClick={finish} className="gap-2"><CheckCircle2 className="h-4 w-4" />Finalizar</Button></> : <><Button onClick={start} variant="outline" className="gap-2"><Play className="h-4 w-4" />Retomar</Button><Button onClick={finish} className="gap-2"><CheckCircle2 className="h-4 w-4" />Finalizar</Button></>}</div></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4" />Próximo passo</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm text-muted-foreground">Sua leitura fica registrada aqui. Ao terminar, siga para uma atividade ou reflexão da turma.</p><Button className="w-full gap-2" variant="outline" onClick={() => navigate("/edu/aluno")}><MessageCircle className="h-4 w-4" />Ver próxima atividade</Button><div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground flex gap-2"><Sparkles className="h-4 w-4 shrink-0" />O progresso e as ações da sessão ficam conectados à sua jornada.</div></CardContent></Card>
        </div>

        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Flag className="h-4 w-4" />Momentos da leitura</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{MOMENTS.map(([type, icon, label]) => <button key={type} onClick={() => setMoment(type)} className="rounded-lg border p-3 text-left hover:border-primary/50 transition-colors"><span className="text-lg">{icon}</span><p className="text-xs font-medium mt-1">{label}</p></button>)}</div>{moment && <div className="rounded-xl border bg-muted/20 p-4 space-y-3"><p className="text-sm font-semibold">Página {page} · {MOMENTS.find((m) => m[0] === moment)?.[2]}</p><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anotação opcional…" rows={3} /><div className="flex gap-2"><Button onClick={saveMoment}>Salvar momento</Button><Button variant="ghost" onClick={() => setMoment(null)}>Cancelar</Button></div></div>}{moments.length > 0 && <div className="space-y-2 pt-2"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Seus momentos</p>{moments.slice(0, 5).map((item) => <div key={item.id} className="text-sm">Página {item.page_number} · {item.note || item.moment_type}</div>)}</div>}</CardContent></Card>

        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4" />Seu próximo passo</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Ao concluir a sessão, o próximo passo fica claro na sua Home. Sua Essência atual: <strong>{essencia}</strong>.</p></CardContent></Card>
      </main>
    </div>
  );
};
export default EduJornada;
