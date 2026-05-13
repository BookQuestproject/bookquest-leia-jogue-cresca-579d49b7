import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, ArrowRight, ArrowLeft, CheckCircle2, Copy,
  User2, School, Users, BookOpen, Settings2, PartyPopper,
  Plus, Minus, Link as LinkIcon, ShieldCheck, Sparkles,
  Trophy, Bell, Target, Gamepad2,
} from "lucide-react";
import logoCrown from "@/assets/logo-crown-transparent.png";

const ROYAL = "#021f53";
const GOLD = "#F5C842";
const GOLD_DEEP = "#E0A82E";

const GRADES = [
  "6º ano", "7º ano", "8º ano", "9º ano",
  "1ª série EM", "2ª série EM", "3ª série EM",
];

const SUBJECTS = ["Literatura", "Português", "Redação", "Outra"];
const EXPERIENCE = ["< 2 anos", "2–5 anos", "5–10 anos", "10+ anos"];
const SCHOOL_TYPES = [
  { id: "publica", label: "Pública" },
  { id: "privada", label: "Privada" },
  { id: "curso", label: "Curso / Pré-vestibular" },
];
const SHIFTS = ["Manhã", "Tarde", "Noite"];

const STATES = [
  ["AC", "Acre"], ["AL", "Alagoas"], ["AP", "Amapá"], ["AM", "Amazonas"],
  ["BA", "Bahia"], ["CE", "Ceará"], ["DF", "Distrito Federal"], ["ES", "Espírito Santo"],
  ["GO", "Goiás"], ["MA", "Maranhão"], ["MT", "Mato Grosso"], ["MS", "Mato Grosso do Sul"],
  ["MG", "Minas Gerais"], ["PA", "Pará"], ["PB", "Paraíba"], ["PR", "Paraná"],
  ["PE", "Pernambuco"], ["PI", "Piauí"], ["RJ", "Rio de Janeiro"], ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"], ["RO", "Rondônia"], ["RR", "Roraima"], ["SC", "Santa Catarina"],
  ["SP", "São Paulo"], ["SE", "Sergipe"], ["TO", "Tocantins"],
];

const STEPS = [
  { id: 0, label: "Professor", icon: User2 },
  { id: 1, label: "Escola", icon: School },
  { id: 2, label: "Turmas", icon: Users },
  { id: 3, label: "Livros", icon: BookOpen },
  { id: 4, label: "Preferências", icon: Settings2 },
  { id: 5, label: "Pronto", icon: PartyPopper },
];

type ClassRow = { grade: string; count: number; studentsPerClass: string };

const defaultRow = (): ClassRow => ({ grade: "", count: 1, studentsPerClass: "30" });

const EduOnboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: roleLoading } = useEduRole();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Etapa 1 — Professor
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [subjects, setSubjects] = useState<string[]>(["Literatura"]);
  const [grades, setGrades] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>("");

  // Etapa 2 — Escola
  const [school, setSchool] = useState("");
  const [city, setCity] = useState("");
  const [stateUF, setStateUF] = useState("");
  const [schoolType, setSchoolType] = useState<string>("publica");
  const [shifts, setShifts] = useState<string[]>([]);

  // Etapa 3 — Turmas (batch por série)
  const [rows, setRows] = useState<ClassRow[]>([defaultRow()]);
  const [customNames, setCustomNames] = useState<Record<number, string>>({});
  const [createdClasses, setCreatedClasses] = useState<any[]>([]);

  // Etapa 4 — Livros
  const [bookMode, setBookMode] = useState<"same" | "later">("same");
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [chapterCount, setChapterCount] = useState("10");

  // Etapa 5 — Preferências
  const [prefs, setPrefs] = useState({
    gamification: true,
    classRanking: false,
    weeklyGoal: true,
    notifications: true,
  });

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) navigate("/auth?redirect=/edu", { replace: true });
      else if (!isTeacher) navigate("/edu", { replace: true });
    }
  }, [user, isTeacher, authLoading, roleLoading, navigate]);

  // Pré-preencher
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles")
        .select("full_name, school_name, city, state, grades_taught")
        .eq("id", user.id).maybeSingle();
      if (data) {
        const fn = data.full_name ?? "";
        setFullName(fn);
        if (fn && !displayName) setDisplayName(`Prof. ${fn.split(" ")[0]}`);
        setSchool((data as any).school_name ?? "");
        setCity((data as any).city ?? "");
        setStateUF((data as any).state ?? "");
        setGrades((data as any).grades_taught ?? []);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggle = <T,>(arr: T[], v: T) =>
    arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  // Preview de turmas geradas (com renomeação opcional por turma)
  const defaultClassNames = useMemo(() => {
    const list: string[] = [];
    rows.forEach(r => {
      if (!r.grade) return;
      for (let i = 0; i < r.count; i++) {
        list.push(`${r.grade} ${String.fromCharCode(65 + i)}`);
      }
    });
    return list;
  }, [rows]);

  const previewClasses = useMemo(
    () => defaultClassNames.map((n, i) => (customNames[i]?.trim() ? customNames[i].trim() : n)),
    [defaultClassNames, customNames]
  );

  // ------- Validação por etapa -------
  const canAdvance = (s: number): boolean => {
    if (s === 0) return !!fullName.trim() && grades.length > 0;
    if (s === 1) return !!school.trim() && !!city.trim() && !!stateUF;
    if (s === 2) return previewClasses.length > 0;
    if (s === 3) return bookMode === "later" || !!bookTitle.trim();
    return true;
  };

  // ------- Saves -------
  const saveProfile = async () => {
    if (!user) return false;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName.trim(),
      school_name: school.trim() || null,
      city: city.trim() || null,
      state: stateUF.trim().toUpperCase().slice(0, 2) || null,
      grades_taught: grades,
    } as any).eq("id", user.id);
    await supabase.from("edu_teachers" as any)
      .update({ profile_completed: true } as any).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar perfil", description: error.message, variant: "destructive" });
      return false;
    }
    return true;
  };

  const createBatchClasses = async () => {
    if (!user) return false;
    if (previewClasses.length === 0) return false;

    setSaving(true);
    const created: any[] = [];

    for (const row of rows) {
      if (!row.grade) continue;
      for (let i = 0; i < row.count; i++) {
        const suffix = String.fromCharCode(65 + i);
        const name = `${row.grade} ${suffix}`;

        const { data: codeData, error: codeErr } = await supabase.rpc("generate_class_code");
        if (codeErr) {
          toast({ title: "Erro ao gerar código", description: codeErr.message, variant: "destructive" });
          setSaving(false);
          return false;
        }

        const { data, error } = await supabase.from("classes").insert({
          name,
          grade: row.grade,
          teacher_id: user.id,
          access_code: codeData as string,
          school_year: new Date().getFullYear(),
          student_count_estimate: parseInt(row.studentsPerClass) || null,
        } as any).select().single();

        if (error) {
          toast({
            title: `Erro ao criar "${name}"`,
            description: error.message,
            variant: "destructive",
          });
          setSaving(false);
          return false;
        }
        created.push(data);
      }
    }

    setCreatedClasses(created);
    setSaving(false);
    return true;
  };

  const applyBookToAll = async () => {
    if (!user || createdClasses.length === 0) return true;
    if (bookMode === "later") return true;
    if (!bookTitle.trim()) return true;

    setSaving(true);

    const { data: journey, error } = await supabase
      .from("edu_journeys" as any)
      .insert({
        teacher_id: user.id,
        title: bookTitle.trim(),
        book_title: bookTitle.trim(),
        author: bookAuthor.trim() || null,
        total_chapters: parseInt(chapterCount) || 1,
      } as any).select().single();

    if (error || !journey) {
      toast({ title: "Erro ao salvar livro", description: error?.message, variant: "destructive" });
      setSaving(false);
      return false;
    }

    const links = createdClasses.map(c => ({
      journey_id: (journey as any).id,
      class_id: c.id,
    }));
    await supabase.from("edu_journey_classes" as any).insert(links as any);

    await Promise.all(createdClasses.map(c =>
      supabase.from("classes").update({
        book_title: bookTitle.trim(),
        author: bookAuthor.trim() || null,
      }).eq("id", c.id)
    ));

    setSaving(false);
    return true;
  };

  const savePreferences = async () => {
    if (!user) return true;
    await supabase.from("edu_teacher_settings" as any).upsert({
      teacher_id: user.id,
      school_name: school.trim() || null,
      notification_prefs: {
        weekly_summary: prefs.notifications,
        student_inactive: prefs.notifications,
      },
      visual_prefs: {
        gamification: prefs.gamification,
        class_ranking: prefs.classRanking,
        weekly_goal: prefs.weeklyGoal,
      },
    } as any, { onConflict: "teacher_id" });
    return true;
  };

  const finish = async () => {
    if (!user) return;
    await supabase.from("edu_teachers" as any)
      .update({ onboarding_completed: true } as any)
      .eq("user_id", user.id);
    navigate("/edu/professor", { replace: true });
  };

  const next = async () => {
    if (!canAdvance(step)) {
      toast({ title: "Faltam informações", description: "Preencha os campos obrigatórios.", variant: "destructive" });
      return;
    }
    if (step === 0) { if (!(await saveProfile())) return; }
    if (step === 2) {
      if (createdClasses.length === 0) {
        if (!(await createBatchClasses())) return;
      }
    }
    if (step === 3) { if (!(await applyBookToAll())) return; }
    if (step === 4) { await savePreferences(); }
    if (step === 5) { await finish(); return; }
    setStep(s => s + 1);
  };

  const back = () => setStep(s => Math.max(0, s - 1));

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado` });
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: ROYAL }}>
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  const progressPct = ((step + 1) / STEPS.length) * 100;
  const StepIcon = STEPS[step].icon;

  return (
    <div
      className="min-h-screen px-4 py-8 md:py-12"
      style={{ background: `linear-gradient(160deg, ${ROYAL} 0%, #02174a 60%, #010f3a 100%)` }}
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <img src={logoCrown} alt="BookQuest" className="h-7 w-7" />
            <span className="font-bold text-white text-sm">BookQuest</span>
            <span
              className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full border"
              style={{ color: GOLD, borderColor: `${GOLD}55`, background: `${GOLD}10` }}
            >EDU</span>
          </div>
          <span className="text-[11px] text-white/50">
            Etapa {step + 1} de {STEPS.length}
          </span>
        </div>

        {/* Stepper */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <div key={s.id} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                      active ? "scale-110" : ""
                    }`}
                    style={{
                      background: done || active ? GOLD : "rgba(255,255,255,0.06)",
                      color: done || active ? ROYAL : "rgba(255,255,255,0.4)",
                      boxShadow: active ? `0 0 0 4px ${GOLD}22` : undefined,
                    }}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span
                    className={`text-[10px] tracking-wide truncate ${
                      active ? "font-bold" : ""
                    }`}
                    style={{ color: active ? GOLD : "rgba(255,255,255,0.45)" }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${GOLD_DEEP}, ${GOLD}, #FCE17A)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-3xl mx-auto">
        <Card className="bg-white/[0.04] border-white/10 backdrop-blur-xl text-white shadow-2xl">
          <CardContent className="p-6 md:p-10 min-h-[440px]">
            {/* STEP 0 — Professor */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: GOLD }}>
                    Sobre você
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold">Vamos te conhecer</h1>
                  <p className="text-sm text-white/60">Em menos de 3 minutos sua sala estará pronta.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-white/80 text-xs">Nome completo</Label>
                    <Input
                      value={fullName}
                      onChange={e => {
                        setFullName(e.target.value);
                        if (!displayName) setDisplayName(`Prof. ${e.target.value.split(" ")[0]}`);
                      }}
                      placeholder="Ana Maria Silva"
                      className="bg-white/5 border-white/15 text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/80 text-xs">Como os alunos te chamam?</Label>
                    <Input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Prof. Ana"
                      className="bg-white/5 border-white/15 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 text-xs">Matérias que leciona</Label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map(s => {
                      const active = subjects.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSubjects(toggle(subjects, s))}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                          style={{
                            background: active ? `${GOLD}1A` : "transparent",
                            borderColor: active ? `${GOLD}88` : "rgba(255,255,255,0.15)",
                            color: active ? GOLD : "rgba(255,255,255,0.7)",
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 text-xs">Séries que leciona</Label>
                  <div className="flex flex-wrap gap-2">
                    {GRADES.map(g => {
                      const active = grades.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGrades(toggle(grades, g))}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                          style={{
                            background: active ? `${GOLD}1A` : "transparent",
                            borderColor: active ? `${GOLD}88` : "rgba(255,255,255,0.15)",
                            color: active ? GOLD : "rgba(255,255,255,0.7)",
                          }}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 text-xs">
                    Experiência <span className="text-white/40">· opcional</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {EXPERIENCE.map(e => {
                      const active = experience === e;
                      return (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setExperience(active ? "" : e)}
                          className="px-3 py-1.5 rounded-md text-xs font-medium border transition-all"
                          style={{
                            background: active ? `${GOLD}1A` : "transparent",
                            borderColor: active ? `${GOLD}88` : "rgba(255,255,255,0.15)",
                            color: active ? GOLD : "rgba(255,255,255,0.7)",
                          }}
                        >
                          {e}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1 — Escola */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: GOLD }}>
                    Onde você ensina
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold">Sua escola</h1>
                  <p className="text-sm text-white/60">Esses dados ficam salvos para suas próximas turmas.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/80 text-xs">Nome da escola</Label>
                  <Input
                    value={school}
                    onChange={e => setSchool(e.target.value)}
                    placeholder="Ex: Colégio Dom Pedro II"
                    className="bg-white/5 border-white/15 text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-white/80 text-xs">Cidade</Label>
                    <Input
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="São Paulo"
                      className="bg-white/5 border-white/15 text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/80 text-xs">UF</Label>
                    <Select value={stateUF} onValueChange={setStateUF}>
                      <SelectTrigger className="bg-white/5 border-white/15 text-white">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {STATES.map(([uf, name]) => (
                          <SelectItem key={uf} value={uf}>{uf} — {name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 text-xs">Tipo de instituição</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {SCHOOL_TYPES.map(t => {
                      const active = schoolType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSchoolType(t.id)}
                          className="px-3 py-3 rounded-lg text-xs font-medium border transition-all text-left"
                          style={{
                            background: active ? `${GOLD}14` : "rgba(255,255,255,0.03)",
                            borderColor: active ? `${GOLD}88` : "rgba(255,255,255,0.10)",
                            color: active ? GOLD : "rgba(255,255,255,0.75)",
                          }}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 text-xs">Turnos que leciona</Label>
                  <div className="flex gap-2">
                    {SHIFTS.map(s => {
                      const active = shifts.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setShifts(toggle(shifts, s))}
                          className="px-4 py-2 rounded-md text-xs font-medium border transition-all flex-1"
                          style={{
                            background: active ? `${GOLD}1A` : "transparent",
                            borderColor: active ? `${GOLD}88` : "rgba(255,255,255,0.15)",
                            color: active ? GOLD : "rgba(255,255,255,0.7)",
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — Turmas em batch */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: GOLD }}>
                    Suas turmas
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold">Crie tudo de uma vez</h1>
                  <p className="text-sm text-white/60">
                    Escolha uma série e quantas turmas dela você tem. Vamos gerar A, B, C automaticamente.
                  </p>
                </div>

                <div className="space-y-3">
                  {rows.map((row, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4 grid grid-cols-12 gap-3 items-end"
                    >
                      <div className="col-span-12 md:col-span-5 space-y-1.5">
                        <Label className="text-white/70 text-[11px]">Série</Label>
                        <Select
                          value={row.grade}
                          onValueChange={v => {
                            const next = [...rows];
                            next[idx] = { ...row, grade: v };
                            setRows(next);
                          }}
                        >
                          <SelectTrigger className="bg-white/5 border-white/15 text-white">
                            <SelectValue placeholder="Selecione…" />
                          </SelectTrigger>
                          <SelectContent>
                            {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-7 md:col-span-4 space-y-1.5">
                        <Label className="text-white/70 text-[11px]">Quantas turmas?</Label>
                        <div className="flex items-center gap-1 bg-white/5 border border-white/15 rounded-md h-10 px-1">
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...rows];
                              next[idx] = { ...row, count: Math.max(1, row.count - 1) };
                              setRows(next);
                            }}
                            className="h-8 w-8 rounded hover:bg-white/10 flex items-center justify-center text-white/70"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="flex-1 text-center font-bold text-base" style={{ color: GOLD }}>
                            {row.count}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...rows];
                              next[idx] = { ...row, count: Math.min(10, row.count + 1) };
                              setRows(next);
                            }}
                            className="h-8 w-8 rounded hover:bg-white/10 flex items-center justify-center text-white/70"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="col-span-4 md:col-span-2 space-y-1.5">
                        <Label className="text-white/70 text-[11px]">Alunos</Label>
                        <Input
                          type="number"
                          value={row.studentsPerClass}
                          onChange={e => {
                            const next = [...rows];
                            next[idx] = { ...row, studentsPerClass: e.target.value };
                            setRows(next);
                          }}
                          className="bg-white/5 border-white/15 text-white h-10"
                        />
                      </div>

                      <div className="col-span-1 flex justify-end">
                        {rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setRows(rows.filter((_, i) => i !== idx))}
                            className="h-10 w-10 rounded-md hover:bg-white/10 flex items-center justify-center text-white/50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRows([...rows, defaultRow()])}
                    className="bg-transparent border-white/15 text-white/80 hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Adicionar série
                  </Button>
                </div>

                {previewClasses.length > 0 && (
                  <div
                    className="rounded-lg p-4 space-y-2"
                    style={{ background: `${GOLD}0F`, border: `1px solid ${GOLD}33` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white/80">
                        Você vai criar <span style={{ color: GOLD }}>{previewClasses.length}</span> turma(s):
                      </span>
                      <Sparkles className="h-3.5 w-3.5" style={{ color: GOLD }} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {previewClasses.map(n => (
                        <span
                          key={n}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium"
                          style={{ background: `${GOLD}1A`, color: GOLD }}
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 — Livros */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: GOLD }}>
                    Leitura
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold">O que vão ler?</h1>
                  <p className="text-sm text-white/60">
                    Aplique o mesmo livro a todas as turmas ou decida depois — é fácil mudar.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: "same", title: "Mesmo livro para todas", desc: "Aplica em todas as turmas criadas." },
                    { id: "later", title: "Decidir depois", desc: "Você atribui livros direto no painel." },
                  ] as const).map(opt => {
                    const active = bookMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setBookMode(opt.id)}
                        className="text-left p-4 rounded-xl border transition-all"
                        style={{
                          background: active ? `${GOLD}10` : "rgba(255,255,255,0.03)",
                          borderColor: active ? `${GOLD}88` : "rgba(255,255,255,0.10)",
                        }}
                      >
                        <p className="font-semibold text-sm" style={{ color: active ? GOLD : "white" }}>
                          {opt.title}
                        </p>
                        <p className="text-[11px] text-white/55 mt-1">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {bookMode === "same" && (
                  <div className="space-y-4 pt-2">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-white/80 text-xs">Título</Label>
                        <Input
                          value={bookTitle}
                          onChange={e => setBookTitle(e.target.value)}
                          placeholder="Dom Casmurro"
                          className="bg-white/5 border-white/15 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-white/80 text-xs">Autor</Label>
                        <Input
                          value={bookAuthor}
                          onChange={e => setBookAuthor(e.target.value)}
                          placeholder="Machado de Assis"
                          className="bg-white/5 border-white/15 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/80 text-xs">Total de capítulos</Label>
                      <Input
                        type="number"
                        min={1}
                        value={chapterCount}
                        onChange={e => setChapterCount(e.target.value)}
                        className="bg-white/5 border-white/15 text-white max-w-[140px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4 — Preferências */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: GOLD }}>
                    Personalização
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold">Como você quer ensinar?</h1>
                  <p className="text-sm text-white/60">Você pode ajustar tudo depois nas configurações.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { key: "gamification" as const, icon: Gamepad2, title: "Gamificação ativa", desc: "Conquistas, Essência e níveis para os alunos." },
                    { key: "classRanking" as const, icon: Trophy, title: "Ranking entre turmas", desc: "Compara o engajamento das suas turmas." },
                    { key: "weeklyGoal" as const, icon: Target, title: "Meta semanal de leitura", desc: "Define um objetivo claro a cada semana." },
                    { key: "notifications" as const, icon: Bell, title: "Notificações de progresso", desc: "Receba avisos sobre alunos e marcos importantes." },
                  ].map(item => (
                    <div
                      key={item.key}
                      className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03]"
                    >
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${GOLD}14`, color: GOLD }}
                      >
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white">{item.title}</p>
                        <p className="text-[11px] text-white/55 mt-0.5">{item.desc}</p>
                      </div>
                      <Switch
                        checked={prefs[item.key]}
                        onCheckedChange={(v) => setPrefs(p => ({ ...p, [item.key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5 — Pronto */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <div
                    className="h-14 w-14 mx-auto rounded-full flex items-center justify-center"
                    style={{ background: `${GOLD}1A`, color: GOLD }}
                  >
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: GOLD }}>
                    Tudo pronto
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    Bem-vindo(a), {displayName || fullName.split(" ")[0]}
                  </h1>
                  <p className="text-sm text-white/60 max-w-md mx-auto">
                    Suas turmas estão criadas. Compartilhe os códigos abaixo com seus alunos.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Turmas", value: createdClasses.length },
                    { label: "Alunos esperados", value: rows.reduce((acc, r) => acc + (parseInt(r.studentsPerClass) || 0) * r.count, 0) },
                    { label: "Livro", value: bookMode === "same" && bookTitle ? "✓" : "—" },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                      <p className="text-xl font-bold" style={{ color: GOLD }}>{s.value}</p>
                      <p className="text-[10px] text-white/55 uppercase tracking-wider mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {createdClasses.map(c => {
                    const link = `${window.location.origin}/entrar/${c.access_code}`;
                    return (
                      <div key={c.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-white truncate">{c.name}</p>
                            <p className="font-mono text-xs text-white/50 mt-0.5">{c.access_code}</p>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyText(c.access_code, "Código")}
                              className="bg-white/5 border-white/15 text-white hover:bg-white/10 h-8"
                            >
                              <Copy className="h-3 w-3 mr-1" /> Código
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyText(link, "Link")}
                              className="bg-white/5 border-white/15 text-white hover:bg-white/10 h-8"
                            >
                              <LinkIcon className="h-3 w-3 mr-1" /> Link
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer nav */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 0 || saving}
            className="text-white/60 hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>

          <div className="flex items-center gap-3">
            {(step === 2 || step === 3) && (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={saving || (step === 2 && previewClasses.length === 0)}
                className="text-xs text-white/45 hover:text-white/80 transition disabled:opacity-30"
              >
                Pular esta etapa
              </button>
            )}

            <Button
              onClick={next}
              disabled={saving || !canAdvance(step)}
              className="font-bold text-[#021f53] hover:brightness-110 hover:scale-[1.02] transition-all h-11 px-6 disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: `linear-gradient(135deg, ${GOLD_DEEP}, ${GOLD}, #FCE17A)` }}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : step === 5 ? (
                <>Ir para o painel <ArrowRight className="h-4 w-4 ml-1" /></>
              ) : (
                <>Continuar <ArrowRight className="h-4 w-4 ml-1" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EduOnboarding;
