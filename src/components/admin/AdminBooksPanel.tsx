import { useState, useMemo } from "react";
import { Search, Pencil, Check, X, ImageIcon, Loader2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { bookTrails } from "@/pages/Trilhas";
import { useBookOverrides, useBookOverridesMutation, BookOverride } from "@/hooks/useBookOverrides";

interface EditableBook {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  genre: string;
  hasOverride: boolean;
}

const AdminBooksPanel = () => {
  const { overrides, fetchOverrides, getOverride } = useBookOverrides();
  const { upsertOverride, deleteOverride } = useBookOverridesMutation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [editBook, setEditBook] = useState<EditableBook | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formCoverUrl, setFormCoverUrl] = useState("");
  const [formGenre, setFormGenre] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDetailedDescription, setFormDetailedDescription] = useState("");
  const [imageValid, setImageValid] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);

  const allBooks = useMemo(() => {
    return bookTrails.map(b => {
      const ov = getOverride(b.id);
      return {
        id: b.id,
        title: ov?.title || b.title,
        author: ov?.author || b.author,
        coverImage: ov?.cover_url || b.coverImage,
        genre: ov?.genre || b.genre,
        hasOverride: !!ov,
      };
    });
  }, [overrides, getOverride]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allBooks;
    const q = search.toLowerCase();
    return allBooks.filter(b =>
      b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }, [allBooks, search]);

  const openEdit = (book: EditableBook) => {
    const ov = getOverride(book.id);
    const original = bookTrails.find(b => b.id === book.id);
    setEditBook(book);
    setFormTitle(ov?.title || original?.title || "");
    setFormAuthor(ov?.author || original?.author || "");
    setFormCoverUrl(ov?.cover_url || original?.coverImage || "");
    setFormGenre(ov?.genre || original?.genre || "");
    setFormDescription(ov?.description || "");
    setFormDetailedDescription(ov?.detailed_description || "");
    setImageValid(true);
    setImageLoading(false);
  };

  const validateImage = (url: string) => {
    if (!url.trim()) { setImageValid(true); return; }
    setImageLoading(true);
    const img = new Image();
    img.onload = () => { setImageValid(true); setImageLoading(false); };
    img.onerror = () => { setImageValid(false); setImageLoading(false); };
    img.src = url;
  };

  const handleSave = async () => {
    if (!editBook) return;
    if (!formTitle.trim()) {
      toast({ title: "Erro", description: "O título não pode estar vazio.", variant: "destructive" });
      return;
    }
    if (formCoverUrl.trim() && !imageValid) {
      toast({ title: "Erro", description: "A URL da capa não carrega uma imagem válida.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      await upsertOverride(editBook.id, {
        title: formTitle.trim(),
        author: formAuthor.trim() || null,
        cover_url: formCoverUrl.trim() || null,
        genre: formGenre.trim() || null,
        description: formDescription.trim() || null,
        detailed_description: formDetailedDescription.trim() || null,
      });
      await fetchOverrides();
      toast({ title: "✅ Livro atualizado!", description: `"${formTitle}" salvo com sucesso.` });
      setEditBook(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveOverride = async (bookId: string) => {
    try {
      await deleteOverride(bookId);
      await fetchOverrides();
      toast({ title: "Restaurado", description: "Dados originais restaurados." });
      setEditBook(null);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou autor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">{filtered.length} livros</p>
      </div>

      <div className="grid gap-2">
        {filtered.map(book => (
          <div
            key={book.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
          >
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-10 h-14 rounded object-cover shrink-0"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-10 h-14 rounded bg-muted flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{book.title}</p>
              <p className="text-xs text-muted-foreground truncate">{book.author} · {book.genre}</p>
            </div>
            {book.hasOverride && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium shrink-0">
                Editado
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8"
              onClick={() => openEdit(book)}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editBook} onOpenChange={v => !v && setEditBook(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Editar Livro</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Cover preview */}
            <div className="flex gap-4 items-start">
              <div className="w-20 h-28 rounded-lg bg-muted overflow-hidden shrink-0 border border-border">
                {formCoverUrl && imageValid ? (
                  <img src={formCoverUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-xs">URL da Capa</Label>
                <Input
                  value={formCoverUrl}
                  onChange={e => {
                    setFormCoverUrl(e.target.value);
                    validateImage(e.target.value);
                  }}
                  placeholder="https://..."
                  className="text-sm"
                />
                {imageLoading && <p className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Verificando...</p>}
                {!imageLoading && formCoverUrl && !imageValid && (
                  <p className="text-xs text-destructive flex items-center gap-1"><X className="w-3 h-3" />Imagem inválida</p>
                )}
                {!imageLoading && formCoverUrl && imageValid && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" />Imagem válida</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Título</Label>
              <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Autor</Label>
                <Input value={formAuthor} onChange={e => setFormAuthor(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Gênero</Label>
                <Input value={formGenre} onChange={e => setFormGenre(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Descrição curta</Label>
              <Textarea
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Descrição detalhada</Label>
              <Textarea
                value={formDetailedDescription}
                onChange={e => setFormDetailedDescription(e.target.value)}
                rows={4}
                className="text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            {editBook?.hasOverride && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => editBook && handleRemoveOverride(editBook.id)}
                className="mr-auto gap-1.5 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Restaurar original
              </Button>
            )}
            <Button variant="outline" onClick={() => setEditBook(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBooksPanel;
