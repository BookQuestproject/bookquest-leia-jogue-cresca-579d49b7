import { useEffect, useMemo, useState } from "react";
import EduLayout from "./EduLayout";
import { useJourneys } from "@/hooks/useJourneys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUp, ArrowDown, BookOpen, Check, Copy, Eye, Heart, HelpCircle, Lightbulb,
  ListOrdered, Loader2, Plus, Save, Trash2, Users, WandSparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ExperienceRow = {
  id: string;
  journey_id: string;
  chapter_number: number;
  experience_type: string;
  area: string;
  title: string;
  prompt: string;
  payload: any;
  sort_order: number;
  is_active: boolean;
};

const TYPES = [
  { id: "multiple_choice", label: "Escolha", area: "interpretation", icon: Eye },
  { id: "multi_select", label: "Múltiplas escolhas", area: "interpretation", icon: Check },
  { id: "true_false", label: "Verdadeiro ou falso", area: "interpretation", icon: Check },
  { id: "order", label: "Ordenar acontecimentos", area: "plot", icon: ListOrdered },
  { id: "cause_effect", label: "Causa e consequência", area: "plot", icon: ArrowUp },
  { id: "scale", label: "Escala", area: "connection", icon: Heart },
  { id: "prediction", label: "Previsão", area: "prediction", icon: Lightbulb },
  { id: "clue", label: "Pista / descoberta", area: "discovery", icon: Lightbulb },
  { id: "character_traits", label: "Características do personagem", area: "character", icon: Users },
  { id: "atmosphere", label: "Atmosfera da cena", area: "immersion", icon: WandSparkles },
  { id: "short_text", label: "Resposta curta", area: "voice", icon: HelpCircle },
  { id: "open_text", label: "Resposta aberta", area: "voice", icon: HelpCircle },
  { id: "complete_sentence", label: "Completar frase", area: "voice", icon: HelpCircle },
] as const;

const AREA_LABELS: Record<string, string> = {
  interpretation: "Interpretação",
  connection: "Opinião e conexão",
  character: "Personagens",
  plot: "Enredo",
  discovery: "Descoberta",
  prediction: "Previsão",
  immersion: "Imersão",
  voice: "Sua voz",
};

const OBJECTIVE_TYPES = new Set(["multiple_choice", "multi_select", "true_false"]);
const OPTION_TYPES = new Set(["multiple_choice", "multi_select", "character_traits", "atmosphere", "clue"]);

