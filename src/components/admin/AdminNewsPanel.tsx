import { useState } from "react";
import { useNews } from "@/hooks/useNews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Pin, PinOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminNewsPanel = () => {
  const { news, fetchNews } = useNews();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    type: "announcement" as "update" | "curiosity" | "announcement",
    title: "",
    content: "",
    is_pinned: false,
  });

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase
        .from('news')
        .insert({
          type: form.type,
          title: form.title,
          content: form.content,
          is_pinned: form.is_pinned,
        });

      if (error) throw error;

      toast({ 
        title: "✅ Notícia criada!", 
        description: "Notificações enviadas para todos os usuários." 
      });
      
      setIsCreateOpen(false);
      setForm({ type: "announcement", title: "", content: "", is_pinned: false });
      await fetchNews();
    } catch (e: any) {
      console.error('Error creating news:', e);
      toast({ title: "Erro", description: "Falha ao criar notícia.", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('news')
        .update({ is_pinned: !currentPinned })
        .eq('id', id);

      if (error) throw error;

      toast({ title: currentPinned ? "Notícia desafixada" : "Notícia fixada" });
      await fetchNews();
    } catch (e: any) {
      console.error('Error toggling pin:', e);
      toast({ title: "Erro", description: "Falha ao atualizar notícia.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta notícia?")) return;

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Notícia excluída" });
      await fetchNews();
    } catch (e: any) {
      console.error('Error deleting news:', e);
      toast({ title: "Erro", description: "Falha ao excluir notícia.", variant: "destructive" });
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Gerenciar Notícias</CardTitle>
          <Button onClick={() => setIsCreateOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Notícia
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {news.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma notícia cadastrada
          </p>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground capitalize">
                    {item.type === "update" ? "Atualização" : 
                     item.type === "curiosity" ? "Curiosidade" : "Anúncio"}
                  </span>
                  {item.is_pinned && (
                    <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                      Fixada
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(item.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTogglePin(item.id, item.is_pinned)}
                  className="h-8 w-8 p-0"
                >
                  {item.is_pinned ? (
                    <PinOff className="h-4 w-4" />
                  ) : (
                    <Pin className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Nova Notícia</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Tipo</label>
                <Select
                  value={form.type}
                  onValueChange={(value: any) => setForm({ ...form, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Anúncio</SelectItem>
                    <SelectItem value="update">Atualização</SelectItem>
                    <SelectItem value="curiosity">Curiosidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Título</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Nova funcionalidade disponível!"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Conteúdo</label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Descreva a notícia..."
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={form.is_pinned}
                  onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="pinned" className="text-sm text-muted-foreground cursor-pointer">
                  Fixar notícia (destaque no topo)
                </label>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">
                  💡 Ao criar esta notícia, todos os usuários receberão uma notificação push automaticamente.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? "Criando..." : "Criar e Notificar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminNewsPanel;
