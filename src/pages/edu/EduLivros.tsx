import { useState } from "react";
import EduLayout from "./EduLayout";
import { useClasses } from "@/hooks/useClasses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClassBooksManager from "@/components/edu/ClassBooksManager";

const EduLivros = () => {
  const { classes, loading } = useClasses();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <EduLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Livros das Turmas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie o ciclo trimestral de leitura: livro atual, próximo agendado e histórico de cada turma.
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : classes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>Você ainda não tem turmas.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {classes.map((c) => {
              const isOpen = expanded === c.id;
              return (
                <Card key={c.id}>
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : c.id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          {c.name}
                          {c.grade && <span className="text-xs font-normal text-muted-foreground">· {c.grade}</span>}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {c.book_title ? `📖 ${c.book_title}` : "Sem livro em andamento"}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  {isOpen && (
                    <CardContent>
                      <ClassBooksManager classData={c} />
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </EduLayout>
  );
};

export default EduLivros;
