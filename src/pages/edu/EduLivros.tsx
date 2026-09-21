import { useEffect, useMemo, useState } from "react";
import EduLayout from "./EduLayout";
import { useAuth } from "@/hooks/useAuth";
import { useClasses, ClassData } from "@/hooks/useClasses";
import { supabase } from "@/integrations/supabase/client";
import { bookTrails, expandChapters } from "@/pages/Trilhas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Search, Plus, Pencil, Trash2, Sparkles, Save, WandSparkles,
  Users, Library, Loader2, ChevronRight, X, Check,
} from "lucide-react";
import { toast } from "sonner";

type EduBook = {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  total_pages: number | null;
  genre: string | null;
  description: string | null;
  theme_color: string | null;
  source_book_id: string | null;
  created_by: string;
  is_active: boolean;
};

type EduChapter = {
  id: string;
  book_id: string;
  chapter_number: number;
  title: string;
  start_page: number;
  end_page: number;
  context_text: string | null;
};

type EduQuestion = {
  id: string;
  book_id: string;
  chapter_number: number;
  question_type: string;
  question_text: string;
  options: string[];
  correct_answer: number | null;
  explanation: string | null;
  source: string;
  is_active: boolean;
};

type CatalogItem = {
  book_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  total_pages: number | null;
  genre: string | null;
  source: "catalog" | "request";
};

const SUPPORTING_CHAPTER_ICONS = ["📖", "🔎", "💡", "🌟", "🧭", "🎭", "🗝️", "🔥", "🌙", "🏆", "📚", "🧩"];

const slug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const buildFallbackChapters = (book: CatalogItem | { title: string; author?: string | null; total_pages?: number | null }) => {
  const trail = bookTrails.find((item) =>
    item.id === slug(book.title) ||
    item.title.toLowerCase() === book.title.toLowerCase(),
  );
  if (trail) {
    return expandChapters(trail.chapters, trail.totalChapters).map((chapter) => ({
      chapter_number: chapter.id,
      title: chapter.title,
      start_page: chapter.id === 1 ? 1 : ((chapter.id - 1) * Math.ceil((book.total_pages || 180) / trail.totalChapters)) + 1,
      end_page: chapter.id === trail.totalChapters
        ? (book.total_pages || trail.totalChapters * 18)
        : chapter.id * Math.ceil((book.total_pages || 180) / trail.totalChapters),
    }));
  }

  const totalPages = Number(book.total_pages || 180);
  const count = Math.max(8, Math.min(40, Math.ceil(totalPages / 20)));
  const pagesPerChapter = Math.max(1, Math.ceil(totalPages / count));
  return Array.from({ length: count }, (_, i) => ({
    chapter_number: i + 1,
    title: `Capítulo ${i + 1}`,
    start_page: i * pagesPerChapter + 1,
    end_page: Math.min(totalPages, (i + 1) * pagesPerChapter),
  }));
};

