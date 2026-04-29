import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, FileText } from "lucide-react";
import type { BookStructure, BookMode } from "@/hooks/useBookStructure";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (s: Omit<BookStructure, "id">) => void;
  initial?: BookStructure | null;
}

const QUICK_RANGES = [
  { label: "10–15", value: 12 },
  { label: "15–20", value: 18 },
  { label: "20–30", value: 25 },
  { label: "30+", value: 35 },
];

const BookStructureDialog = ({ open, onOpenChange, onSave, initial }: Props) => {
  const [step, setStep] = useState<"mode" | "chapters" | "pages">("mode");
  const [chapters, setChapters] = useState<string>("");
  const [pages, setPages] = useState<string>("");

  useEffect(() => {
    if (open) {
      setStep(initial?.mode === "pages" ? "pages" : "mode");
      setChapters(initial?.total_chapters?.toString() || "");
      setPages(initial?.total_pages?.toString() || "");
    }
  }, [open, initial]);

  const handleSaveChapters = (n: number) => {
    onSave({ mode: "chapters", total_chapters: n, total_pages: null, session_size: null });
    onOpenChange(false);
  };

  const handleSavePages = () => {
    const total = parseInt(pages, 10);
    if (!total || total < 10) return;
    const sessionSize = Math.max(5, Math.ceil(total / 20)); // ~5% por sessão, mínimo 5 páginas
    onSave({ mode: "pages", total_chapters: null, total_pages: total, session_size: sessionSize });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {step === "mode" && "Como é a sua edição do livro?"}
            {step === "chapters" && "Quantos capítulos tem seu livro?"}
            {step === "pages" && "Modo Páginas"}
          </DialogTitle>
          <DialogDescription>
            {step === "mode" && "Edições diferem — vamos personalizar a trilha pra sua cópia."}
            {step === "chapters" && "Escolha um intervalo ou digite o número exato."}
            {step === "pages" && "Vamos dividir a leitura em sessões de ~5% do livro."}
          </DialogDescription>
        </DialogHeader>

        {step === "mode" && (
          <div className="grid gap-3">
            <Button size="lg" className="justify-start gap-3 h-auto py-4" onClick={() => setStep("chapters")}>
              <BookOpen className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Sei quantos capítulos tem</div>
                <div className="text-xs opacity-80">Trilha por capítulos</div>
              </div>
            </Button>
            <Button size="lg" variant="outline" className="justify-start gap-3 h-auto py-4" onClick={() => setStep("pages")}>
              <FileText className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Não sei / sem capítulos claros</div>
                <div className="text-xs text-muted-foreground">Modo Páginas (sessões)</div>
              </div>
            </Button>
          </div>
        )}

        {step === "chapters" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {QUICK_RANGES.map((r) => (
                <Button key={r.label} variant="outline" onClick={() => handleSaveChapters(r.value)}>
                  {r.label}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="exact">Ou digite o número exato</Label>
              <div className="flex gap-2">
                <Input
                  id="exact"
                  type="number"
                  min={1}
                  max={200}
                  placeholder="Ex: 24"
                  value={chapters}
                  onChange={(e) => setChapters(e.target.value)}
                />
                <Button onClick={() => handleSaveChapters(parseInt(chapters, 10))} disabled={!chapters || parseInt(chapters, 10) < 1}>
                  Salvar
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setStep("pages")}>
              Não sei → usar modo páginas
            </Button>
          </div>
        )}

        {step === "pages" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pages">Quantas páginas tem o livro?</Label>
              <Input
                id="pages"
                type="number"
                min={10}
                placeholder="Ex: 200"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
              />
              {pages && parseInt(pages, 10) >= 10 && (
                <p className="text-xs text-muted-foreground">
                  Vai virar ~20 sessões de {Math.max(5, Math.ceil(parseInt(pages, 10) / 20))} páginas cada.
                </p>
              )}
            </div>
            <Button onClick={handleSavePages} disabled={!pages || parseInt(pages, 10) < 10} className="w-full">
              Salvar
            </Button>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setStep("chapters")}>
              Voltar para capítulos
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookStructureDialog;
