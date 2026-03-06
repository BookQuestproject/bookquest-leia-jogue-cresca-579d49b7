import EduLayout from "./EduLayout";
import { useClasses } from "@/hooks/useClasses";
import { Users, BookOpen, TrendingUp, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EduDashboard = () => {
  const { classes, loading } = useClasses();
  const navigate = useNavigate();

  const activeClasses = classes.filter((c) => c.is_active);
  const totalClasses = activeClasses.length;

  const stats = [
    { label: "Turmas Ativas", value: totalClasses, icon: Users, color: "text-blue-400" },
    { label: "Livros Atribuídos", value: activeClasses.filter((c) => c.book_title).length, icon: BookOpen, color: "text-green-400" },
    { label: "Com Prazo Definido", value: activeClasses.filter((c) => c.reading_deadline).length, icon: TrendingUp, color: "text-accent" },
  ];

  return (
    <EduLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-7 w-7 text-accent" />
              BookQuest EDU
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Painel educacional para acompanhamento de turmas
            </p>
          </div>
          <Button onClick={() => navigate("/edu/turmas")} className="bg-primary hover:bg-primary/80">
            <Users className="h-4 w-4 mr-2" />
            Gerenciar Turmas
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`p-3 rounded-xl bg-muted ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{loading ? "—" : s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Classes */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Turmas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Carregando...</p>
            ) : activeClasses.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma turma criada ainda.</p>
                <Button onClick={() => navigate("/edu/turmas")} variant="outline" className="mt-3">
                  Criar primeira turma
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeClasses.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => navigate(`/edu/turmas/${c.id}`)}
                  >
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.grade && `${c.grade} · `}
                        {c.book_title || "Sem livro definido"}
                      </p>
                    </div>
                    <span className="text-xs font-mono bg-accent/10 text-accent px-2 py-1 rounded">
                      {c.access_code}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </EduLayout>
  );
};

export default EduDashboard;
