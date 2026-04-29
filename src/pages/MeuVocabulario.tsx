import { useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import { useVocabulary } from "@/hooks/useVocabulary";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookMarked, Search, Trash2, Calendar, Book } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const MeuVocabulario = () => {
  const { words, loading, removeWord } = useVocabulary();
  const [search, setSearch] = useState("");
  const [bookFilter, setBookFilter] = useState<string>("all");

  const books = useMemo(() => {
    const set = new Set<string>();
    words.forEach((w) => w.book_title && set.add(w.book_title));
    return Array.from(set);
  }, [words]);

  const filtered = useMemo(() => {
    return words.filter((w) => {
      const matchSearch = !search || w.word.toLowerCase().includes(search.toLowerCase()) || w.definition.toLowerCase().includes(search.toLowerCase());
      const matchBook = bookFilter === "all" || w.book_title === bookFilter;
      return matchSearch && matchBook;
    });
  }, [words, search, bookFilter]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookMarked className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold">Meu Vocabulário</h1>
              <p className="text-sm text-muted-foreground">
                {words.length} {words.length === 1 ? "palavra aprendida" : "palavras aprendidas"}
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar palavra ou definição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {books.length > 0 && (
            <select
              value={bookFilter}
              onChange={(e) => setBookFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 h-10 text-sm"
            >
              <option value="all">Todos os livros</option>
              {books.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          )}
        </div>

        {loading && <p className="text-center text-muted-foreground py-8">Carregando...</p>}

        {!loading && filtered.length === 0 && (
          <Card className="p-12 text-center space-y-3">
            <BookMarked className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {words.length === 0
                ? "Nenhuma palavra ainda. Use o botão 'Palavra difícil' durante a leitura!"
                : "Nenhuma palavra corresponde aos filtros."}
            </p>
          </Card>
        )}

        <div className="grid gap-3">
          {filtered.map((w) => (
            <Card key={w.id} className="p-4 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-serif font-semibold capitalize">{w.word}</h3>
                  <p className="text-sm">{w.definition}</p>
                  {w.synonyms?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {w.synonyms.map((s, i) => (
                        <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {w.example && (
                    <p className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3">
                      "{w.example}"
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                    {w.book_title && (
                      <span className="flex items-center gap-1">
                        <Book className="w-3 h-3" /> {w.book_title}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(w.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeWord(w.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default MeuVocabulario;
