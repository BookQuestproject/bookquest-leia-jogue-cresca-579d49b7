import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Users, BookOpen, Loader2, ArrowRight, ArrowLeft,
  CheckCircle2, Copy, Sparkles, Link as LinkIcon, Plus, Minus,
} from "lucide-react";
import logoCrown from "@/assets/logo-crown-transparent.png";

const GRADES = [
  "6º ano", "7º ano", "8º ano", "9º ano",
  "1ª série EM", "2ª série EM", "3ª série EM",
];

const STATES = [
  ["AC", "Acre"], ["AL", "Alagoas"], ["AP", "Amapá"], ["AM", "Amazonas"],
  ["BA", "Bahia"], ["CE", "Ceará"], ["DF", "Distrito Federal"], ["ES", "Espírito Santo"],
  ["GO", "Goiás"], ["MA", "Maranhão"], ["MT", "Mato Grosso"], ["MS", "Mato Grosso do Sul"],
  ["MG", "Minas Gerais"], ["PA", "Pará"], ["PB", "Paraíba"], ["PR", "Paraná"],
  ["PE", "Pernambuco"], ["PI", "Piauí"], ["RJ", "Rio de Janeiro"], ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"], ["RO", "Rondônia"], ["RR", "Roraima"], ["SC", "Santa Catarina"],
  ["SP", "São Paulo"], ["SE", "Sergipe"], ["TO", "Tocantins"],
];

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const STEPS = ["Boas-vindas", "Sobre você", "Suas turmas", "Convidar alunos", "Primeiro livro", "Pronto"] as const;

const EduOnboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: roleLoading } = useEduRole();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Profile
  const [fullName, setFullName] = useState("");
  const [school, setSchool] = useState("");
  const [city, setCity] = useState("");
  const [stateUF, setStateUF] = useState("");
  const [grades, setGrades] = useState<string[]>([]);

  // Classes (batch)
  const [classGrade, setClassGrade] = useState("");
  const [classCount, setClassCount] = useState(1);
  const [classYear, setClassYear] = useState(new Date().getFullYear().toString());
  const [studentCount, setStudentCount] = useState("30");
  const [createdClasses, setCreatedClasses] = useState<any[]>([]);

  // Journey
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [chapterCount, setChapterCount] = useState("10");

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) navigate("/auth?redirect=/edu", { replace: true });
      else if (!isTeacher) navigate("/edu", { replace: true });
    }
  }, [user, isTeacher, authLoading, roleLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles")
        .select("full_name, school_name, city, state, grades_taught")
        .eq("id", user.id).maybeSingle();
      if (data) {
        setFullName(data.full_name ?? "");
        setSchool((data as any).school_name ?? "");
        setCity((data as any).city ?? "");
        setStateUF((data as any).state ?? "");
        setGrades((data as any).grades_taught ?? []);
      }
    })();
  }, [user]);

  const toggleGrade = (g: string) =>
    setGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const saveProfile = async () => {
    if (!user) return false;
    if (!fullName.trim() || !school.trim() || !city.trim() || !stateUF.trim() || grades.length === 0) {
      toast({ title: "Preencha todos os campos", description: "Faltou alguma informação.", variant: "destructive" });
      return false;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName.trim(),
      school_name: school.trim(),
      city: city.trim(),
      state: stateUF.trim().toUpperCase().slice(0, 2),
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
    if (!classGrade) {
      toast({ title: "Escolha o ano/série", variant: "destructive" });
      return false;
    }
    if (classCount < 1) return false;

    setSaving(true);
    const created: any[] = [];

    for (let i = 0; i < classCount; i++) {
      const letter = LETTERS[i] ?? String(i + 1);
      const name = classCount === 1 ? classGrade : `${classGrade} ${letter}`;

      // Generate unique code
      const { data: codeData, error: codeErr } = await supabase.rpc("generate_class_code");
      if (codeErr) {
        console.error("generate_class_code", codeErr);
        toast({ title: "Erro ao gerar código", description: codeErr.message, variant: "destructive" });
        setSaving(false);
        return false;
      }

      const { data, error } = await supabase.from("classes").insert({
        name,
        grade: classGrade,
        teacher_id: user.id,
        access_code: codeData as string,
        school_year: parseInt(classYear) || null,
        student_count_estimate: parseInt(studentCount) || null,
      } as any).select().single();

      if (error) {
        console.error("create class", error);
        toast({
          title: `Erro ao criar "${name}"`,
          description: error.message || "Falha ao criar turma.",
          variant: "destructive",
        });
        setSaving(false);
        return false;
      }
      created.push(data);
    }

    setCreatedClasses(created);
    setSaving(false);
    toast({ title: `${created.length} turma(s) criada(s)!` });
    return true;
  };

  const createJourneyForAll = async () => {
    if (!user || createdClasses.length === 0) return false;
    if (!bookTitle.trim()) {
      toast({ title: "Informe o nome do livro", variant: "destructive" });
      return false;
    }
    setSaving(true);

    const { data: journey, error } = await supabase
      .from("edu_journeys" as any)
      .insert({
        teacher_id: user.id,
        title: bookTitle.trim(),
        book_title: bookTitle.trim(),
        author: bookAuthor.trim() || null,
        total_chapters: parseInt(chapterCount) || 1,
      } as any)
      .select().single();

    if (error || !journey) {
      console.error("create journey", error);
      toast({ title: "Erro ao criar leitura", description: error?.message, variant: "destructive" });
      setSaving(false);
      return false;
    }

    // Link to all classes
    const links = createdClasses.map(c => ({
      journey_id: (journey as any).id,
      class_id: c.id,
    }));
    await supabase.from("edu_journey_classes" as any).insert(links as any);

    // Patch each class with book details
    await Promise.all(createdClasses.map(c =>
      supabase.from("classes").update({
        book_title: bookTitle.trim(),
        author: bookAuthor.trim() || null,
        reading_start_date: startDate,
        reading_deadline: endDate,
      }).eq("id", c.id)
    ));

    setSaving(false);
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
    if (step === 1) { if (!(await saveProfile())) return; }
    if (step === 2) { if (!(await createBatchClasses())) return; }
    if (step === 4) { if (!(await createJourneyForAll())) return; }
    if (step === 5) { await finish(); return; }
    setStep(s => s + 1);
  };

  const back = () => setStep(s => Math.max(0, s - 1));

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado!` });
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center" style={{ backgroundColor: "#021f53" }}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <img src={logoCrown} alt="BookQuest" className="h-12 w-12 mx-auto mb-3" />
          <p className="text-xs uppercase tracking-[0.25em] text-amber-400 font-bold">BookQuest EDU</p>
          <p className="text-white/60 text-xs mt-2">Etapa {step + 1} de {STEPS.length}: {STEPS[step]}</p>
        </div>

        <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5 mb-6" />

        <Card className="bg-white/[0.04] border-white/15 backdrop-blur-xl text-white">
          <CardContent className="p-6 md:p-8 min-h-[400px]">
            {/* STEP 0 */}
            {step === 0 && (
              <div className="text-center space-y-5 py-6">
                <Sparkles className="h-12 w-12 mx-auto text-amber-400" />
                <h1 className="text-3xl font-bold">Bem-vindo ao BookQuest EDU 📚</h1>
                <p className="text-white/70 max-w-md mx-auto">
                  Vamos preparar suas turmas em poucos minutos. Pode criar várias de uma vez.
                </p>
              </div>
            )}

            {/* STEP 1 — Sobre você */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Conte um pouco sobre você</h2>
                <div className="space-y-2">
                  <Label>Seu nome completo</Label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Ex: Ana Maria Silva"
                    className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label>Quais anos você dá aula?</Label>
                  <p className="text-xs text-white/50">Toque para selecionar (pode marcar mais de um)</p>
                  <div className="flex flex-wrap gap-2">
                    {GRADES.map(g => (
                      <Badge key={g} variant={grades.includes(g) ? "default" : "outline"}
                        onClick={() => toggleGrade(g)}
                        className="cursor-pointer select-none">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nome da escola</Label>
                  <Input value={school} onChange={e => setSchool(e.target.value)}
                    placeholder="Ex: Escola Municipal Dom Pedro"
                    className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input value={city} onChange={e => setCity(e.target.value)}
                      placeholder="Ex: São Paulo"
                      className="bg-white/10 border-white/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={stateUF} onValueChange={setStateUF}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Selecione…" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {STATES.map(([uf, name]) => (
                          <SelectItem key={uf} value={uf}>{name} ({uf})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — Turmas em lote */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-amber-400" />
                  <h2 className="text-2xl font-bold">Crie suas turmas</h2>
                </div>
                <p className="text-sm text-white/70">
                  Tem várias turmas do mesmo ano? Crie todas de uma vez. As turmas vão receber letras (A, B, C…) automaticamente.
                </p>

                <div className="space-y-2">
                  <Label>Ano / série</Label>
                  <Select value={classGrade} onValueChange={setClassGrade}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Selecione o ano…" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantas turmas desse ano?</Label>
                  <div className="flex items-center gap-3">
                    <Button type="button" size="icon" variant="outline"
                      onClick={() => setClassCount(c => Math.max(1, c - 1))}
                      className="bg-white/10 text-white hover:bg-white/20 h-10 w-10">
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 text-center">
                      <span className="text-3xl font-bold">{classCount}</span>
                      <p className="text-xs text-white/60 mt-1">
                        {classCount === 1
                          ? "1 turma"
                          : `${classCount} turmas (${classGrade || "ano"} ${LETTERS.slice(0, classCount).join(", ")})`}
                      </p>
                    </div>
                    <Button type="button" size="icon" variant="outline"
                      onClick={() => setClassCount(c => Math.min(10, c + 1))}
                      className="bg-white/10 text-white hover:bg-white/20 h-10 w-10">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Ano letivo</Label>
                    <Input value={classYear} onChange={e => setClassYear(e.target.value)}
                      className="bg-white/10 border-white/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label>Alunos por turma (aprox.)</Label>
                    <Input type="number" value={studentCount} onChange={e => setStudentCount(e.target.value)}
                      className="bg-white/10 border-white/20 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 — Convidar */}
            {step === 3 && createdClasses.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-amber-400" />
                  <h2 className="text-2xl font-bold">Convide os alunos</h2>
                </div>
                <p className="text-white/70 text-sm">
                  Compartilhe o código ou link de cada turma com os alunos. Eles entram sozinhos pelo e-mail escolar.
                </p>

                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {createdClasses.map(c => {
                    const link = `${window.location.origin}/entrar/${c.access_code}`;
                    return (
                      <div key={c.id} className="rounded-xl border border-white/15 bg-white/5 p-4 space-y-3">
                        <p className="font-bold text-amber-400">{c.name}</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-2xl font-mono font-bold tracking-widest">{c.access_code}</span>
                          <Button size="sm" variant="outline" onClick={() => copyText(c.access_code, "Código")}
                            className="bg-white/10 text-white hover:bg-white/20">
                            <Copy className="h-3.5 w-3.5 mr-1" /> Código
                          </Button>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono break-all text-white/60 flex items-center gap-1">
                            <LinkIcon className="h-3 w-3 flex-shrink-0" />
                            {link}
                          </span>
                          <Button size="sm" variant="outline" onClick={() => copyText(link, "Link")}
                            className="bg-white/10 text-white hover:bg-white/20 flex-shrink-0">
                            <Copy className="h-3.5 w-3.5 mr-1" /> Link
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4 — Livro */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-amber-400" />
                  <h2 className="text-2xl font-bold">Primeiro livro de leitura</h2>
                </div>
                <p className="text-sm text-white/70">
                  Esse livro será atribuído para {createdClasses.length === 1 ? "a turma" : `as ${createdClasses.length} turmas`}.
                </p>
                <div className="space-y-2">
                  <Label>Nome do livro</Label>
                  <Input value={bookTitle} onChange={e => setBookTitle(e.target.value)}
                    placeholder="Ex: Dom Casmurro"
                    className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label>Autor</Label>
                  <Input value={bookAuthor} onChange={e => setBookAuthor(e.target.value)}
                    placeholder="Ex: Machado de Assis"
                    className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Início da leitura</Label>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      className="bg-white/10 border-white/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo final</Label>
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                      className="bg-white/10 border-white/20 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Quantos capítulos?</Label>
                  <Input type="number" min={1} value={chapterCount} onChange={e => setChapterCount(e.target.value)}
                    className="bg-white/10 border-white/20 text-white" />
                </div>
              </div>
            )}

            {/* STEP 5 — Pronto */}
            {step === 5 && (
              <div className="text-center space-y-5 py-6">
                <CheckCircle2 className="h-14 w-14 mx-auto text-emerald-400" />
                <h2 className="text-3xl font-bold">Tudo pronto!</h2>
                <p className="text-white/70 max-w-md mx-auto">
                  Suas {createdClasses.length} {createdClasses.length === 1 ? "turma está pronta" : "turmas estão prontas"}.
                  Compartilhe os códigos com os alunos e acompanhe o progresso pelo painel.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mt-6">
          <Button variant="ghost" onClick={back} disabled={step === 0 || saving}
            className="text-white/70 hover:bg-white/10 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <Button onClick={next} disabled={saving}
            className="font-bold text-[#021f53] hover:brightness-110 h-11 px-6"
            style={{ background: "linear-gradient(135deg,#E0A82E,#F5C842,#FCE17A)" }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> :
              step === 0 ? <>Vamos começar <ArrowRight className="h-4 w-4 ml-1" /></> :
              step === 5 ? "Ir para o painel" :
              <>Continuar <ArrowRight className="h-4 w-4 ml-1" /></>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EduOnboarding;
