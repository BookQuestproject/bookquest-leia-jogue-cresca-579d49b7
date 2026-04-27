import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BookOpen, BookMarked, History, CalendarPlus, Search, Send,
  PlayCircle, X, CheckCircle2, Clock, Plus,
} from "lucide-react";
import { useClassBooks, CatalogBook } from "@/hooks/useClassBooks";
import { ClassData } from "@/hooks/useClasses";

interface Props {
  classData: ClassData;
}

const ClassBooksManager = ({ classData }: Props) => {
  const {
    nextBook, history, loading,
    searchCatalog, scheduleNextBook, cancelNextBook,
    endCurrentBook, startNextNow, submitBookRequest,
  } = useClassBooks(classData.id);

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<CatalogBook[]>([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [pickedBook, setPickedBook] = useState<CatalogBook | null>(null);
  const [startDate, setStartDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [reqForm, setReqForm] = useState({ title: "", author: "", school_name: "", notes: "" });

  const handleSearch = async () => {
    setSearching(true);
    const r = await searchCatalog(searchQuery);
    setResults(r);
    setSearching(false);
  };

  const handleSchedule = async () => {
    if (!pickedBook) return;
    const ok = await scheduleNextBook({
      book_id: pickedBook.book_id,
      book_title: pickedBook.title,
      author: pickedBook.author,
      total_pages: pickedBook.total_pages,
      scheduled_start_date: startDate,
    });
    if (ok) {
      setScheduleDialogOpen(false);
      setPickedBook(null);
      setSearchQuery("");
      setResults([]);
    }
  };

  const handleSubmitRequest = async () => {
    if (!reqForm.title.trim() || !reqForm.author.trim()) return;
    const ok = await submitBookRequest(reqForm);
    if (ok) {
      setRequestDialogOpen(false);
      setReqForm({ title: "", author: "", school_name: "", notes: "" });
    }
  };

  const hasCurrentBook = !!classData.book_title;

  return (
    <div className="space-y-6">
      {/* ============ LIVRO ATUAL ============ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Livro atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasCurrentBook ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="font-serif text-xl font-semibold">{classData.book_title}</h3>
                  {classData.author && <p className="text-sm text-muted-foreground">{classData.author}</p>}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    {classData.reading_start_date && <span>Início: {new Date(classData.reading_start_date).toLocaleDateString("pt-BR")}</span>}
                    {classData.reading_deadline && <span>Término previsto: {new Date(classData.reading_deadline).toLocaleDateString("pt-BR")}</span>}
                    {classData.total_pages && <span>{classData.total_pages} páginas</span>}
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Encerrar livro atual
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Encerrar "{classData.book_title}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        O livro será arquivado no histórico da turma. O progresso de páginas dos alunos será zerado, mas Essência e medalhas permanecem.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => endCurrentBook(classData as any, null)}>
                        Encerrar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>Nenhum livro em andamento.</p>
              <p className="text-xs mt-1">Agende um próximo livro abaixo para iniciar um novo trimestre.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============ PRÓXIMO LIVRO ============ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookMarked className="h-5 w-5 text-accent" />
            Próximo livro da turma
          </CardTitle>
          <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <CalendarPlus className="h-4 w-4 mr-1" />
                {nextBook ? "Trocar" : "Agendar"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agendar próximo livro</DialogTitle>
                <DialogDescription>
                  Pesquise no catálogo BookQuest. Se não encontrar, solicite a criação.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar por título ou autor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={searching}>
                    <Search className="h-4 w-4 mr-1" />
                    Buscar
                  </Button>
                </div>

                {searching && <p className="text-sm text-muted-foreground">Buscando...</p>}

                {results.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-2">
                    {results.map((b) => (
                      <button
                        key={b.book_id}
                        onClick={() => setPickedBook(b)}
                        className={`w-full text-left flex gap-3 p-2 rounded hover:bg-muted transition ${
                          pickedBook?.book_id === b.book_id ? "bg-primary/10 ring-1 ring-primary" : ""
                        }`}
                      >
                        {b.cover_url && <img src={b.cover_url} alt="" className="w-10 h-14 object-cover rounded" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{b.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{b.author}</p>
                          {b.total_pages && <p className="text-xs text-muted-foreground">{b.total_pages} páginas</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery && !searching && results.length === 0 && (
                  <div className="text-center py-4 border-2 border-dashed rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">Não encontrou o livro?</p>
                    <Button variant="outline" size="sm" onClick={() => {
                      setRequestDialogOpen(true);
                      setReqForm((f) => ({ ...f, title: searchQuery }));
                      setScheduleDialogOpen(false);
                    }}>
                      <Send className="h-4 w-4 mr-1" />
                      Solicitar adição de livro
                    </Button>
                  </div>
                )}

                {pickedBook && (
                  <div className="border rounded-md p-3 bg-muted/30 space-y-2">
                    <p className="text-sm font-medium">Selecionado: {pickedBook.title}</p>
                    <div>
                      <label className="text-xs text-muted-foreground">Data de início</label>
                      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setScheduleDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSchedule} disabled={!pickedBook}>
                  Agendar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {nextBook ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h4 className="font-serif text-lg font-semibold">{nextBook.book_title}</h4>
                  {nextBook.author && <p className="text-sm text-muted-foreground">{nextBook.author}</p>}
                  <Badge variant="secondary" className="mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Agendado para {new Date(nextBook.scheduled_start_date).toLocaleDateString("pt-BR")}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {hasCurrentBook && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm">
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Iniciar agora
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Iniciar próximo livro agora?</AlertDialogTitle>
                          <AlertDialogDescription>
                            "{classData.book_title}" será encerrado e arquivado. A turma começará "{nextBook.book_title}" hoje. Essência e medalhas dos alunos são preservadas.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => startNextNow(classData)}>
                            Encerrar e iniciar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {!hasCurrentBook && (
                    <Button size="sm" onClick={() => startNextNow(classData)}>
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Iniciar agora
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={cancelNextBook}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Nenhum livro agendado. Planeje o próximo trimestre.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============ SOLICITAR LIVRO (rápido) ============ */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar novo livro</DialogTitle>
            <DialogDescription>
              Nossa equipe revisará e criará a trilha literária no catálogo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Título *</label>
              <Input value={reqForm.title} onChange={(e) => setReqForm({ ...reqForm, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Autor *</label>
              <Input value={reqForm.author} onChange={(e) => setReqForm({ ...reqForm, author: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Escola</label>
              <Input value={reqForm.school_name} onChange={(e) => setReqForm({ ...reqForm, school_name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Observações</label>
              <Textarea rows={2} value={reqForm.notes} onChange={(e) => setReqForm({ ...reqForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRequestDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmitRequest} disabled={!reqForm.title || !reqForm.author}>
              <Send className="h-4 w-4 mr-1" />
              Enviar solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ HISTÓRICO ============ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-muted-foreground" />
            Histórico de livros
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum livro encerrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="border rounded-md p-3 space-y-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-medium">{h.book_title}</p>
                      {h.author && <p className="text-xs text-muted-foreground">{h.author}</p>}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(h.started_at).toLocaleDateString("pt-BR")} → {new Date(h.ended_at).toLocaleDateString("pt-BR")}
                    </Badge>
                  </div>
                  {h.avg_progress !== null && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progresso médio da turma</span>
                        <span className="font-medium">{h.avg_progress}%</span>
                      </div>
                      <Progress value={h.avg_progress} className="h-1.5" />
                    </div>
                  )}
                  {h.members_count !== null && (
                    <p className="text-xs text-muted-foreground">{h.members_count} alunos participaram</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating "request" button if no dialog active */}
      {!requestDialogOpen && (
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={() => setRequestDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Solicitar livro que não está no catálogo
          </Button>
        </div>
      )}
    </div>
  );
};

export default ClassBooksManager;