const EduPerguntas = () => {
  const { journeys, loading: loadingJ } = useJourneys();
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [items, setItems] = useState<ExperienceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [chapter, setChapter] = useState(1);
  const [type, setType] = useState("multiple_choice");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [correctIndex, setCorrectIndex] = useState("");
  const [correctIndicesText, setCorrectIndicesText] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!journeyId && journeys.length) setJourneyId(journeys[0].id);
  }, [journeys, journeyId]);

  const journey = journeys.find((j) => j.id === journeyId);

  const fetchItems = async () => {
    if (!journeyId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("edu_chapter_experiences" as any)
      .select("*")
      .eq("journey_id", journeyId)
      .order("chapter_number", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) toast.error("Não consegui carregar as experiências.");
    setItems((data as unknown as ExperienceRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [journeyId]);

  const reset = () => {
    setChapter(1);
    setType("multiple_choice");
    setTitle("");
    setPrompt("");
    setOptionsText("");
    setCorrectIndex("");
    setCorrectIndicesText("");
    setFeedback("");
  };

  const payload = useMemo(() => {
    const options = optionsText.split("\n").map((x) => x.trim()).filter(Boolean);
    const base: any = { options, feedback: feedback.trim() || null };
    if (type === "true_false") base.correct = correctIndex === "1";
    if (type === "multiple_choice") base.correctIndex = correctIndex === "" ? null : Number(correctIndex);
    if (type === "multi_select") base.correctIndices = correctIndicesText
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((x) => Number.isFinite(x));
    if (type === "order") base.items = options;
    if (type === "cause_effect") {
      base.causes = options.slice(0, Math.ceil(options.length / 2));
      base.effects = options.slice(Math.ceil(options.length / 2));
    }
    return base;
  }, [type, optionsText, correctIndex, correctIndicesText, feedback]);

  const create = async () => {
    if (!journeyId || !prompt.trim()) return;
    const nextOrder = items.filter((x) => x.chapter_number === chapter).length;
    setSaving(true);
    const { error } = await supabase.from("edu_chapter_experiences" as any).insert({
      journey_id: journeyId,
      chapter_number: chapter,
      experience_type: type,
      area: (TYPES.find((x) => x.id === type)?.area || "interpretation"),
      title: title.trim() || TYPES.find((x) => x.id === type)?.label || "Experiência",
      prompt: prompt.trim(),
      payload,
      sort_order: nextOrder,
      is_active: true,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    });
    setSaving(false);
    if (error) {
      toast.error("Não consegui salvar a experiência.");
      return;
    }
    toast.success("Experiência de capítulo criada.");
    setCreating(false);
    reset();
    await fetchItems();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("edu_chapter_experiences" as any).delete().eq("id", id);
    if (error) { toast.error("Não consegui excluir."); return; }
    await fetchItems();
  };

  const duplicate = async (item: ExperienceRow) => {
    if (!journeyId) return;
    const { error } = await supabase.from("edu_chapter_experiences" as any).insert({
      journey_id: item.journey_id,
      chapter_number: item.chapter_number,
      experience_type: item.experience_type,
      area: item.area,
      title: item.title + " (cópia)",
      prompt: item.prompt,
      payload: item.payload,
      sort_order: items.filter((x) => x.chapter_number === item.chapter_number).length,
      is_active: true,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    });
    if (error) { toast.error("Não consegui duplicar."); return; }
    toast.success("Experiência duplicada.");
    await fetchItems();
  };

  const grouped = useMemo(() => items.reduce<Record<number, ExperienceRow[]>>((acc, item) => {
    (acc[item.chapter_number] ||= []).push(item);
    return acc;
  }, {}), [items]);

  return (
    <EduLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-[0.14em]">
              <SparklesIcon />
              Experiências de Capítulo
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-2">Construa a experiência de leitura</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Cada capítulo pode combinar interpretações, descobertas, personagens, previsões e voz do aluno sem parecer uma prova.
            </p>
          </div>
          <Button onClick={() => { setCreating(true); reset(); }} disabled={!journeyId} className="gap-2">
            <Plus className="h-4 w-4" /> Nova experiência
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {journeys.map((j) => (
            <button
              key={j.id}
              onClick={() => setJourneyId(j.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${journeyId === j.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-muted"}`}
            >
              <BookOpen className="h-3.5 w-3.5" /> {j.title}
            </button>
          ))}
        </div>

        {loadingJ || loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : !journey ? (
          <Card><CardContent className="py-14 text-center text-sm text-muted-foreground">Crie uma jornada para começar.</CardContent></Card>
        ) : !items.length ? (
          <Card><CardContent className="py-14 text-center space-y-3">
            <Lightbulb className="h-9 w-9 mx-auto text-accent" />
            <p className="font-semibold text-foreground">A jornada ainda não tem experiências.</p>
            <p className="text-sm text-muted-foreground">Comece por uma experiência curta e varie os tipos entre capítulos.</p>
            <Button onClick={() => setCreating(true)} className="gap-2"><Plus className="h-4 w-4" /> Criar primeira</Button>
          </CardContent></Card>
        ) : (
          <div className="space-y-5">
            {Object.keys(grouped).sort((a, b) => +a - +b).map((ch) => (
              <section key={ch}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-bold text-foreground">Capítulo {ch}</span>
                  <span className="text-xs text-muted-foreground">{grouped[+ch].length} experiência{grouped[+ch].length > 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-2">
                  {grouped[+ch].map((item) => {
                    const TypeIcon = TYPES.find((x) => x.id === item.experience_type)?.icon || HelpCircle;
                    return (
                      <Card key={item.id} className="hover:border-primary/30 transition-colors">
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold">{item.title}</p>
                              <Badge variant="outline" className="text-[10px]">{TYPES.find((x) => x.id === item.experience_type)?.label || item.experience_type}</Badge>
                              <Badge variant="outline" className="text-[10px]">{AREA_LABELS[item.area] || item.area}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.prompt}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicate(item)} title="Duplicar"><Copy className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => remove(item.id)} title="Excluir"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {creating && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setCreating(false)}>
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <CardTitle>Nova experiência de capítulo</CardTitle>
                <p className="text-sm text-muted-foreground">A experiência pode ser objetiva ou interpretativa. Use a forma que melhor combina com o que o aluno acabou de ler.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Capítulo</label>
                    <Input type="number" min={1} max={journey.total_chapters} value={chapter} onChange={(e) => setChapter(Math.max(1, Number(e.target.value) || 1))} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Tipo de interação</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                      {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Título da experiência</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Você percebeu a pista?" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">O que o aluno verá</label>
                  <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} placeholder="Ex.: Qual detalhe deste capítulo pode ganhar importância depois?" className="mt-1" />
                </div>

                {(OPTION_TYPES.has(type) || type === "order") && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Opções / itens · uma linha por item</label>
                    <Textarea value={optionsText} onChange={(e) => setOptionsText(e.target.value)} rows={5} placeholder={"A descoberta na floresta\nA conversa com o amigo\nA carta recebida"} className="mt-1" />
                  </div>
                )}

                {type === "cause_effect" && (
                  <p className="text-xs text-muted-foreground">Para causa e consequência, coloque primeiro as causas e depois os efeitos. O editor separa a lista ao meio.</p>
                )}

                {OBJECTIVE_TYPES.has(type) && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      {type === "multi_select" ? "Índices corretos (começando em 0, separados por vírgula)" : "Índice da resposta correta (começando em 0)"}
                    </label>
                    <Input value={type === "multi_select" ? correctIndicesText : correctIndex} onChange={(e) => type === "multi_select" ? setCorrectIndicesText(e.target.value) : setCorrectIndex(e.target.value)} placeholder={type === "true_false" ? "0 = falso · 1 = verdadeiro" : "Ex.: 1"} className="mt-1" />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Feedback após a resposta · opcional</label>
                  <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} placeholder="Ex.: Você percebeu a relação entre os dois acontecimentos." className="mt-1" />
                </div>

                <div className="rounded-2xl border border-border bg-muted/20 p-4">
                  <p className="text-xs font-semibold text-foreground">Princípio pedagógico</p>
                  <p className="text-xs text-muted-foreground mt-1">A resposta pode ser certa, interpretativa ou pessoal. O sistema só marca acerto quando um gabarito foi definido.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
                  <Button onClick={create} disabled={saving || !prompt.trim()} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Salvar experiência
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </EduLayout>
  );
};

const SparklesIcon = () => <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-accent"><SparkleSmall /></span>;
const SparkleSmall = () => <span aria-hidden="true">✦</span>;

export default EduPerguntas;
