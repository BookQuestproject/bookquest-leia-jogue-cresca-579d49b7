import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import { GraduationCap, Users, BookOpen, ArrowRight, Key, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import logoCrown from "@/assets/logo-crown-transparent.png";
import DemoButton from "@/components/demo/DemoButton";

const EduEntry = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: roleLoading, activateTeacher } = useEduRole();
  const [showTeacherCode, setShowTeacherCode] = useState(false);
  const [teacherCode, setTeacherCode] = useState("");
  const [activating, setActivating] = useState(false);

  // If already a teacher, redirect
  if (!authLoading && !roleLoading && user && isTeacher) {
    navigate("/edu/professor", { replace: true });
    return null;
  }

  const handleStudentClick = () => {
    if (!user) {
      navigate("/auth?redirect=/edu/aluno");
    } else {
      navigate("/edu/aluno");
    }
  };

  const handleTeacherClick = () => {
    if (!user) {
      navigate("/auth?redirect=/edu");
      return;
    }
    if (isTeacher) {
      navigate("/edu/professor");
    } else {
      setShowTeacherCode(true);
    }
  };

  const handleActivate = async () => {
    setActivating(true);
    const ok = await activateTeacher(teacherCode);
    setActivating(false);
    if (ok) {
      setShowTeacherCode(false);
      navigate("/edu/professor");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#021f53' }}>
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoCrown} alt="BookQuest" className="h-9 w-9" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-lg">BookQuest</span>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                EDU
              </span>
            </div>
          </div>
          {!user && (
            <Button variant="outline" size="sm" onClick={() => navigate("/auth?redirect=/edu")}>
              Entrar
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-3xl w-full space-y-10">
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <GraduationCap className="h-4 w-4" />
              Plataforma Educacional de Leitura
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Transforme a leitura obrigatória em uma{" "}
              <span className="text-primary">aventura gamificada</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Professores criam turmas e acompanham o progresso. Alunos leem, competem e se engajam.
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Card */}
            <Card
              className="group cursor-pointer border-2 border-border hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
              onClick={handleStudentClick}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <BookOpen className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Sou Aluno</h2>
                <p className="text-sm text-muted-foreground">
                  Entre na turma com o código do professor, leia, ganhe pontos e suba no ranking!
                </p>
                <Button className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors" variant="outline">
                  Entrar como Aluno
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Teacher Card */}
            <Card
              className="group cursor-pointer border-2 border-border hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
              onClick={handleTeacherClick}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Sou Professor</h2>
                <p className="text-sm text-muted-foreground">
                  Crie turmas, defina livros obrigatórios e acompanhe o progresso dos alunos em tempo real.
                </p>
                <Button className="w-full" variant="outline">
                  Entrar como Professor
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Demo CTA */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <DemoButton size="lg" label="Explorar BookQuest EDU em modo demonstração" />
            <p className="text-xs text-muted-foreground">Sem cadastro. Acesso instantâneo com dados fictícios.</p>
          </div>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: "📖", label: "Trilhas de Leitura" },
              { icon: "🏆", label: "Ranking da Turma" },
              { icon: "🎯", label: "Desafios Semanais" },
              { icon: "📊", label: "Métricas em Tempo Real" },
            ].map((f) => (
              <div key={f.label} className="p-4 rounded-xl bg-card border border-border">
                <span className="text-2xl">{f.icon}</span>
                <p className="text-xs font-medium text-muted-foreground mt-2">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Teacher Code Dialog */}
      <Dialog open={showTeacherCode} onOpenChange={setShowTeacherCode}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Key className="h-5 w-5 text-primary" />
              Código de Ativação do Professor
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Para acessar a área do professor, insira o código fornecido pela equipe BookQuest.
            </p>
            <Input
              value={teacherCode}
              onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}
              placeholder="Digite o código"
              className="text-center text-lg font-mono tracking-widest"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowTeacherCode(false)}>Cancelar</Button>
            <Button onClick={handleActivate} disabled={!teacherCode.trim() || activating}>
              {activating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Ativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EduEntry;
