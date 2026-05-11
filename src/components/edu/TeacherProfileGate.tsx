import { useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GRADES = ["6º ano", "7º ano", "8º ano", "9º ano", "Ensino Médio"];

interface Props { children: ReactNode }

const TeacherProfileGate = ({ children }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [school, setSchool] = useState("");
  const [city, setCity] = useState("");
  const [stateUF, setStateUF] = useState("");
  const [grades, setGrades] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      if (!user) { setLoading(false); return; }
      const { data: tch } = await supabase
        .from("edu_teachers" as any).select("profile_completed")
        .eq("user_id", user.id).maybeSingle();
      const { data: prof } = await supabase
        .from("profiles").select("full_name, school_name, city, state, grades_taught")
        .eq("id", user.id).maybeSingle();

      const profileOk = (tch as any)?.profile_completed === true ||
        (!!prof?.full_name && !!(prof as any)?.school_name && !!(prof as any)?.city && (prof as any)?.grades_taught?.length > 0);

      if (!profileOk) {
        setFullName(prof?.full_name ?? "");
        setSchool((prof as any)?.school_name ?? "");
        setCity((prof as any)?.city ?? "");
        setStateUF((prof as any)?.state ?? "");
        setGrades((prof as any)?.grades_taught ?? []);
        setNeedsProfile(true);
      }
      setLoading(false);
    })();
  }, [user]);

  const toggleGrade = (g: string) =>
    setGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const save = async () => {
    if (!user) return;
    if (!fullName.trim() || !school.trim() || !city.trim() || !stateUF.trim() || grades.length === 0) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error: pErr } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        school_name: school.trim(),
        city: city.trim(),
        state: stateUF.trim().toUpperCase().slice(0, 2),
        grades_taught: grades,
      } as any)
      .eq("id", user.id);
    const { error: tErr } = await supabase
      .from("edu_teachers" as any)
      .update({ profile_completed: true } as any)
      .eq("user_id", user.id);
    setSaving(false);
    if (pErr || tErr) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
      return;
    }
    toast({ title: "Perfil completo!", description: "Bem-vindo ao painel." });
    setNeedsProfile(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!needsProfile) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-amber-500 text-xs uppercase tracking-wider font-bold">
            <ShieldCheck className="h-4 w-4" /> Atualização obrigatória
          </div>
          <CardTitle className="text-2xl mt-1">Complete seu perfil para continuar</CardTitle>
          <p className="text-sm text-muted-foreground">
            Precisamos dessas informações para personalizar seu painel e relatórios.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome completo *</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Maria Silva" />
          </div>
          <div className="space-y-2">
            <Label>Séries que leciona *</Label>
            <div className="flex flex-wrap gap-2">
              {GRADES.map(g => (
                <Badge
                  key={g}
                  variant={grades.includes(g) ? "default" : "outline"}
                  onClick={() => toggleGrade(g)}
                  className="cursor-pointer select-none"
                >
                  {g}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Nome da escola *</Label>
            <Input value={school} onChange={e => setSchool(e.target.value)} placeholder="Colégio Modelo" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2 col-span-2">
              <Label>Cidade *</Label>
              <Input value={city} onChange={e => setCity(e.target.value)} placeholder="São Paulo" />
            </div>
            <div className="space-y-2">
              <Label>UF *</Label>
              <Input value={stateUF} onChange={e => setStateUF(e.target.value)} placeholder="SP" maxLength={2} />
            </div>
          </div>
          <Button onClick={save} disabled={saving} className="w-full h-11">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar e continuar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherProfileGate;
