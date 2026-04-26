import { useNavigate } from "react-router-dom";
import { Sparkles, GraduationCap, BookOpen, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useDemoMode } from "@/hooks/useDemoMode";
import { DEMO_STUDENT, DEMO_TEACHER, DEMO_CLASS } from "@/data/demoData";

interface DemoEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DemoEntryDialog = ({ open, onOpenChange }: DemoEntryDialogProps) => {
  const navigate = useNavigate();
  const { startDemo } = useDemoMode();

  const enter = (role: "student" | "teacher") => {
    startDemo(role);
    onOpenChange(false);
    navigate(role === "teacher" ? "/edu/demo/professor" : "/edu/demo/aluno", {
      replace: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-accent" />
            Explorar BookQuest EDU em modo demonstração
          </DialogTitle>
          <DialogDescription>
            Acesso instantâneo, sem cadastro. Todos os dados são fictícios e
            existem apenas no seu navegador.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <Card
            onClick={() => enter("student")}
            className="group cursor-pointer border-2 border-border hover:border-accent transition-all hover:shadow-lg"
          >
            <CardContent className="p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="h-7 w-7 text-accent" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-accent font-semibold">
                  Aluno demo
                </p>
                <h3 className="text-lg font-bold text-foreground">
                  {DEMO_STUDENT.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {DEMO_CLASS.name} · Já inscrito
                </p>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Livro da turma com progresso parcial</li>
                <li>• Missões, ranking e gamificação ativos</li>
                <li>• {DEMO_STUDENT.essencia} ✦ · Nível {DEMO_STUDENT.level}</li>
              </ul>
              <div className="flex items-center justify-end text-sm text-accent font-medium pt-1">
                Entrar como aluno
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => enter("teacher")}
            className="group cursor-pointer border-2 border-border hover:border-primary transition-all hover:shadow-lg"
          >
            <CardContent className="p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-primary font-semibold">
                  Professor demo
                </p>
                <h3 className="text-lg font-bold text-foreground">
                  {DEMO_TEACHER.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {DEMO_CLASS.school}
                </p>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Turma {DEMO_CLASS.name} com 28 alunos</li>
                <li>• Painel completo, ranking e relatórios</li>
                <li>• Atividades e correções pendentes</li>
              </ul>
              <div className="flex items-center justify-end text-sm text-primary font-medium pt-1">
                Entrar como professor
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-[11px] text-center text-muted-foreground pt-2">
          Você pode sair do modo demonstração a qualquer momento pelo banner
          dourado no topo.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default DemoEntryDialog;
