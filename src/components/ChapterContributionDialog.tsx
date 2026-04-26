import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Sparkles, Plus, Trash2, Loader2 } from "lucide-react";

interface ChapterContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  bookTitle: string;
  bookAuthor?: string;
  initialChapterCount?: number;
  trigger?: React.ReactNode;
}

interface ChapterRow {
  number: number;
  title: string;
}

export const ChapterContributionDialog = ({
  open,
  onOpenChange,
  bookId,
  bookTitle,
  bookAuthor,
  initialChapterCount = 10,
}: ChapterContributionDialogProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState<ChapterRow[]>(() =>
    Array.from({ length: Math.max(3, initialChapterCount) }, (_, i) => ({
      number: i + 1,
      title: "",
    })),
  );

  const updateRow = (idx: number, title: string) => {
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, title } : r)));
  };

  const addRow = () => {
    setRows(prev => [...prev, { number: prev.length + 1, title: "" }]);
  };

  const removeRow = (idx: number) => {
    setRows(prev =>
      prev.filter((_, i) => i !== idx).map((r, i) => ({ ...r, number: i + 1 })),
    );
  };

  const handleSubmit = async () => {
    const cleaned = rows
      .map(r => ({ number: r.number, title: r.title.trim() }))
      .filter(r => r.title.length > 0);

    if (cleaned.length < 3) {
      toast({
        title: "Adicione pelo menos 3 capítulos",
        description: "Quanto mais completo, maiores as chances de aprovação automática.",
        variant: "destructive",
      });
      return;
    }

    if (cleaned.some(r => r.title.length > 200)) {
      toast({
        title: "Título muito longo",
        description: "Cada título deve ter no máximo 200 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "validate-chapter-contribution",
        {
          body: {
            book_id: bookId,
            book_title: bookTitle,
            book_author: bookAuthor,
            chapters: cleaned,
          },
        },
      );

      if (error) throw error;

      toast({
        title: data?.auto_approved ? "🎉 Capítulos aprovados!" : "✨ Contribuição enviada",
        description: data?.message || "Obrigado por enriquecer a comunidade!",
      });
      onOpenChange(false);
    } catch (e: any) {
      toast({
        title: "Erro ao enviar",
        description: e?.message || "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Contribuir com títulos reais
          </DialogTitle>
          <DialogDescription>
            Você tem <strong>{bookTitle}</strong> em mãos? Adicione os títulos reais dos capítulos
            para ajudar toda a comunidade. Recompensa: <strong>+50 ✦ Essência</strong> e badge{" "}
            <strong>Curador</strong> ao aprovar.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-2 py-2">
            {rows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Label className="text-xs font-mono w-10 text-muted-foreground shrink-0">
                  {String(row.number).padStart(2, "0")}.
                </Label>
                <Input
                  value={row.title}
                  onChange={e => updateRow(idx, e.target.value)}
                  placeholder={`Título do capítulo ${row.number}`}
                  maxLength={200}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRow(idx)}
                  disabled={rows.length <= 1}
                  className="shrink-0"
                  aria-label="Remover capítulo"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addRow}
              className="w-full mt-2"
              type="button"
            >
              <Plus className="w-4 h-4 mr-1" /> Adicionar capítulo
            </Button>
          </div>
        </ScrollArea>

        <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground flex gap-2">
          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>
            Nossa IA validará automaticamente sua contribuição. Se houver alta confiança, os títulos
            serão publicados na hora para todos. Casos duvidosos passam por revisão humana.
          </span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Validando...
              </>
            ) : (
              "Enviar contribuição"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
