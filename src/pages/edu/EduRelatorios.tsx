import EduLayout from "./EduLayout";
import { useClasses } from "@/hooks/useClasses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";

const EduRelatorios = () => {
  const { classes, loading } = useClasses();
  const activeClasses = classes.filter((c) => c.is_active);

  return (
    <EduLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-accent" />
            Relatórios
          </h1>
          <p className="text-sm text-muted-foreground">Visão geral do progresso educacional</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm text-foreground">Turmas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{loading ? "—" : activeClasses.length}</p>
              <p className="text-xs text-muted-foreground mt-1">turmas em andamento</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm text-foreground">Livros em Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {loading ? "—" : new Set(activeClasses.filter((c) => c.book_title).map((c) => c.book_title)).size}
              </p>
              <p className="text-xs text-muted-foreground mt-1">obras diferentes atribuídas</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Relatórios detalhados com gráficos de evolução serão exibidos aqui conforme os alunos progridem.
            </p>
          </CardContent>
        </Card>
      </div>
    </EduLayout>
  );
};

export default EduRelatorios;
