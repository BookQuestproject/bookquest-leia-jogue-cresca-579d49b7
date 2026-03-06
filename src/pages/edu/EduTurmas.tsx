import { useState } from "react";
import EduLayout from "./EduLayout";
import { useClasses, ClassData } from "@/hooks/useClasses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Copy, Trash2, Users, BookOpen, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const EduTurmas = () => {
  const { classes, loading, createClass, deleteClass } = useClasses();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", grade: "", book_title: "", reading_deadline: "" });
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    const result = await createClass({
      name: form.name,
      grade: form.grade || undefined,
      book_title: form.book_title || undefined,
      reading_deadline: form.reading_deadline || undefined,
    });
    setCreating(false);
    if (result) {
      setIsCreateOpen(false);
      setForm({ name: "", grade: "", book_title: "", reading_deadline: "" });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Código copiado!", description: code });
  };

  return (
    <EduLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Turmas</h1>
            <p className="text-sm text-muted-foreground">Gerencie suas turmas de leitura</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/80">
            <Plus className="h-4 w-4 mr-2" />
            Nova Turma
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card border-border animate-pulse h-40" />
            ))}
          </div>
        ) : classes.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Nenhuma turma criada</p>
              <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                Criar primeira turma
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((c) => (
              <Card
                key={c.id}
                className="bg-card border-border hover:border-accent/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/edu/turmas/${c.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{c.name}</h3>
                      {c.grade && (
                        <span className="text-xs text-muted-foreground">{c.grade}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); copyCode(c.access_code); }}
                        className="flex items-center gap-1 text-xs font-mono bg-accent/10 text-accent px-2 py-1 rounded hover:bg-accent/20 transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                        {c.access_code}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Excluir turma?")) deleteClass(c.id);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {c.book_title && (
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        {c.book_title}
                      </div>
                    )}
                    {c.reading_deadline && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Prazo: {new Date(c.reading_deadline).toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Nova Turma</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Nome da turma *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: 9º Ano A - Manhã"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Série / Ano</label>
                <Input
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  placeholder="Ex: 9º Ano"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Livro obrigatório</label>
                <Input
                  value={form.book_title}
                  onChange={(e) => setForm({ ...form, book_title: e.target.value })}
                  placeholder="Ex: Dom Casmurro"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Prazo de leitura</label>
                <Input
                  type="date"
                  value={form.reading_deadline}
                  onChange={(e) => setForm({ ...form, reading_deadline: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!form.name.trim() || creating}>
                {creating ? "Criando..." : "Criar Turma"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </EduLayout>
  );
};

export default EduTurmas;