const EduLivros = () => {
  const { user } = useAuth();
  const { classes, loading: classesLoading, setBookForClass } = useClasses();
  const [books, setBooks] = useState<EduBook[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState("");
  const [activeBook, setActiveBook] = useState<EduBook | null>(null);
  const [chapters, setChapters] = useState<EduChapter[]>([]);
  const [questions, setQuestions] = useState<EduQuestion[]>([]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [assigningBook, setAssigningBook] = useState<EduBook | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<EduQuestion | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [questionSource, setQuestionSource] = useState<"teacher" | "ai">("teacher");

  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    total_pages: "",
    genre: "",
    cover_url: "",
    description: "",
  });

  const [chapterForm, setChapterForm] = useState({
    title: "",
    start_page: "1",
    end_page: "20",
    context_text: "",
  });

  const [questionForm, setQuestionForm] = useState({
    question_type: "multiple_choice",
    question_text: "",
    options: "A\nB\nC\nD",
    correct_answer: "0",
    explanation: "",
  });

  const activeClasses = useMemo(() => classes.filter((item) => !item.is_archived), [classes]);

  const refreshBooks = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("edu_books" as any)
      .select("*")
      .eq("created_by", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) toast.error("Não consegui carregar os livros.");
    setBooks((data as EduBook[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    refreshBooks();
  }, [user?.id]);

  const searchCatalog = async () => {
    const term = search.trim();
    if (!term) {
      setCatalog([]);
      return;
    }

    setSearching(true);
    const [{ data: enriched }, { data: suggested }] = await Promise.all([
      supabase
        .from("book_trail_enrichments")
        .select("book_id,title,author,cover_url,total_pages,genre")
        .or(`title.ilike.%${term}%,author.ilike.%${term}%`)
        .limit(30),
      supabase
        .from("book_suggestions")
        .select("title,author,cover_url,genre,ai_verification_data,chapters_list")
        .eq("status", "approved")
        .or(`title.ilike.%${term}%,author.ilike.%${term}%`)
        .limit(30),
    ]);

    const merged: CatalogItem[] = [];
    const seen = new Set<string>();

    for (const item of (enriched || []) as any[]) {
      const key = `${item.title}|${item.author}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push({
        book_id: item.book_id,
        title: item.title,
        author: item.author || "Autor não informado",
        cover_url: item.cover_url || null,
        total_pages: item.total_pages || null,
        genre: item.genre || null,
        source: "catalog",
      });
    }

    for (const item of (suggested || []) as any[]) {
      const raw = typeof item.ai_verification_data === "string"
        ? (() => { try { return JSON.parse(item.ai_verification_data); } catch { return {}; } })()
        : item.ai_verification_data || {};
      const chaptersRaw = typeof item.chapters_list === "string"
        ? (() => { try { return JSON.parse(item.chapters_list); } catch { return {}; } })()
        : item.chapters_list || {};
      const key = `${item.title}|${item.author}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push({
        book_id: `suggestion-${slug(item.title)}`,
        title: raw.correct_title || item.title,
        author: item.author || raw.author || "Autor não informado",
        cover_url: item.cover_url || null,
        total_pages: raw.pages || chaptersRaw.pages || null,
        genre: item.genre || raw.genre || null,
        source: "request",
      });
    }

    setCatalog(merged);
    setSearching(false);
  };

  const saveNewBook = async () => {
    if (!user || !bookForm.title.trim()) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("edu_books" as any)
      .insert({
        title: bookForm.title.trim(),
        author: bookForm.author.trim() || null,
        total_pages: bookForm.total_pages ? Number(bookForm.total_pages) : null,
        genre: bookForm.genre.trim() || null,
        cover_url: bookForm.cover_url.trim() || null,
        description: bookForm.description.trim() || null,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (error) {
      toast.error("Não consegui criar o livro.");
      setSaving(false);
      return;
    }

    await seedBookChapters(data as EduBook);
    toast.success("Livro criado na biblioteca EDU.");
    setShowCreate(false);
    setBookForm({ title: "", author: "", total_pages: "", genre: "", cover_url: "", description: "" });
    setSaving(false);
    await refreshBooks();
    await loadDetails(data as EduBook);
  };

  const importCatalogBook = async (item: CatalogItem) => {
    if (!user) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("edu_books" as any)
      .upsert({
        title: item.title,
        author: item.author || null,
        total_pages: item.total_pages || null,
        genre: item.genre || null,
        cover_url: item.cover_url || null,
        source_book_id: item.book_id,
        created_by: user.id,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "source_book_id" })
      .select("*")
      .single();

    if (error) {
      toast.error("Não consegui adicionar o livro.");
      setSaving(false);
      return;
    }

    await seedBookChapters(data as EduBook);
    setCatalog([]);
    toast.success("Livro adicionado à sua biblioteca EDU.");
    await refreshBooks();
    await loadDetails(data as EduBook);
    setSaving(false);
  };

  const seedBookChapters = async (book: EduBook) => {
    const existing = await supabase
      .from("edu_book_chapters" as any)
      .select("chapter_number")
      .eq("book_id", book.id);

    const existingSet = new Set(((existing.data || []) as any[]).map((row) => row.chapter_number));
    const rows = buildFallbackChapters({
      title: book.title,
      author: book.author,
      total_pages: book.total_pages,
    })
      .filter((row) => !existingSet.has(row.chapter_number))
      .map((row) => ({
        book_id: book.id,
        chapter_number: row.chapter_number,
        title: row.title,
        start_page: row.start_page,
        end_page: row.end_page,
      }));

    if (rows.length) {
      await supabase.from("edu_book_chapters" as any).insert(rows);
    }
  };

  const loadDetails = async (book: EduBook) => {
    setActiveBook(book);
    setLoadingDetails(true);

    const [{ data: chapterRows }, { data: questionRows }] = await Promise.all([
      supabase.from("edu_book_chapters" as any)
        .select("*")
        .eq("book_id", book.id)
        .order("chapter_number", { ascending: true }),
      supabase.from("edu_book_questions" as any)
        .select("*")
        .eq("book_id", book.id)
        .eq("is_active", true)
        .order("chapter_number", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    setChapters((chapterRows as EduChapter[]) || []);
    setQuestions(((questionRows as any[]) || []).map((row) => ({
      ...row,
      options: Array.isArray(row.options) ? row.options : [],
    })));
    setSelectedChapter(1);
    setAiSuggestions([]);
    setLoadingDetails(false);
  };

  const activeChapter = chapters.find((chapter) => chapter.chapter_number === selectedChapter) || chapters[0];
  const activeQuestions = questions.filter((question) => question.chapter_number === selectedChapter);

  useEffect(() => {
    if (!activeChapter) return;
    setChapterForm({
      title: activeChapter.title,
      start_page: String(activeChapter.start_page),
      end_page: String(activeChapter.end_page),
      context_text: activeChapter.context_text || "",
    });
  }, [activeChapter?.id]);

  const saveChapter = async () => {
    if (!activeChapter) return;
    const { error } = await supabase.from("edu_book_chapters" as any)
      .update({
        title: chapterForm.title.trim() || `Capítulo ${activeChapter.chapter_number}`,
        start_page: Math.max(1, Number(chapterForm.start_page) || 1),
        end_page: Math.max(1, Number(chapterForm.end_page) || Number(chapterForm.start_page) || 1),
        context_text: chapterForm.context_text.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeChapter.id);

    if (error) {
      toast.error("Não consegui salvar o capítulo.");
      return;
    }
    toast.success("Capítulo atualizado.");
    if (activeBook) await loadDetails(activeBook);
  };

  const resetQuestionForm = () => {
    setEditingQuestion(null);
    setQuestionSource("teacher");
    setQuestionForm({
      question_type: "multiple_choice",
      question_text: "",
      options: "A\nB\nC\nD",
      correct_answer: "0",
      explanation: "",
    });
  };

  const startEditQuestion = (question: EduQuestion) => {
    setEditingQuestion(question);
    setQuestionSource(question.source === "ai" ? "ai" : "teacher");
    setQuestionForm({
      question_type: question.question_type,
      question_text: question.question_text,
      options: (question.options || []).join("\n"),
      correct_answer: question.correct_answer === null ? "" : String(question.correct_answer),
      explanation: question.explanation || "",
    });
    setShowQuestionForm(true);
  };

  const saveQuestion = async () => {
    if (!activeBook || !questionForm.question_text.trim() || !user) return;
    setSaving(true);
    const options = questionForm.options.split("\n").map((value) => value.trim()).filter(Boolean);
    const payload = {
      question_type: questionForm.question_type,
      chapter_number: selectedChapter,
      question_text: questionForm.question_text.trim(),
      options,
      correct_answer: questionForm.correct_answer === "" ? null : Number(questionForm.correct_answer),
      explanation: questionForm.explanation.trim() || null,
      updated_at: new Date().toISOString(),
      is_active: true,
    };

    let error = null;
    let id = editingQuestion?.id || null;

    if (editingQuestion) {
      const result = await supabase.from("edu_book_questions" as any).update(payload).eq("id", editingQuestion.id);
      error = result.error;
    } else {
      const result = await supabase.from("edu_book_questions" as any).insert({
        ...payload,
        book_id: activeBook.id,
        source: questionSource,
        created_by: user.id,
      }).select("id").single();
      error = result.error;
      id = (result.data as any)?.id || null;
    }

    if (error || !id) {
      toast.error("Não consegui salvar a pergunta.");
      setSaving(false);
      return;
    }

    await supabase.rpc("sync_edu_book_question_to_classes" as any, { _book_question_id: id });
    toast.success(editingQuestion ? "Pergunta atualizada." : "Pergunta criada e preparada para as turmas.");
    setShowQuestionForm(false);
    resetQuestionForm();
    setSaving(false);
    await loadDetails(activeBook);
  };

  const deleteQuestion = async (question: EduQuestion) => {
    if (!activeBook) return;
    const { data: classRows } = await supabase
      .from("classes")
      .select("id")
      .eq("book_id", activeBook.id);

    const classIds = ((classRows || []) as any[]).map((row) => row.id);
    if (classIds.length) {
      await supabase
        .from("class_questions" as any)
        .delete()
        .in("class_id", classIds)
        .eq("book_question_id", question.id);
    }

    const { error } = await supabase.from("edu_book_questions" as any).delete().eq("id", question.id);
    if (error) {
      toast.error("Não consegui excluir a pergunta.");
      return;
    }
    toast.success("Pergunta removida.");
    await loadDetails(activeBook);
  };

  const generateSuggestions = async () => {
    if (!activeBook || !activeChapter) return;
    setAiLoading(true);
    setAiSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke("generate-edu-book-questions", {
        body: {
          bookTitle: activeBook.title,
          author: activeBook.author,
          chapterNumber: activeChapter.chapter_number,
          chapterTitle: activeChapter.title,
          context: activeChapter.context_text,
        },
      });
      if (error) throw error;
      setAiSuggestions(Array.isArray(data?.questions) ? data.questions : []);
      if (!data?.questions?.length) toast.error("A IA não retornou sugestões.");
    } catch (error: any) {
      toast.error(error?.message || "Não consegui gerar sugestões com IA.");
    } finally {
      setAiLoading(false);
    }
  };

  const useSuggestion = (suggestion: any) => {
    setEditingQuestion(null);
    setQuestionSource("ai");
    setQuestionForm({
      question_type: suggestion.question_type || "multiple_choice",
      question_text: suggestion.question_text || suggestion.question || "",
      options: Array.isArray(suggestion.options) ? suggestion.options.join("\n") : "",
      correct_answer: suggestion.correct_answer === null || suggestion.correct_answer === undefined ? "" : String(suggestion.correct_answer),
      explanation: suggestion.explanation || "",
    });
    setShowQuestionForm(true);
  };

  const assignBook = async (classData: ClassData) => {
    if (!assigningBook) return;
    const ok = await setBookForClass(classData.id, {
      book_id: assigningBook.id,
      book_title: assigningBook.title,
      author: assigningBook.author,
      total_pages: assigningBook.total_pages,
      reading_start_date: new Date().toISOString().slice(0, 10),
      reading_deadline: null,
    });
    if (ok) {
      toast.success(`"${assigningBook.title}" foi colocado em ${classData.name}.`);
      setAssigningBook(null);
    }
  };

  const createChapterIfMissing = async () => {
    if (!activeBook) return;
    const nextNumber = chapters.length ? Math.max(...chapters.map((chapter) => chapter.chapter_number)) + 1 : 1;
    const startPage = chapters.length ? (Math.max(...chapters.map((chapter) => chapter.end_page)) + 1) : 1;
    const { error } = await supabase.from("edu_book_chapters" as any).insert({
      book_id: activeBook.id,
      chapter_number: nextNumber,
      title: `Capítulo ${nextNumber}`,
      start_page: startPage,
      end_page: startPage + 18,
    });
    if (error) {
      toast.error("Não consegui adicionar o capítulo.");
      return;
    }
    await loadDetails(activeBook);
    setSelectedChapter(nextNumber);
  };

  return (
    <EduLayout>
      <div className="space-y-6">
        <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-accent">
              <Library className="h-4 w-4" /> Livros
            </div>
            <h1 className="text-3xl font-bold mt-2">Uma biblioteca simples para a sua turma.</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Encontre um livro, adicione à biblioteca ou crie um novo. Depois, organize capítulos e perguntas sem precisar montar tudo do zero.
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Criar livro
          </Button>
        </section>

        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && searchCatalog()}
                  placeholder="Buscar por título ou autor..."
                />
              </div>
              <Button onClick={searchCatalog} disabled={searching || !search.trim()} className="gap-2">
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Buscar no catálogo
              </Button>
            </div>

            {catalog.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {catalog.map((item) => (
                  <div key={item.book_id} className="flex gap-3 rounded-2xl border border-border bg-muted/20 p-3">
                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      {item.cover_url ? (
                        <img src={item.cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.author}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.total_pages && <Badge variant="outline" className="text-[10px]">{item.total_pages} págs.</Badge>}
                        {item.genre && <Badge variant="outline" className="text-[10px]">{item.genre}</Badge>}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => importCatalogBook(item)} disabled={saving} className="self-center">
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {!searching && search.trim() && catalog.length === 0 && (
              <div className="mt-4 rounded-2xl border border-dashed border-border p-5 text-center">
                <p className="text-sm font-semibold">Não encontrou o livro?</p>
                <p className="text-xs text-muted-foreground mt-1">Crie manualmente e o livro já fica pronto para receber capítulos e perguntas.</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => {
                  setBookForm((form) => ({ ...form, title: search.trim() }));
                  setShowCreate(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" /> Criar este livro
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : books.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center space-y-3">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <p className="font-semibold">Sua biblioteca ainda está vazia.</p>
              <p className="text-sm text-muted-foreground">Comece pelo catálogo ou crie seu próprio livro.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {books.map((book) => (
              <Card key={book.id} className={activeBook?.id === book.id ? "border-accent/50 shadow-md" : ""}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="w-16 h-22 rounded-xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      {book.cover_url ? (
                        <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif font-semibold leading-tight">{book.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{book.author || "Autor não informado"}</p>
                      <p className="text-[11px] text-muted-foreground mt-2">{book.total_pages ? `${book.total_pages} páginas` : "Páginas não definidas"}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => loadDetails(book)} className="gap-1.5">
                      <ChevronRight className="h-3.5 w-3.5" /> Abrir livro
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setAssigningBook(book)} className="gap-1.5">
                      <Users className="h-3.5 w-3.5" /> Colocar na turma
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeBook && (
          <section className="grid grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)] gap-4 items-start">
            <Card className="lg:sticky lg:top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{activeBook.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{activeBook.author || "Autor não informado"}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {loadingDetails ? (
                  <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : (
                  <>
                    {chapters.map((chapter) => (
                      <button
                        key={chapter.id}
                        type="button"
                        onClick={() => setSelectedChapter(chapter.chapter_number)}
                        className={`w-full flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${selectedChapter === chapter.chapter_number ? "border-accent bg-accent/10" : "border-border hover:bg-muted/40"}`}
                      >
                        <span className="text-base">{SUPPORTING_CHAPTER_ICONS[(chapter.chapter_number - 1) % SUPPORTING_CHAPTER_ICONS.length]}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-xs font-semibold truncate">Cap. {chapter.chapter_number} · {chapter.title}</span>
                          <span className="block text-[10px] text-muted-foreground">{chapter.start_page}–{chapter.end_page} páginas · {questions.filter((q) => q.chapter_number === chapter.chapter_number).length} perguntas</span>
                        </span>
                      </button>
                    ))}
                    <Button size="sm" variant="outline" onClick={createChapterIfMissing} className="w-full gap-1.5 mt-2">
                      <Plus className="h-3.5 w-3.5" /> Adicionar capítulo
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {!loadingDetails && activeChapter && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Capítulo {activeChapter.chapter_number}</p>
                        <CardTitle className="text-xl mt-1">{activeChapter.title}</CardTitle>
                      </div>
                      <Button onClick={saveChapter} variant="outline" size="sm" className="gap-1.5">
                        <Save className="h-3.5 w-3.5" /> Salvar capítulo
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1">
                        <label className="text-xs font-semibold text-muted-foreground">Título</label>
                        <Input value={chapterForm.title} onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Página inicial</label>
                        <Input type="number" value={chapterForm.start_page} onChange={(e) => setChapterForm({ ...chapterForm, start_page: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Página final</label>
                        <Input type="number" value={chapterForm.end_page} onChange={(e) => setChapterForm({ ...chapterForm, end_page: e.target.value })} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Contexto para a IA · opcional</label>
                      <Textarea value={chapterForm.context_text} onChange={(e) => setChapterForm({ ...chapterForm, context_text: e.target.value })} rows={2} placeholder="Cole um resumo curto ou observações do professor para melhorar as sugestões." className="mt-1" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">Perguntas do capítulo</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">Edite, crie ou peça sugestões à IA. Nada é publicado automaticamente.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={generateSuggestions} disabled={aiLoading} className="gap-1.5">
                          {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <WandSparkles className="h-3.5 w-3.5" />}
                          Sugerir com IA
                        </Button>
                        <Button size="sm" onClick={() => { resetQuestionForm(); setShowQuestionForm(true); }} className="gap-1.5">
                          <Plus className="h-3.5 w-3.5" /> Nova pergunta
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {aiSuggestions.length > 0 && (
                      <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-accent" />
                          <p className="text-sm font-semibold">Sugestões da IA para este capítulo</p>
                        </div>
                        {aiSuggestions.map((suggestion, index) => (
                          <div key={index} className="rounded-xl border border-border bg-card p-3">
                            <p className="text-sm font-semibold">{suggestion.question_text || suggestion.question}</p>
                            {Array.isArray(suggestion.options) && suggestion.options.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">{suggestion.options.join(" · ")}</p>
                            )}
                            <div className="flex justify-end mt-2">
                              <Button size="sm" variant="outline" onClick={() => useSuggestion(suggestion)}>
                                <Check className="h-3.5 w-3.5 mr-1" /> Usar sugestão
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeQuestions.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border py-10 text-center">
                        <p className="text-sm font-semibold">Nenhuma pergunta ainda.</p>
                        <p className="text-xs text-muted-foreground mt-1">Crie a primeira ou peça sugestões à IA.</p>
                      </div>
                    ) : (
                      activeQuestions.map((question) => (
                        <div key={question.id} className="rounded-2xl border border-border bg-muted/10 p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                              {question.question_type === "multiple_choice" ? "A" : "✦"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold">{question.question_text}</p>
                                <Badge variant="outline" className="text-[10px]">{question.source === "ai" ? "IA" : "Professor"}</Badge>
                              </div>
                              {question.options?.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2">
                                  {question.options.map((option, index) => (
                                    <div key={option + index} className={`rounded-lg border px-2.5 py-1.5 text-xs ${question.correct_answer === index ? "border-emerald-500/30 bg-emerald-500/5" : "border-border"}`}>
                                      {String.fromCharCode(65 + index)}. {option}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {question.explanation && <p className="text-xs text-muted-foreground mt-2">{question.explanation}</p>}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEditQuestion(question)} title="Editar">
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteQuestion(question)} title="Excluir">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </section>
        )}

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar livro</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Título *</label>
                <Input value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} className="mt-1" placeholder="Ex.: Dom Casmurro" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Autor</label>
                  <Input value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Páginas</label>
                  <Input type="number" min={1} value={bookForm.total_pages} onChange={(e) => setBookForm({ ...bookForm, total_pages: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Gênero</label>
                <Input value={bookForm.genre} onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })} className="mt-1" placeholder="Romance, fantasia, mistério..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Capa · URL opcional</label>
                <Input value={bookForm.cover_url} onChange={(e) => setBookForm({ ...bookForm, cover_url: e.target.value })} className="mt-1" placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Descrição</label>
                <Textarea value={bookForm.description} onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })} rows={3} className="mt-1" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
                <Button onClick={saveNewBook} disabled={saving || !bookForm.title.trim()} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Criar livro
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showQuestionForm} onOpenChange={(open) => { setShowQuestionForm(open); if (!open) resetQuestionForm(); }}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingQuestion ? "Editar pergunta" : "Nova pergunta"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Tipo</label>
                <select value={questionForm.question_type} onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="multiple_choice">Múltipla escolha</option>
                  <option value="open">Resposta aberta</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Pergunta *</label>
                <Textarea value={questionForm.question_text} onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })} rows={4} className="mt-1" />
              </div>
              {questionForm.question_type === "multiple_choice" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Alternativas · uma por linha</label>
                    <Textarea value={questionForm.options} onChange={(e) => setQuestionForm({ ...questionForm, options: e.target.value })} rows={5} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Índice correta · começando em 0</label>
                    <Input type="number" min={0} value={questionForm.correct_answer} onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })} className="mt-1" />
                  </div>
                </>
              )}
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Explicação / feedback</label>
                <Textarea value={questionForm.explanation} onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })} rows={3} className="mt-1" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setShowQuestionForm(false); resetQuestionForm(); }}>Cancelar</Button>
                <Button onClick={saveQuestion} disabled={saving || !questionForm.question_text.trim()} className="gap-2">
                  <Save className="h-4 w-4" /> Salvar pergunta
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!assigningBook} onOpenChange={(open) => !open && setAssigningBook(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Colocar na turma</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {classesLoading ? (
                <div className="py-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
              ) : activeClasses.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">Crie uma turma primeiro.</div>
              ) : (
                activeClasses.map((classData) => (
                  <button
                    key={classData.id}
                    type="button"
                    onClick={() => assignBook(classData)}
                    className="w-full flex items-center gap-3 rounded-xl border border-border p-3 text-left hover:bg-muted/40 transition"
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Users className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{classData.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {classData.book_title ? `Livro atual: ${classData.book_title}` : "Sem livro"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </EduLayout>
  );
};

export default EduLivros;
