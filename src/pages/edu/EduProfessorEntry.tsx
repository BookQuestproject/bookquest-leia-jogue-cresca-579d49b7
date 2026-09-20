import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, GraduationCap, LayoutDashboard, LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEduRole } from "@/hooks/useEduRole";
import logoCrown from "@/assets/logo-crown-transparent.png";

const EduProfessorEntry = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isTeacher, loading: roleLoading } = useEduRole();

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (user && isTeacher) {
      navigate("/edu/professor", { replace: true });
    } else if (user && !isTeacher) {
      navigate("/edu", { replace: true });
    }
  }, [user, isTeacher, authLoading, roleLoading, navigate]);

  const goToPanel = () => {
    if (user && isTeacher) {
      navigate("/edu/professor");
      return;
    }
    if (user) {
      navigate("/edu");
      return;
    }
    navigate("/auth?redirect=/edu/professor");
  };

  return (
    <main className="min-h-screen bg-transparent text-foreground overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-96 bg-accent/[0.05] blur-3xl" />
        <div className="absolute right-[-12rem] bottom-[-8rem] h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <nav className="relative z-10 border-b border-border/40 bg-sidebar/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/edu")} className="flex items-center gap-2" aria-label="BookQuest EDU">
            <img src={logoCrown} alt="BookQuest" className="h-8 w-8" />
            <span className="font-bold text-foreground">BookQuest</span>
            <span className="text-[10px] font-bold tracking-widest text-accent border border-accent/30 rounded-full px-2 py-0.5">EDU</span>
          </button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/edu")} className="text-muted-foreground hover:text-foreground">
            Landing pública /edu
          </Button>
        </div>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-5 py-14 lg:py-20 grid lg:grid-cols-[1fr_0.9fr] gap-10 items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-bold text-accent">
            <GraduationCap className="h-3.5 w-3.5" />
            Entrada exclusiva para professores
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>/edu</span>
              <ArrowRight className="h-3 w-3" />
              <span className="text-accent font-semibold">/edu/professor</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-serif font-bold leading-tight">
              Entre direto no painel atualizado do professor.
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Acesse suas turmas, indicadores de leitura, ranking e insights pedagógicos no ambiente gamificado do BookQuest EDU.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" onClick={goToPanel} className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2 rounded-xl shadow-lg shadow-accent/25">
              <LayoutDashboard className="h-4 w-4" />
              Ir para o painel do professor
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth?redirect=/edu/professor")} className="gap-2 rounded-xl">
              <LogIn className="h-4 w-4" />
              Entrar com minha conta
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card/70 backdrop-blur-xl p-5 shadow-2xl shadow-background/40">
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-bold">Rota ativa</p>
                <p className="text-xl font-bold text-foreground">/edu/professor</p>
              </div>
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            {[
              ["Painel novo", "Visual gamificado azul e dourado"],
              ["Nova turma", "Criação conectada ao layout atualizado"],
              ["Visão geral", "Sempre retorna para o painel premium"],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl border border-border/70 bg-background/30 p-4">
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default EduProfessorEntry;
