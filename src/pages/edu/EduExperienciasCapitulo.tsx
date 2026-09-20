import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Compass, Eye, Heart,
  Lightbulb, ListOrdered, MessageCircle, Sparkles, Target, Users,
  WandSparkles, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Experience = {
  id: string;
  journey_id: string | null;
  chapter_number: number;
  experience_type: string;
  area: string;
  title: string;
  prompt: string;
  payload: {
    options?: string[];
    correctIndex?: number;
    correctIndices?: number[];
    correct?: boolean;
    min?: number;
    max?: number;
    minLabel?: string;
    maxLabel?: string;
    items?: string[];
    feedback?: string;
    [key: string]: unknown;
  };
  sort_order: number;
  isLegacy?: boolean;
  legacyQuestionId?: string;
};

type StoredResponse = {
  experience_id: string;
  response: any;
  is_correct: boolean | null;
  feedback: string | null;
};

const AREA_LABELS: Record<string, { label: string; icon: any; tone: string }> = {
  interpretation: { label: "Interpretação", icon: Eye, tone: "bg-primary/10 text-primary border-primary/20" },
  connection: { label: "Opinião e conexão", icon: Heart, tone: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  character: { label: "Personagens", icon: Users, tone: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  plot: { label: "Enredo", icon: ListOrdered, tone: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
  discovery: { label: "Descoberta", icon: Lightbulb, tone: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  prediction: { label: "Previsão", icon: Compass, tone: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
  immersion: { label: "Imersão", icon: WandSparkles, tone: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  voice: { label: "Sua voz", icon: MessageCircle, tone: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20" },
};

const fallbackArea = (type: string) =>
  ["prediction", "clue"].includes(type) ? "discovery" :
  ["character_traits"].includes(type) ? "character" :
  ["atmosphere"].includes(type) ? "immersion" :
  ["scale", "open_text", "short_text", "complete_sentence"].includes(type) ? "voice" :
  "interpretation";

const normalizeLegacy = (rows: any[]): Experience[] =>
  rows.map((row, index) => ({
    id: "legacy:" + row.id,
    journey_id: null,
    chapter_number: row.chapter_number || 1,
    experience_type: "open_text",
    area: "voice",
    title: "Uma pergunta sobre o que você percebeu",
    prompt: row.question_text,
    payload: {
      legacy: true,
      feedback: "Sua leitura foi registrada para o professor.",
    },
    sort_order: index,
    isLegacy: true,
    legacyQuestionId: row.id,
  }));

const moveItem = (items: string[], index: number, direction: -1 | 1) => {
  const next = [...items];
  const target = index + direction;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

const ExperienceRenderer = ({
  experience,
  value,
  setValue,
}: {
  experience: Experience;
  value: any;
  setValue: (value: any) => void;
}) => {
  const options = experience.payload.options || [];
  const type = experience.experience_type;

  if (["multiple_choice", "atmosphere", "character_traits", "evidence", "clue"].includes(type)) {
    const multiple = ["character_traits", "evidence"].includes(type);
    const selected = multiple ? (Array.isArray(value) ? value : []) : value;
    return (
      <div className="space-y-2.5">
        {options.map((option, index) => {
          const active = multiple ? selected.includes(index) : selected === index;
          return (
            <button
              key={option + index}
              type="button"
              onClick={() => {
                if (multiple) {
                  setValue(active ? selected.filter((x: number) => x !== index) : [...selected, index]);
                } else setValue(index);
              }}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${active
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"}`}
              aria-pressed={active}
            >
              <span className="flex items-center gap-3">
                <span className={`h-9 w-9 rounded-xl border flex items-center justify-center text-sm font-bold ${active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
                  {active ? <Check className="h-4 w-4" /> : String.fromCharCode(65 + index)}
                </span>
                <span className="text-sm font-medium text-foreground">{option}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (type === "multi_select") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option, index) => {
          const active = selected.includes(index);
          return (
            <button
              key={option + index}
              type="button"
              onClick={() => setValue(active ? selected.filter((x: number) => x !== index) : [...selected, index])}
              className={`rounded-xl border p-3 text-left transition-all ${active ? "border-primary bg-primary/10" : "border-border hover:bg-muted/40"}`}
              aria-pressed={active}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className={`h-5 w-5 rounded-md border flex items-center justify-center ${active ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                  {active && <Check className="h-3.5 w-3.5" />}
                </span>
                {option}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (type === "true_false") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[["Verdadeiro", true], ["Falso", false]].map(([label, answer]) => (
          <button
            key={String(label)}
            type="button"
            onClick={() => setValue(answer)}
            className={`rounded-2xl border p-5 text-center text-sm font-bold transition-all ${value === answer ? "border-primary bg-primary/10" : "border-border hover:bg-muted/40"}`}
            aria-pressed={value === answer}
          >
            <span className="block text-lg mb-1">{value === answer ? "✓" : "○"}</span>
            {String(label)}
          </button>
        ))}
      </div>
    );
  }

  if (type === "scale" || type === "slider") {
    const min = Number(experience.payload.min ?? 1);
    const max = Number(experience.payload.max ?? 5);
    const current = Number(value ?? Math.ceil((min + max) / 2));
    return (
      <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-end justify-between">
          <span className="text-xs text-muted-foreground">{experience.payload.minLabel || "Discordo"}</span>
          <span className="text-3xl font-bold text-foreground">{current}</span>
          <span className="text-xs text-muted-foreground">{experience.payload.maxLabel || "Concordo"}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={current}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full accent-[hsl(var(--primary))]"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          {Array.from({ length: Math.min(7, max - min + 1) }, (_, i) => min + i).map((n) => <span key={n}>{n}</span>)}
        </div>
      </div>
    );
  }

  if (type === "order" || type === "chronology") {
    const items = Array.isArray(value) && value.length ? value : (experience.payload.items || options);
    return (
      <div className="space-y-2">
        {items.map((item: string, index: number) => (
          <div key={item + index} className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
            <span className="text-xs font-bold text-muted-foreground w-5">{index + 1}</span>
            <span className="flex-1 text-sm font-medium">{item}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setValue(moveItem(items, index, -1))} disabled={index === 0} aria-label="Mover para cima">↑</Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setValue(moveItem(items, index, 1))} disabled={index === items.length - 1} aria-label="Mover para baixo">↓</Button>
          </div>
        ))}
      </div>
    );
  }

  if (type === "cause_effect") {
    const causes = experience.payload.causes || options;
    const effects = experience.payload.effects || [];
    return (
      <div className="space-y-3">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">O que causou o acontecimento?</label>
        <select className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm" value={value?.cause ?? ""} onChange={(e) => setValue({ ...(value || {}), cause: Number(e.target.value) })}>
          <option value="">Selecione uma causa</option>
          {causes.map((x: string, i: number) => <option key={x + i} value={i}>{x}</option>)}
        </select>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">E qual foi a consequência?</label>
        <select className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm" value={value?.effect ?? ""} onChange={(e) => setValue({ ...(value || {}), effect: Number(e.target.value) })}>
          <option value="">Selecione uma consequência</option>
          {effects.map((x: string, i: number) => <option key={x + i} value={i}>{x}</option>)}
        </select>
      </div>
    );
  }

  const isShort = ["short_text", "complete_sentence"].includes(type);
  return isShort
    ? <Input value={value || ""} onChange={(e) => setValue(e.target.value)} placeholder={type === "complete_sentence" ? 'Complete: "Depois deste capítulo, eu fiquei pensando em..."' : "Escreva sua resposta"} />
    : <Textarea value={value || ""} onChange={(e) => setValue(e.target.value)} rows={5} placeholder="Escreva com suas próprias palavras. Não precisa ser longo." />;
};

const EduExperienciasCapitulo = () => {
  const { classId, chapterNumber: chapterParam } = useParams<{ classId: string; chapterNumber: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const chapterNumber = Math.max(1, Number(chapterParam || 1));

  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [className, setClassName] = useState("Sua turma");
  const [bookTitle, setBookTitle] = useState("Livro da turma");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [responses, setResponses] = useState<StoredResponse[]>([]);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState(false);
  const [storyCounts, setStoryCounts] = useState({ interpretation: 0, characters: 0, discoveries: 0, opinions: 0, predictions: 0, words: 0 });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?redirect=/edu/aluno");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!classId || !user) return;
    (async () => {
      setLoading(true);
      const [{ data: cls }, { data: link }, { data: legacy }] = await Promise.all([
        supabase.from("classes").select("name,book_title").eq("id", classId).maybeSingle(),
        supabase.from("edu_journey_classes" as any).select("journey_id").eq("class_id", classId).limit(1).maybeSingle(),
        supabase.from("class_questions").select("id,chapter_number,question_text").eq("class_id", classId).eq("chapter_number", chapterNumber).order("created_at", { ascending: true }),
      ]);

      setClassName((cls as any)?.name || "Sua turma");
      setBookTitle((cls as any)?.book_title || "Livro da turma");

      const jid = (link as any)?.journey_id ?? null;
      setJourneyId(jid);

      let loaded: Experience[] = [];
      if (jid) {
        const { data } = await supabase
          .from("edu_chapter_experiences" as any)
          .select("*")
          .eq("journey_id", jid)
          .eq("chapter_number", chapterNumber)
          .eq("is_active", true)
          .order("sort_order", { ascending: true });
        loaded = (data as Experience[]) || [];
      }

      if (!loaded.length && legacy?.length) loaded = normalizeLegacy(legacy);
      setExperiences(loaded);

      if (loaded.length) {
        const legacyIds = loaded.filter((x) => x.isLegacy).map((x) => x.legacyQuestionId).filter(Boolean);
        const realIds = loaded.filter((x) => !x.isLegacy).map((x) => x.id);
        let stored: StoredResponse[] = [];

        if (realIds.length) {
          const { data } = await supabase.from("edu_chapter_experience_responses" as any)
            .select("experience_id,response,is_correct,feedback")
            .eq("user_id", user.id)
            .eq("class_id", classId)
            .in("experience_id", realIds);
          stored = (data as StoredResponse[]) || [];
        }

        if (legacyIds.length) {
          const { data } = await supabase.from("class_question_responses")
            .select("question_id,response_text")
            .eq("user_id", user.id)
            .in("question_id", legacyIds as string[]);
          stored = stored.concat(((data || []) as any[]).map((x) => ({
            experience_id: "legacy:" + x.question_id,
            response: x.response_text,
            is_correct: null,
            feedback: null,
          })));
        }

        setResponses(stored);
        setStoryCounts({
          interpretation: stored.length,
          characters: stored.filter((r) => experiences.find((e) => e.id === r.experience_id)?.area === "character").length,
          discoveries: stored.filter((r) => ["discovery", "prediction"].includes(experiences.find((e) => e.id === r.experience_id)?.area || "")).length,
          opinions: stored.filter((r) => ["connection", "voice"].includes(experiences.find((e) => e.id === r.experience_id)?.area || "")).length,
          predictions: stored.filter((r) => experiences.find((e) => e.id === r.experience_id)?.experience_type === "prediction").length,
          words: stored.filter((r) => experiences.find((e) => e.id === r.experience_id)?.experience_type === "vocabulary").length,
        });
      }

      setLoading(false);
    })();
  }, [classId, chapterNumber, user, authLoading, navigate]);

  useEffect(() => {
    if (!experiences.length) return;
    const firstPending = experiences.findIndex((e) => !responses.some((r) => r.experience_id === e.id));
    setStep(firstPending >= 0 ? firstPending : experiences.length);
  }, [experiences, responses]);

  const current = experiences[step];
  const area = current ? (AREA_LABELS[current.area] || AREA_LABELS[fallbackArea(current.experience_type)]) : AREA_LABELS.interpretation;
  const AreaIcon = area.icon;

  const canAnswer = useMemo(() => {
    if (!current) return false;
    const value = answers[current.id];
    if (["multiple_choice", "true_false", "scale", "slider"].includes(current.experience_type)) return value !== undefined && value !== null;
    if (["multi_select", "character_traits", "evidence"].includes(current.experience_type)) return Array.isArray(value) && value.length > 0;
    if (["order", "chronology"].includes(current.experience_type)) return Array.isArray(value) && value.length > 0;
    if (current.experience_type === "cause_effect") return value?.cause !== undefined && value?.effect !== undefined;
    return typeof value === "string" ? value.trim().length >= 2 : value !== undefined && value !== null;
  }, [current, answers]);

  const saveCurrent = async () => {
    if (!current || !classId || !user || saving || !canAnswer) return;
    setSaving(true);

    let isCorrect: boolean | null = null;
    let feedback = current.payload.feedback || null;
    const value = answers[current.id];

    if (current.experience_type === "multiple_choice") {
      isCorrect = Number(value) === Number(current.payload.correctIndex);
      feedback = isCorrect
        ? feedback || "Você percebeu uma relação importante no capítulo."
        : feedback || "Quase. Vale voltar ao trecho e observar o que aconteceu antes.";
    } else if (current.experience_type === "true_false") {
      isCorrect = Boolean(value) === Boolean(current.payload.correct);
      feedback = isCorrect
        ? feedback || "Isso. Sua leitura encontrou a informação central."
        : feedback || "Observe novamente o trecho antes de decidir.";
    } else if (current.experience_type === "multi_select") {
      const expected = [...(current.payload.correctIndices || [])].sort().join(",");
      const actual = [...(value || [])].sort().join(",");
      isCorrect = Boolean(current.payload.correctIndices) && expected === actual;
      feedback = isCorrect
        ? feedback || "Boa leitura dos detalhes."
        : feedback || "Revise os detalhes que sustentam sua escolha.";
    }

    let ok = true;
    if (current.isLegacy) {
      const { error } = await supabase.from("class_question_responses").upsert({
        question_id: current.legacyQuestionId,
        user_id: user.id,
        response_text: String(value),
      }, { onConflict: "question_id,user_id" } as any);
      ok = !error;
    } else {
      const { error } = await supabase.from("edu_chapter_experience_responses" as any).upsert({
        experience_id: current.id,
        user_id: user.id,
        class_id: classId,
        response: value,
        is_correct: isCorrect,
        feedback,
        answered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "experience_id,user_id,class_id" });
      ok = !error;
    }

    if (!ok) {
      toast.error("Não consegui registrar essa experiência.");
      setSaving(false);
      return;
    }

    await supabase.from("edu_journey_events" as any).insert({
      event_id: crypto.randomUUID(),
      user_id: user.id,
      class_id: classId,
      event_type: "chapter_experience_completed",
      chapter_number: chapterNumber,
      payload: {
        experience_id: current.id,
        experience_type: current.experience_type,
        area: current.area,
        is_correct: isCorrect,
      },
    });

    setResponses((prev) => [
      ...prev.filter((r) => r.experience_id !== current.id),
      { experience_id: current.id, response: value, is_correct: isCorrect, feedback },
    ]);
    setSaving(false);

    window.setTimeout(() => {
      if (step + 1 < experiences.length) {
        setStep(step + 1);
      } else {
        setFinished(true);
      }
    }, 250);
  };

  const completeChapter = async () => {
    if (!classId || !user) return;
    const reflectionCount = responses.length;
    const { error } = await supabase.from("edu_chapter_completions" as any).upsert({
      user_id: user.id,
      class_id: classId,
      journey_id: journeyId,
      chapter_number: chapterNumber,
      reflection_count: reflectionCount,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,class_id,chapter_number" });
    if (error) {
      toast.error("Não consegui concluir o capítulo.");
      return;
    }
    await supabase.from("edu_journey_events" as any).insert({
      event_id: crypto.randomUUID(),
      user_id: user.id,
      class_id: classId,
      event_type: "chapter_completed",
      chapter_number: chapterNumber,
      payload: { reflection_count: reflectionCount },
    });
    toast.success("Capítulo concluído. Sua jornada avançou.");
  };

  const nextChapter = () => {
    navigate(`/edu/experiencias/${classId}/${chapterNumber + 1}`);
    window.scrollTo(0, 0);
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Preparando sua experiência…</div>;
  }

  if (!experiences.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-8 text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center"><Sparkles className="h-6 w-6 text-primary" /></div>
          <h1 className="text-2xl font-bold">Este capítulo ainda está sendo preparado.</h1>
          <p className="text-sm text-muted-foreground">Volte à leitura e continue construindo sua jornada.</p>
          <Button onClick={() => navigate(`/edu/jornada/${classId}`)}>Voltar à leitura</Button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
          <button onClick={() => navigate(`/edu/jornada/${classId}`)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Voltar à leitura
          </button>

          <div className="rounded-3xl border border-primary/20 bg-card p-6 sm:p-9 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0"><CheckCircle2 className="h-6 w-6 text-primary" /></div>
              <div>
                <Badge variant="outline" className="mb-2">Capítulo {chapterNumber}</Badge>
                <h1 className="text-3xl font-bold tracking-tight">Você explorou este capítulo.</h1>
                <p className="text-muted-foreground mt-2">Suas respostas ficaram registradas como parte da sua leitura.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
              {[
                ["Experiências", responses.length, Target],
                ["Descobertas", storyCounts.discoveries, Lightbulb],
                ["Personagens", storyCounts.characters, Users],
                ["Previsões", storyCounts.predictions, Compass],
              ].map(([label, value, Icon]) => (
                <div key={String(label)} className="rounded-2xl border border-border bg-muted/20 p-4">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-2xl font-bold mt-3">{String(value)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{String(label)}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-background/60 p-5">
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">A história que você está construindo</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  ["Interpretações", storyCounts.interpretation],
                  ["Opiniões", storyCounts.opinions],
                  ["Descobertas", storyCounts.discoveries],
                  ["Palavras", storyCounts.words],
                ].map(([label, value]) => (
                  <span key={String(label)} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold">
                    {String(value)} {String(label).toLowerCase()}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-8">
              <Button variant="outline" onClick={() => navigate(`/edu/jornada/${classId}`)} className="sm:flex-1">Voltar à leitura</Button>
              <Button onClick={async () => { await completeChapter(); nextChapter(); }} className="sm:flex-[1.25] gap-2">
                Continuar jornada <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button onClick={() => navigate(`/edu/jornada/${classId}`)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Leitura
          </button>
          <div className="text-right">
            <p className="text-sm font-semibold">{bookTitle}</p>
            <p className="text-[11px] text-muted-foreground">{className} · Capítulo {chapterNumber}</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-7 sm:py-10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Experiência de capítulo</p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">O que você percebeu?</h1>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{Math.min(step + 1, experiences.length)} de {experiences.length}</span>
        </div>
        <Progress value={(Math.min(step + 1, experiences.length) / experiences.length) * 100} className="h-1.5" />

        {current && (
          <div className="mt-8 rounded-3xl border border-border bg-card p-5 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${area.tone}`}>
                <AreaIcon className="h-3.5 w-3.5" /> {area.label}
              </span>
              {current.isLegacy && <Badge variant="outline">Pergunta da turma</Badge>}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mt-5 tracking-tight">{current.title}</h2>
            <p className="text-base sm:text-lg leading-relaxed text-foreground/85 mt-3">{current.prompt}</p>

            <div className="mt-7">
              <ExperienceRenderer
                experience={current}
                value={answers[current.id]}
                setValue={(value) => setAnswers((prev) => ({ ...prev, [current.id]: value }))}
              />
            </div>

            {responses.some((r) => r.experience_id === current.id) && (
              <div className="mt-5 rounded-2xl bg-muted/30 border border-border p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Você já registrou essa experiência.</p>
                  <p className="text-xs text-muted-foreground mt-1">Você pode revisar sua resposta ou seguir adiante.</p>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Anterior
              </Button>
              <Button onClick={saveCurrent} disabled={!canAnswer || saving} className="gap-2 min-w-[150px]">
                {saving ? "Salvando…" : step + 1 === experiences.length ? "Explorar resultado" : "Continuar"}
                {!saving && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-5">
          Não é uma prova. Esta experiência serve para registrar como você leu, percebeu e imaginou a história.
        </p>
      </main>
    </div>
  );
};

export default EduExperienciasCapitulo;
