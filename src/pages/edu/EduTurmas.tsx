import { useState } from "react";
import EduLayout from "./EduLayout";
import { useClasses, ClassData } from "@/hooks/useClasses";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Copy, Trash2, Users, BookOpen, Calendar, Archive, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { RenameClassDialog } from "@/components/edu/RenameClassDialog";

// Mock book library - replace with actual data source
const libraryBooks = [
  { id: "dom-casmurro", title: "Dom Casmurro", author: "Machado de Assis", pages: 256 },
  { id: "1984", title: "1984", author: "George Orwell", pages: 416 },
  { id: "pequeno-principe", title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", pages: 96 },
];

const EduTurmas = () => {
  const { classes, loading, createClass, deleteClass, archiveClass } = useClasses();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [bookSource, setBookSource] = useState<"library" | "manual">("library");
  const [form, setForm] = useState({
    name: "",
    grade: "",
    description: "",
    book_title: "",
    author: "",
    total_pages: "",
    reading_start_date: "",
    reading_deadline: "",
  });
  const [selectedLibraryBook, setSelectedLibraryBook] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);

  const activeClasses = classes.filter(c => !c.is_archived);
  const archivedClasses = classes.filter(c => c.is_archived);
  const displayedClasses = showArchived ? archivedClasses : activeClasses;

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    
    setCreating(true);
    
    let bookData = {};
    if (bookSource === "library" && selectedLibraryBook) {
      const book = libraryBooks.find(b => b.id === selectedLibraryBook);
      if (book) {
        bookData = {
          book_id: book.id,
          book_title: book.title,
          author: book.author,
          total_pages: book.pages,
        };
      }
    } else if (bookSource === "manual" && form.book_title.trim()) {
      bookData = {
        book_title: form.book_title,
        author: form.author || undefined,
        total_pages: form.total_pages ? parseInt(form.total_pages) : undefined,
      };
    }

    const result = await createClass({
      name: form.name,
      grade: form.grade || undefined,
      description: form.description || undefined,
      reading_start_date: form.reading_start_date || undefined,
      reading_deadline: form.reading_deadline || undefined,
      ...bookData,
    });
    
    setCreating(false);
    if (result) {
      setIsCreateOpen(false);
      setForm({
        name: "",
        grade: "",
        description: "",
        book_title: "",
        author: "",
        total_pages: "",
        reading_start_date: "",
        reading_deadline: "",
      });
      setSelectedLibraryBook("");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Código copiado!", description: code });
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Arquivar esta turma?")) return;
    await archiveClass(id);
    toast({ title: "Turma arquivada" });
  };

  return (
    <EduLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Turmas</h1>
            <p className="text-sm text-muted-foreground">Gerencie suas turmas de leitura</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showArchived ? "default" : "outline"}
              onClick={() => setShowArchived(!showArchived)}
              size="sm"
            >
              <Archive className="h-4 w-4 mr-2" />
              {showArchived ? "Voltar" : "Arquivadas"}
            </Button>
            <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/80">
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card border-border animate-pulse h-40" />
            ))}
          </div>
        ) : displayedClasses.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                {showArchived ? "Nenhuma turma arquivada" : "Nenhuma turma criada"}
              </p>
              {!showArchived && (
                <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                  Criar primeira turma
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedClasses.map((c) => (
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
                      {!showArchived && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive(c.id);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-accent transition-colors"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      )}
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
                        {c.author && ` - ${c.author}`}
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
          <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Série / Ano</label>
                  <Input
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    placeholder="Ex: 9º Ano"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Descrição</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descrição da turma..."
                  rows={2}
                />
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold mb-3">Livro da Turma</h3>
                <Tabs value={bookSource} onValueChange={(v) => setBookSource(v as "library" | "manual")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="library">Da Biblioteca</TabsTrigger>
                    <TabsTrigger value="manual">Cadastro Manual</TabsTrigger>
                  </TabsList>
                  <TabsContent value="library" className="space-y-3 mt-4">
                    <div className="space-y-2">
                      {libraryBooks.map((book) => (
                        <label
                          key={book.id}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedLibraryBook === book.id
                              ? "border-accent bg-accent/5"
                              : "border-border hover:border-accent/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="library-book"
                            value={book.id}
                            checked={selectedLibraryBook === book.id}
                            onChange={(e) => setSelectedLibraryBook(e.target.value)}
                            className="text-accent"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{book.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {book.author} · {book.pages} páginas
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="manual" className="space-y-3 mt-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Título do livro</label>
                      <Input
                        value={form.book_title}
                        onChange={(e) => setForm({ ...form, book_title: e.target.value })}
                        placeholder="Ex: Dom Casmurro"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Autor</label>
                      <Input
                        value={form.author}
                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                        placeholder="Ex: Machado de Assis"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Total de páginas</label>
                      <Input
                        type="number"
                        value={form.total_pages}
                        onChange={(e) => setForm({ ...form, total_pages: e.target.value })}
                        placeholder="Ex: 256"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold mb-3">Planejamento de Leitura</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Data de início</label>
                    <Input
                      type="date"
                      value={form.reading_start_date}
                      onChange={(e) => setForm({ ...form, reading_start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Prazo final</label>
                    <Input
                      type="date"
                      value={form.reading_deadline}
                      onChange={(e) => setForm({ ...form, reading_deadline: e.target.value })}
                    />
                  </div>
                </div>
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
