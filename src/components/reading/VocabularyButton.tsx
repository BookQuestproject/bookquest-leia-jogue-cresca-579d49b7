import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookMarked, Loader2, Sparkles, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useUserStats } from "@/hooks/useUserStats";
import { toast } from "sonner";

interface Props {
  bookId?: string;
  bookTitle?: string;
}

interface AIResult {
  word: string;
  definition: string;
  synonyms: string[];
  example: string;
}

const VocabularyButton = ({ bookId, bookTitle }: Props) => {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const { addWord } = useVocabulary();
  const { addEssencia } = useUserStats();

  const handleLookup = async () => {
    if (!word.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("explain-vocabulary", {
        body: { word: word.trim(), context: bookTitle },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as AIResult);
    } catch (e: any) {
      toast.error(e.message || "Erro ao consultar a IA");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    const saved = await addWord({
      word: result.word,
      definition: result.definition,
      synonyms: result.synonyms,
      example: result.example,
      book_id: bookId,
      book_title: bookTitle,
    });
    if (saved) {
      await addEssencia(3);
      toast.success("Palavra salva no seu vocabulário! +3 ✦", {
        description: result.word,
      });
      setWord("");
      setResult(null);
      setOpen(false);
    } else {
      toast.error("Não foi possível salvar (talvez já esteja no seu vocabulário).");
    }
  };

  return (
    <>
      <Button
        size="sm"
        className="gap-2 bg-[hsl(48_96%_53%)] text-[hsl(222_47%_11%)] hover:bg-[hsl(48_96%_48%)] shadow-md shadow-[hsl(48_96%_53%)]/30 font-semibold"
        onClick={() => setOpen(true)}
      >
        <BookMarked className="w-4 h-4" />
        Dicionário
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Dicionário inteligente
            </DialogTitle>
            <DialogDescription>
              Digite a palavra que você encontrou no livro e a IA explica de um jeito simples.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2">
            <Input
              placeholder="Ex: melancolia"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              maxLength={60}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleLookup()}
              autoFocus
            />
            <Button onClick={handleLookup} disabled={loading || !word.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
            </Button>
          </div>

          {result && (
            <div className="space-y-3 rounded-xl border border-border bg-card/50 p-4 animate-fade-in">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Palavra</p>
                <p className="text-lg font-serif font-semibold capitalize">{result.word}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Definição</p>
                <p className="text-sm">{result.definition}</p>
              </div>
              {result.synonyms?.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Sinônimos</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {result.synonyms.map((s, i) => (
                      <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.example && (
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Exemplo</p>
                  <p className="text-sm italic">"{result.example}"</p>
                </div>
              )}

              <Button onClick={handleSave} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Salvar no meu vocabulário (+3 ✦)
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VocabularyButton;
