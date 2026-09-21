import { useEffect, useMemo, useState } from "react";
import { BookOpen, Bot, CheckCircle2, Edit3, Library, Plus, Search, Sparkles, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useClasses, ClassData } from "@/hooks/useClasses";
import { useToast } from "@/hooks/use-toast";
import { bookTrails, expandChapters } from "@/pages/Trilhas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type LibraryBook = {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  total_pages: number | null;
  genre: string | null;
  source_book_id?: string | null;
  custom?: boolean;
  editable?: boolean;
};

type Chapter = {
  id: string;
  chapter_number: number;
  title: string;
  start_page: number;
  end_page: number;
  context_text: string | null;
};

type BookQuestion = {
  id: string;
  chapter_number: number;
  question_type: string;
  question_text: string;
  options: string[];
  correct_answer: number | null;
  explanation: string | null;
  source: string;
};

const normalize = (value: string) =>
  value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const EduBookLibraryManager = () => {
  const { user } = useAuth();
  const { classes, setBookForClass } = useClasses();
  const { toast } = useToast();

  const [customBooks, setCustomBooks] = useState<LibraryBook[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assignTarget, setAssignTarget] = useState<LibraryBook | null>(null);
  const [assignClassId, setAssignClassId] = useState("");
  const [editorBookId, setEditorBookId] = useState<string | null>(null);
  const [editorTitle, setEditorTitle] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [questions, setQuestions] = useState<BookQuestion[]>([]);
  const [chapterId, setChapterId] = useState<number>(1);
  const [questionDraft, setQuestionDraft] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [createForm, setCreateForm] = useState({
    title: "",
    author: "",
    total_pages: "200",
    genre: "Literatura",
    cover_url: "",
    chapter_count: "10",
  });

  const loadBooks = async () => {
    setLoadingBooks(true);
    const { data } = await supabase
      .from("edu_books" as any)
      .select("id,title,author,cover_url,total_pages,genre,source_book_id,is_active")
      .eq("is_active", true)
      .order("title", { ascending: true });
    setCustomBooks(((data || []) as any[]).map((book) => ({ ...book, custom: true, editable: true })));
    setLoadingBooks(false);
  };

  useEffect(() => { void loadBooks(); }, [user?.id]);

  const catalogBooks = useMemo<LibraryBook[]>(
    () => bookTrails.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      cover_url: book.coverImage || null,
      total_pages: book.chapters.reduce((sum, chapter) => sum + (chapter.totalPages || 0), 0) || null,
      genre: book.genre,
      custom: false,
      editable: false,
    })),
    [],
  );

  const filteredCatalog = useMemo(
    () => catalogBooks.filter((book) => {
      const q = normalize(query);
      return !q || normalize(book.title).includes(q) || normalize(book.author || "").includes(q);
    }).slice(0, 18),
    [catalogBooks, query],
  );

  const filteredCustom = useMemo(
    () => customBooks.filter((book) => {
      const q = normalize(query);
      return !q || normalize(book.title).includes(q) || normalize(book.author || "").includes(q);
    }),
    [customBooks, query],
  );

  const openAssignment = (book: LibraryBook) => {
    setAssignTarget(book);
    setAssignClassId(classes.find((c) => c.book_id === book.id)?.id || classes[0]?.id || "");
  };

  const ensureEditableCatalogBook = async (catalog: LibraryBook) => {
    if (!user) return null;

    const existing = customBooks.find(
      (book) => book.source_book_id === catalog.id,
    );
    if (existing) return existing;

    const source = bookTrails.find((book) => book.id === catalog.id);
    if (!source) return null;

    const { data: inserted, error } = await supabase
      .from("edu_books" as any)
      .insert({
        title: source.title,
        author: source.author,
        cover_url: source.coverImage || null,
        total_pages: catalog.total_pages,
        genre: source.genre,
        theme_color: source.themeColor,
        source_book_id: source.id,
        created_by: user.id,
      })
      .select("id,title,author,cover_url,total_pages,genre,source_book_id")
      .single();

    if (error || !inserted) {
      toast({ title: "Não foi possível preparar o livro", description: error?.message || "Tente novamente.", variant: "destructive" });
      return null;
    }

    const expanded = expandChapters(source.chapters, source.totalChapters);
    const chapterRows = expanded.map((chapter, index) => {
      const previousPages = expanded.slice(0, index).reduce((sum, item) => sum + (item.totalPages || 0), 0);
      const pages = Math.max(1, chapter.totalPages || 18);
      return {
        book_id: inserted.id,
        chapter_number: chapter.id,
        title: chapter.title || `Capítulo ${chapter.id}`,
        start_page: previousPages + 1,
        end_page: previousPages + pages,
        context_text: null,
      };
    });
    await supabase.from("edu_book_chapters" as any).insert(chapterRows);

    const questionRows = expanded
      .filter((chapter) => Boolean(chapter.question?.text))
      .map((chapter) => ({
        book_id: inserted.id,
        chapter_number: chapter.id,
        question_type: "multiple_choice",
        question_text: chapter.question!.text,
        options: chapter.question!.options || [],
        correct_answer: chapter.question!.correctAnswer ?? null,
        explanation: chapter.question!.explanation || null,
        source: "catalog",
        created_by: user.id,
      }));
    if (questionRows.length) {
      await supabase.from("edu_book_questions" as any).insert(questionRows);
    }

    const book = { ...(inserted as any), custom: true, editable: true } as LibraryBook;
    setCustomBooks((prev) => [book, ...prev]);
    return book;
  };

  const createCustomBook = async () => {
    if (!user || createForm.title.trim().length < 2) return;
    setSaving(true);

    const totalPages = Math.max(1, Number(createForm.total_pages) || 200);
    const chapterCount = Math.max(1, Math.min(60, Number(createForm.chapter_count) || 10));
    const { data, error } = await supabase
      .from("edu_books" as any)
      .insert({
        title: createForm.title.trim(),
        author: createForm.author.trim() || null,
        total_pages: totalPages,
        genre: createForm.genre.trim() || null,
        cover_url: createForm.cover_url.trim() || null,
        created_by: user.id,
      })
      .select("id,title,author,cover_url,total_pages,genre,source_book_id")
      .single();

    if (error || !data) {
      setSaving(false);
      toast({ title: "Erro ao criar livro", description: error?.message || "Tente novamente.", variant: "destructive" });
      return;
    }

    const pagesPerChapter = Math.max(1, Math.ceil(totalPages / chapterCount));
    const chapterRows = Array.from({ length: chapterCount }, (_, index) => ({
      book_id: data.id,
      chapter_number: index + 1,
      title: `Capítulo ${index + 1}`,
      start_page: index * pagesPerChapter + 1,
      end_page: Math.min(totalPages, (index + 1) * pagesPerChapter),
      context_text: null,
    }));
    await supabase.from("edu_book_chapters" as any).insert(chapterRows);

    setCustomBooks((prev) => [{ ...(data as any), custom: true, editable: true }, ...prev]);
    setCreateForm({ title: "", author: "", total_pages: "200", genre: "Literatura", cover_url: "", chapter_count: "10" });
    setCreating(false);
    setSaving(false);
    toast({ title: "Livro criado", description: "Agora você pode editar capítulos e perguntas." });
    setEditorBookId(data.id);
  };

  const loadEditor = async (book: LibraryBook) => {
    const editable = book.custom ? book : await ensureEditableCatalogBook(book);
    if (!editable) return;
    setEditorBookId(editable.id);
    setEditorTitle(editable.title);

    const [{ data: chapterRows }, { data: questionRows }] = await Promise.all([
      supabase.from("edu_book_chapters" as any)
        .select("id,chapter_number,title,start_page,end_page,context_text")
        .eq("book_id", editable.id)
        .order("chapter_number", { ascending: true }),
      supabase.from("edu_book_questions" as any)
        .select("id,chapter_number,question_type,question_text,options,correct_answer,explanation,source")
        .eq("book_id", editable.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true }),
    ]);
    setChapters((chapterRows || []) as Chapter[]);
    setQuestions(((questionRows || []) as any[]).map((row) => ({
      ...row,
      options: Array.isArray(row.options) ? row.options : [],
    })) as BookQuestion[]);
    setChapterId((chapterRows as any[])?.[0]?.chapter_number || 1);
    setAiSuggestions([]);
  };

  const currentChapter = chapters.find((chapter) => chapter.chapter_number === chapterId) || chapters[0];
  const currentQuestions = questions.filter((question) => question.chapter_number === chapterId);

  const saveChapter = async () => {
    if (!currentChapter || !editorBookId) return;
    const { error } = await supabase.from("edu_book_chapters" as any).update({
      title: currentChapter.title.trim() || `Capítulo ${chapterId}`,
      start_page: Math.max(1, Number(currentChapter.start_page) || 1),
      end_page: Math.max(Number(currentChapter.start_page) || 1, Number(currentChapter.end_page) || 1),
      context_text: currentChapter.context_text?.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq("id", currentChapter.id);
    if (error) {
      toast({ title: "Não consegui salvar o capítulo", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Capítulo salvo" });
  };

  const addQuestion = async (draft = questionDraft) => {
    if (!editorBookId || !draft.trim() || !user) return;
    const { data, error } = await supabase.from("edu_book_questions" as any).insert({
      book_id: editorBookId,
      chapter_number: chapterId,
      question_type: "open",
      question_text: draft.trim(),
      options: [],
      source: "teacher",
      created_by: user.id,
    }).select("id,chapter_number,question_type,question_text,options,correct_answer,explanation,source").single();

    if (error || !data) {
      toast({ title: "Não consegui salvar a pergunta", description: error?.message || "Tente novamente.", variant: "destructive" });
      return;
    }
    setQuestions((prev) => [...prev, { ...(data as any), options: [] }]);
    setQuestionDraft("");
    await supabase.rpc("sync_edu_book_question_to_classes" as any, { _book_question_id: data.id });
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase.from("edu_book_questions" as any).update({ is_active: false }).eq("id", id);
    if (error) {
      toast({ title: "Não consegui remover a pergunta", description: error.message, variant: "destructive" });
      return;
    }
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const generateAi = async () => {
    if (!editorBookId || !currentChapter) return;
    setAiLoading(true);
    setAiSuggestions([]);
    const { data, error } = await supabase.functions.invoke("generate-reflection", {
      body: {
        bookTitle: editorTitle,
        chapterTitle: currentChapter.title,
        chapterId: currentChapter.chapter_number,
        totalChapters: chapters.length,
        chapterContext: currentChapter.context_text || undefined,
      },
    });
    setAiLoading(false);
    if (error || !data?.questions?.length) {
      toast({ title: "A IA não conseguiu sugerir perguntas", description: error?.message || "Tente novamente.", variant: "destructive" });
      return;
    }
    setAiSuggestions(data.questions);
  };

  const saveAiSuggestion = async (suggestion: any) => {
    if (!editorBookId || !user) return;
    const { data, error } = await supabase.from("edu_book_questions" as any).insert({
      book_id: editorBookId,
      chapter_number: chapterId,
      question_type: suggestion.type || "open",
      question_text: suggestion.question || "",
      options: suggestion.options || [],
      correct_answer: typeof suggestion.correctAnswer === "number" ? suggestion.correctAnswer : null,
      explanation: suggestion.explanation || null,
      source: "ai",
      created_by: user.id,
    }).select("id,chapter_number,question_type,question_text,options,correct_answer,explanation,source").single();
    if (error || !data) {
      toast({ title: "Não consegui adicionar a sugestão", description: error?.message || "Tente novamente.", variant: "destructive" });
      return;
    }
    setQuestions((prev) => [...prev, { ...(data as any), options: Array.isArray((data as any).options) ? (data as any).options : [] }]);
    await supabase.rpc("sync_edu_book_question_to_classes" as any, { _book_question_id: data.id });
    setAiSuggestions((prev) => prev.filter((item) => item !== suggestion));
    toast({ title: "Pergunta adicionada" });
  };

  const assignBook = async () => {
    if (!assignTarget || !assignClassId) return;
    const cls = classes.find((item) => item.id === assignClassId);
    if (!cls) return;

    const book = assignTarget.custom ? assignTarget : await ensureEditableCatalogBook(assignTarget);
    if (!book) return;

    if (cls.book_title && !window.confirm(`A turma já está usando "${cls.book_title}". Deseja substituir pelo novo livro?`)) return;

    const ok = await setBookForClass(assignClassId, {
      book_id: book.id,
      book_title: book.title,
      author: book.author,
      total_pages: book.total_pages,
      reading_start_date: new Date().toISOString().slice(0, 10),
    });

    if (ok) {
      const { data: bookQuestions } = await supabase
        .from("edu_book_questions" as any)
        .select("id")
        .eq("book_id", book.id)
        .eq("is_active", true);
      for (const question of (bookQuestions || []) as any[]) {
        await supabase.rpc("sync_edu_book_question_to_classes" as any, { _book_question_id: question.id });
      }
      setAssignTarget(null);
      toast({ title: "Livro colocado na turma", description: `${book.title} está disponível para os alunos.` });
    }
  };

  const classUsingBook = (book: LibraryBook) =>
    classes.filter((item) =>
      item.book_id === book.id ||
      item.book_title?.toLowerCase() === book.title.toLowerCase()
    ).length;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Biblioteca EDU</p>
            <h1 className="text-3xl font-bold mt-2">Livros em um só lugar.</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Escolha um livro para uma turma, cadastre um título novo e ajuste os capítulos e perguntas sem sair desta tela.
            </p>
          </div>
          <Button onClick={() => setCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Criar livro
          </Button>
        </div>
        <div className="mt-5 relative max-w-xl">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar livro ou autor..." className="pl-9" />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Catálogo</p>
            <h2 className="text-xl font-bold mt-1">Biblioteca BookQuest</h2>
          </div>
          <Badge variant="outline">{filteredCatalog.length} títulos visíveis</Badge>
        </div>

        {loadingBooks ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => <Card key={item} className="h-48 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.map((book) => (
              <Card key={book.id} className="overflow-hidden">
                <div className="h-36 bg-muted/30 flex items-center justify-center">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" />
                  ) : (
                    <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{book.genre}</p>
                  <h3 className="font-semibold mt-1 line-clamp-2">{book.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
                  <div className="flex items-center justify-between gap-2 mt-4">
                    <span className="text-[11px] text-muted-foreground">{book.total_pages || "—"} pág.</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => void loadEditor(book)} className="gap-1.5">
                        <Edit3 className="h-3.5 w-3.5" /> Personalizar
                      </Button>
                      <Button size="sm" onClick={() => openAssignment(book)} className="gap-1.5">
                        <Users className="h-3.5 w-3.5" /> Usar na turma
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Seus livros</p>
            <h2 className="text-xl font-bold mt-1">Livros que você criou ou personalizou</h2>
          </div>
          <Badge variant="outline">{filteredCustom.length}</Badge>
        </div>

        {filteredCustom.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Nenhum livro personalizado ainda.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustom.map((book) => (
              <Card key={book.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-10 rounded-md overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                      {book.cover_url ? <img src={book.cover_url} alt="" className="h-full w-full object-cover" /> : <BookOpen className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold line-clamp-2">{book.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{book.author || "Autor não informado"}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{classUsingBook(book)} turma(s) usando</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => void loadEditor(book)} className="flex-1 gap-1.5"><Edit3 className="h-3.5 w-3.5" /> Editar</Button>
                    <Button size="sm" onClick={() => openAssignment(book)} className="flex-1 gap-1.5"><Users className="h-3.5 w-3.5" /> Colocar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {editorBookId && currentChapter && (
        <Card className="border-primary/20 overflow-hidden">
          <CardHeader className="border-b border-border/70">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] font-bold text-primary">Editor do livro</p>
                <CardTitle className="mt-1">{editorTitle}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Capítulos, contexto e perguntas ficam salvos neste livro.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditorBookId(null)}>Fechar editor</Button>
            </div>
          </CardHeader>
          <CardContent className="p-5 grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-5">
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <button
                  type="button"
                  key={chapter.id}
                  onClick={() => { setChapterId(chapter.chapter_number); setAiSuggestions([]); }}
                  className={`w-full text-left rounded-xl border px-3 py-2.5 transition-colors ${chapter.chapter_number === chapterId ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}
                >
                  <p className="text-[11px] text-muted-foreground">Capítulo {chapter.chapter_number}</p>
                  <p className="text-sm font-semibold truncate mt-0.5">{chapter.title}</p>
                </button>
              ))}
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-border p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_120px] gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Título do capítulo</label>
                    <Input
                      value={currentChapter.title}
                      onChange={(e) => setChapters((prev) => prev.map((item) => item.id === currentChapter.id ? { ...item, title: e.target.value } : item))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Página inicial</label>
                    <Input type="number" value={currentChapter.start_page} onChange={(e) => setChapters((prev) => prev.map((item) => item.id === currentChapter.id ? { ...item, start_page: Number(e.target.value) } : item))} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Página final</label>
                    <Input type="number" value={currentChapter.end_page} onChange={(e) => setChapters((prev) => prev.map((item) => item.id === currentChapter.id ? { ...item, end_page: Number(e.target.value) } : item))} className="mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Contexto para a IA <span className="font-normal">(opcional)</span></label>
                  <Textarea
                    rows={4}
                    value={currentChapter.context_text || ""}
                    onChange={(e) => setChapters((prev) => prev.map((item) => item.id === currentChapter.id ? { ...item, context_text: e.target.value } : item))}
                    placeholder="Cole um resumo, tópicos ou um trecho que ajude a IA a criar perguntas fiéis ao capítulo."
                    className="mt-1"
                  />
                </div>
                <Button onClick={() => void saveChapter()} className="gap-2"><CheckCircle2 className="h-4 w-4" /> Salvar capítulo</Button>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Perguntas do capítulo</p>
                    <p className="text-sm text-muted-foreground mt-1">{currentQuestions.length} pergunta(s) configurada(s).</p>
                  </div>
                  <Button variant="outline" onClick={() => void generateAi()} disabled={aiLoading} className="gap-2">
                    <Bot className="h-4 w-4" /> {aiLoading ? "Gerando..." : "IA sugerir perguntas"}
                  </Button>
                </div>

                <div className="mt-4 space-y-3">
                  {currentQuestions.map((question) => (
                    <div key={question.id} className="rounded-xl border border-border bg-muted/10 p-3 flex items-start gap-3">
                      <div className="flex-1">
                        <Badge variant="outline" className="text-[10px]">{question.source === "ai" ? "IA" : question.source === "catalog" ? "Catálogo" : "Professor"}</Badge>
                        <p className="text-sm font-medium mt-2">{question.question_text}</p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => void deleteQuestion(question.id)} aria-label="Remover pergunta">
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl bg-muted/20 p-3">
                  <div className="flex gap-2">
                    <Textarea value={questionDraft} onChange={(e) => setQuestionDraft(e.target.value)} placeholder="Digite uma pergunta para este capítulo..." rows={2} />
                    <Button onClick={() => void addQuestion()} disabled={!questionDraft.trim()} className="self-end"><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>

                {aiSuggestions.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-accent/25 bg-accent/5 p-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-accent mt-0.5" />
                      <div>
                        <p className="text-sm font-bold">Sugestões da IA</p>
                        <p className="text-xs text-muted-foreground mt-1">Revise antes de usar. Quanto mais contexto você fornecer, mais fiel a sugestão tende a ficar.</p>
                      </div>
                    </div>
                    <div className="space-y-2 mt-3">
                      {aiSuggestions.map((suggestion, index) => (
                        <div key={index} className="rounded-xl border border-border bg-card p-3">
                          <Badge variant="secondary" className="text-[10px]">{suggestion.type || "pergunta"}</Badge>
                          <p className="text-sm font-medium mt-2">{suggestion.question}</p>
                          <Button size="sm" className="mt-3" onClick={() => void saveAiSuggestion(suggestion)}>Adicionar ao capítulo</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Criar novo livro</DialogTitle>
            <DialogDescription>Cadastre o livro uma vez. Depois você poderá colocar em qualquer turma e editar seus capítulos.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Título *" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} />
            <Input placeholder="Autor" value={createForm.author} onChange={(e) => setCreateForm({ ...createForm, author: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Páginas" value={createForm.total_pages} onChange={(e) => setCreateForm({ ...createForm, total_pages: e.target.value })} />
              <Input type="number" placeholder="Qtd. capítulos" value={createForm.chapter_count} onChange={(e) => setCreateForm({ ...createForm, chapter_count: e.target.value })} />
            </div>
            <Input placeholder="Gênero" value={createForm.genre} onChange={(e) => setCreateForm({ ...createForm, genre: e.target.value })} />
            <Input placeholder="URL da capa (opcional)" value={createForm.cover_url} onChange={(e) => setCreateForm({ ...createForm, cover_url: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancelar</Button>
            <Button onClick={() => void createCustomBook()} disabled={saving || !createForm.title.trim()}>{saving ? "Criando..." : "Criar livro"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assignTarget} onOpenChange={(open) => { if (!open) setAssignTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Colocar livro em uma turma</DialogTitle>
            <DialogDescription>{assignTarget?.title}</DialogDescription>
          </DialogHeader>
          {classes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Crie uma turma primeiro.</p>
          ) : (
            <Select value={assignClassId} onValueChange={setAssignClassId}>
              <SelectTrigger><SelectValue placeholder="Escolha a turma" /></SelectTrigger>
              <SelectContent>
                {classes.map((cls: ClassData) => <SelectItem key={cls.id} value={cls.id}>{cls.name}{cls.book_title ? ` · ${cls.book_title}` : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAssignTarget(null)}>Cancelar</Button>
            <Button onClick={() => void assignBook()} disabled={!assignClassId}>Colocar livro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EduBookLibraryManager;
