import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import { useClasses } from "@/hooks/useClasses";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap, Users, BookOpen, Loader2, ArrowRight, ArrowLeft,
  CheckCircle2, Copy, Sparkles, Link as LinkIcon,
} from "lucide-react";
import logoCrown from "@/assets/logo-crown-transparent.png";

const GRADES = ["6º ano", "7º ano", "8º ano", "9º ano", "Ensino Médio"];
const STEPS = ["Boas-vindas", "Perfil", "Turma", "Convidar", "Jornada", "Pronto"] as const;

const EduOnboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: roleLoading } = useEduRole();
  const { createClass } = useClasses();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Profile
  const [fullName, setFullName] = useState("");
  const [school, setSchool] = useState("");
  const [city, setCity] = useState("");
  const [stateUF, setStateUF] = useState("");
  const [grades, setGrades] = useState<string[]>([]);

  // Class
  const [className, setClassName] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [classYear, setClassYear] = useState(new Date().getFullYear().toString());
  const [studentCount, setStudentCount] = useState("30");
  const [createdClass, setCreatedClass] = useState<any>(null);

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

  // Hydrate profile fields
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
      toast({ title: "Preencha todos os campos", variant: "destructive" });
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
    if (error) { toast({ title: "Erro ao salvar perfil", variant: "destructive" }); return false; }
    return true;
  };

  const createFirstClass = async () => {
    if (!className.trim() || !classGrade) {
      toast({ title: "Preencha nome e série da turma", variant: "destructive" });
      return false;
    }
    setSaving(true);
    const created = await createClass({
      name: className.trim(),
      grade: classGrade,
    });
    if (created) {
      // also save year + estimate
      await supabase.from("classes")
        .update({
          school_year: parseInt(classYear) || null,
          student_count_estimate: parseInt(studentCount) || null,
        } as any)
        .eq("id", created.id);
      setCreatedClass(created);
    }
    setSaving(false);
    return !!created;
  };

  const createFirstJourney = async () => {
    if (!bookTitle.trim() || !createdClass) {
      toast({ title: "Informe o nome do livro", variant: "destructive" });
      return false;
    }
    if (!user) return false;
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

    if (!error && journey) {
      await supabase.from("edu_journey_classes" as any).insert({
        journey_id: (journey as any).id,
        class_id: createdClass.id,
      } as any);
      // also patch the class with the book details to feed student dashboard
      await supabase.from("classes").update({
        book_title: bookTitle.trim(),
        author: bookAuthor.trim() || null,
        reading_start_date: startDate,
        reading_deadline: endDate,
      }).eq("id", createdClass.id);
    }
    setSaving(false);
    if (error) { toast({ title: "Erro ao criar jornada", variant: "destructive" }); return false; }
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
    if (step === 2) { if (!(await createFirstClass())) return; }
    if (step === 4) { if (!(await createFirstJourney())) return; }
    if (step === 5) { await finish(); return; }
    setStep(s => s + 1);
  };

  const back = () => setStep(s => Math.max(0, s - 1));

  const copyCode = () => {
    if (!createdClass) return;
    navigator.clipboard.writeText(createdClass.access_code);
    toast({ title: "Código copiado!" });
  };
  const copyLink = () => {
    if (!createdClass) return;
    const link = `${window.location.origin}/entrar/${createdClass.access_code}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copiado!" });
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
            {/* STEP 0 — Boas vindas */}
            {step === 0 && (
              <div className="text-center space-y-5 py-6">
                <Sparkles className="h-12 w-12 mx-auto text-amber-400" />
                <h1 className="text-3xl font-bold">Bem-vindo ao BookQuest EDU 📚</h1>
                <p className="text-white/70 max-w-md mx-auto">
                  Vamos preparar sua primeira turma de leitura. Leva menos de 5 minutos.
                </p>
              </div>
            )}

            {/* STEP 1 — Perfil */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Conte sobre você</h2>
                <div className="space-y-2">
                  <Label>Nome completo</Label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label>Séries que leciona</Label>
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
                    className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2 col-span-2">
                    <Label>Cidade</Label>
                    <Input value={city} onChange={e => setCity(e.target.value)}
                      className="bg-white/10 border-white/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label>UF</Label>
                    <Input value={stateUF} onChange={e => setStateUF(e.target.value)} maxLength={2}
                      className="bg-white/10 border-white/20 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — Turma */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-amber-400" />
                  <h2 className="text-2xl font-bold">Crie sua primeira turma</h2>
                </div>
                <div className="space-y-2">
                  <Label>Nome da turma</Label>
                  <Input value={className} onChange={e => setClassName(e.target.value)}
                    placeholder="Ex: 6º Ano A"
                    className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Série</Label>
                    <select
                      value={classGrade}
                      onChange={e => setClassGrade(e.target.value)}
                      className="w-full h-10 rounded-md bg-white/10 border border-white/20 text-white px-3"
                    >
                      <option value="">Selecione…</option>
                      {GRADES.map(g => <option key={g} value={g} className="text-black">{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ano letivo</Label>
                    <Input value={classYear} onChange={e => setClassYear(e.target.value)}
                      className="bg-white/10 border-white/20 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Número aproximado de alunos</Label>
                  <Input type="number" value={studentCount} onChange={e => setStudentCount(e.target.value)}
                    className="bg-white/10 border-white/20 text-white" />
                </div>
              </div>
            )}

            {/* STEP 3 — Convite */}
            {step === 3 && createdClass && (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-amber-400" />
                  <h2 className="text-2xl font-bold">Convide seus alunos</h2>
                </div>
                <p className="text-white/70 text-sm">
                  Seus alunos entrarão sozinhos usando o e-mail escolar. Compartilhe o código ou o link com a turma.
                </p>

                <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-5 space-y-3">
                  <p className="text-xs uppercase tracking-wider text-amber-400">Código da turma</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-3xl font-mono font-bold tracking-widest">{createdClass.access_code}</p>
                    <Button variant="outline" size="sm" onClick={copyCode} className="bg-white/10 text-white hover:bg-white/20">
                      <Copy className="h-4 w-4 mr-1" /> Copiar
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/5 p-5 space-y-3">
                  <p className="text-xs uppercase tracking-wider text-white/60">Link da turma</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-mono break-all flex items-center gap-2">
                      <LinkIcon className="h-3.5 w-3.5 text-white/50 flex-shrink-0" />
                      {window.location.origin}/entrar/{createdClass.access_code}
                    </p>
                    <Button variant="outline" size="sm" onClick={copyLink} className="bg-white/10 text-white hover:bg-white/20">
                      <Copy className="h-4 w-4 mr-1" /> Copiar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 — Jornada */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-amber-400" />
                  <h2 className="text-2xl font-bold">Crie sua primeira jornada de leitura</h2>
                </div>
                <div className="space-y-2">
                  <Label>Nome do livro</Label>
                  <Input value={bookTitle} onChange={e => setBookTitle(e.target.value)}
                    placeholder="Dom Casmurro"
                    className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="space-y-2">
                  <Label>Autor</Label>
                  <Input value={bookAuthor} onChange={e => setBookAuthor(e.target.value)}
                    placeholder="Machado de Assis"
                    className="bg-white/10 border-white/20 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Data de início</Label>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      className="bg-white/10 border-white/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label>Data final</Label>
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                      className="bg-white/10 border-white/20 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Número de capítulos</Label>
                  <Input type="number" min={1} value={chapterCount} onChange={e => setChapterCount(e.target.value)}
                    className="bg-white/10 border-white/20 text-white" />
                </div>
              </div>
            )}

            {/* STEP 5 — Pronto */}
            {step === 5 && (
              <div className="text-center space-y-5 py-6">
                <CheckCircle2 className="h-14 w-14 mx-auto text-emerald-400" />
                <h2 className="text-3xl font-bold">Sua turma está pronta!</h2>
                <p className="text-white/70 max-w-md mx-auto">
                  Compartilhe o código <strong className="font-mono text-amber-400">{createdClass?.access_code}</strong> com seus alunos
                  e acompanhe o progresso pelo painel.
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
              step === 0 ? <>Começar configuração <ArrowRight className="h-4 w-4 ml-1" /></> :
              step === 5 ? "Ir para o painel" :
              <>Continuar <ArrowRight className="h-4 w-4 ml-1" /></>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EduOnboarding;
