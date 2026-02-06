import { useState } from "react";
import {
  Target,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAdminTracks } from "@/hooks/useAdminGroupMentorship";
import { MentorshipTrack } from "@/hooks/useMentorshipTracks";

export const AdminTracksPanel = () => {
  const { tracks, loading, createTrack, updateTrack, deleteTrack, refetch } =
    useAdminTracks();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<MentorshipTrack | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    objectives: "",
  });

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "", objectives: "" });
    setEditingTrack(null);
    setIsCreateOpen(false);
  };

  const handleSubmit = async () => {
    const objectives = formData.objectives
      .split("\n")
      .map((o) => o.trim())
      .filter(Boolean);

    if (editingTrack) {
      await updateTrack(editingTrack.id, {
        name: formData.name,
        description: formData.description,
        objectives,
      });
    } else {
      await createTrack({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        objectives,
      });
    }
    resetForm();
  };

  const openEdit = (track: MentorshipTrack) => {
    setEditingTrack(track);
    setFormData({
      name: track.name,
      slug: track.slug,
      description: track.description || "",
      objectives: (track.objectives || []).join("\n"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Trilhas de Mentoria
        </h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Trilha
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma trilha cadastrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="p-4 rounded-xl bg-secondary/50 border border-border/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold">{track.name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        track.is_active
                          ? "bg-success/20 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {track.is_active ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {track.description}
                  </p>
                  {track.objectives && track.objectives.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {track.objectives.map((obj, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-full bg-muted"
                        >
                          {obj}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEdit(track)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteTrack(track.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog
        open={isCreateOpen || !!editingTrack}
        onOpenChange={(open) => {
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTrack ? "Editar Trilha" : "Nova Trilha"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nome</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Rotina de Leitura"
              />
            </div>
            {!editingTrack && (
              <div>
                <label className="text-sm font-medium mb-1 block">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="Ex: rotina-leitura"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">Descrição</label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrição da trilha..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Objetivos (um por linha)
              </label>
              <Textarea
                value={formData.objectives}
                onChange={(e) =>
                  setFormData({ ...formData, objectives: e.target.value })
                }
                placeholder="Objetivo 1&#10;Objetivo 2&#10;Objetivo 3"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name}>
              <Check className="w-4 h-4 mr-2" />
              {editingTrack ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
