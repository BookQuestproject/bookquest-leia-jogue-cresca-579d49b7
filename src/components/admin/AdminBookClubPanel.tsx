import { useState, useRef } from 'react';
import { Shield, Plus, Trash2, Upload, FileText, Video, BookOpen, Edit, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useBookClubMonthly, type MonthlyBook } from '@/hooks/useBookClubMonthly';
import { useToast } from '@/hooks/use-toast';

const contentTypeLabels: Record<string, { label: string; icon: any }> = {
  review_pdf: { label: 'Resenha (PDF)', icon: FileText },
  video: { label: 'Vídeo (MP4)', icon: Video },
  analysis: { label: 'Análise Aprofundada', icon: BookOpen },
  author_preview: { label: 'Prévia do Autor', icon: BookOpen },
};

export function AdminBookClubPanel() {
  const {
    months, contents, currentMonthKey, loading,
    createMonthlyBook, updateMonthlyBook, deleteMonthlyBook,
    addContent, deleteContent, uploadFile, getContentsForMonth,
  } = useBookClubMonthly();
  const { toast } = useToast();

  const [showNewBook, setShowNewBook] = useState(false);
  const [newBook, setNewBook] = useState({ month_year: currentMonthKey, book_title: '', book_author: '', description: '' });
  const [uploading, setUploading] = useState(false);
  const [contentDialog, setContentDialog] = useState<{ monthlyId: string; type: string } | null>(null);
  const [contentTitle, setContentTitle] = useState('');
  const [contentDesc, setContentDesc] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreateBook = async () => {
    if (!newBook.book_title || !newBook.book_author) return;
    const ok = await createMonthlyBook(newBook);
    if (ok) {
      setShowNewBook(false);
      setNewBook({ month_year: currentMonthKey, book_title: '', book_author: '', description: '' });
    }
  };

  const handleUploadContent = async () => {
    if (!contentDialog || !contentTitle) return;
    const file = fileRef.current?.files?.[0];
    let fileUrl: string | undefined;

    if (file) {
      setUploading(true);
      try {
        const ext = file.name.split('.').pop();
        const path = `${contentDialog.monthlyId}/${contentDialog.type}-${Date.now()}.${ext}`;
        fileUrl = await uploadFile(file, path);
      } catch (err: any) {
        toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    await addContent({
      monthly_id: contentDialog.monthlyId,
      content_type: contentDialog.type,
      title: contentTitle,
      description: contentDesc || undefined,
      file_url: fileUrl,
    });

    setContentDialog(null);
    setContentTitle('');
    setContentDesc('');
  };

  const toggleStatus = async (month: MonthlyBook) => {
    const newStatus = month.status === 'active' ? 'completed' : 'active';
    await updateMonthlyBook(month.id, { status: newStatus } as any);
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-primary" />
          Gerenciar Book Club
          <Badge variant="outline" className="ml-2 text-xs">Admin</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create new monthly book */}
        {!showNewBook ? (
          <Button onClick={() => setShowNewBook(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Definir Livro do Mês
          </Button>
        ) : (
          <div className="space-y-3 p-4 rounded-xl bg-muted/50 border border-border">
            <h4 className="font-semibold text-sm">Novo Livro do Mês</h4>
            <Input placeholder="Mês (ex: 2026-03)" value={newBook.month_year} onChange={e => setNewBook(p => ({ ...p, month_year: e.target.value }))} />
            <Input placeholder="Título do livro" value={newBook.book_title} onChange={e => setNewBook(p => ({ ...p, book_title: e.target.value }))} />
            <Input placeholder="Autor" value={newBook.book_author} onChange={e => setNewBook(p => ({ ...p, book_author: e.target.value }))} />
            <Textarea placeholder="Descrição (opcional)" value={newBook.description} onChange={e => setNewBook(p => ({ ...p, description: e.target.value }))} />
            <div className="flex gap-2">
              <Button onClick={handleCreateBook} size="sm">Criar</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowNewBook(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {/* Existing months */}
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : months.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum livro do mês definido ainda.</p>
        ) : (
          <div className="space-y-4">
            {months.map(month => {
              const monthContents = getContentsForMonth(month.id);
              return (
                <div key={month.id} className="p-4 rounded-xl bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{month.book_title}</span>
                        <Badge variant={month.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                          {month.status === 'active' ? 'Ativo' : month.status === 'completed' ? 'Concluído' : month.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{month.book_author} · {month.month_year}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => toggleStatus(month)} title="Alternar status">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMonthlyBook(month.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content list */}
                  {monthContents.length > 0 && (
                    <div className="space-y-1">
                      {monthContents.map(c => {
                        const meta = contentTypeLabels[c.content_type] || { label: c.content_type, icon: FileText };
                        const Icon = meta.icon;
                        return (
                          <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 text-sm">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <span>{c.title}</span>
                              <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                            </div>
                            <div className="flex gap-1">
                              {c.file_url && (
                                <a href={c.file_url} target="_blank" rel="noreferrer">
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <FileText className="w-3.5 h-3.5" />
                                  </Button>
                                </a>
                              )}
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteContent(c.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add content buttons */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(contentTypeLabels).map(([type, meta]) => (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => {
                          setContentDialog({ monthlyId: month.id, type });
                          setContentTitle('');
                          setContentDesc('');
                        }}
                      >
                        <Upload className="w-3 h-3" />
                        {meta.label}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload dialog */}
        <Dialog open={!!contentDialog} onOpenChange={(o) => !o && setContentDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Adicionar {contentDialog ? contentTypeLabels[contentDialog.type]?.label : 'Conteúdo'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Título" value={contentTitle} onChange={e => setContentTitle(e.target.value)} />
              <Textarea placeholder="Descrição (opcional)" value={contentDesc} onChange={e => setContentDesc(e.target.value)} />
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Arquivo ({contentDialog?.type === 'video' ? 'MP4' : contentDialog?.type === 'review_pdf' ? 'PDF' : 'qualquer'})
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept={contentDialog?.type === 'video' ? 'video/mp4' : contentDialog?.type === 'review_pdf' ? 'application/pdf' : '*/*'}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>
              <Button onClick={handleUploadContent} disabled={uploading || !contentTitle} className="w-full">
                {uploading ? 'Enviando...' : 'Adicionar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
