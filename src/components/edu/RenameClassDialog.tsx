import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useClasses } from "@/hooks/useClasses";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  classId: string;
  currentName: string;
}

export const RenameClassDialog = ({ open, onOpenChange, classId, currentName }: Props) => {
  const { renameClass } = useClasses();
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) setName(currentName); }, [open, currentName]);

  const trimmed = name.trim();
  const valid = trimmed.length >= 2 && trimmed.length <= 60 && trimmed !== currentName;

  const handleSave = async () => {
    setSaving(true);
    const ok = await renameClass(classId, trimmed);
    setSaving(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Renomear turma</DialogTitle>
          <DialogDescription>
            Use o nome que sua escola adota — pode ser uma sigla, série, turno ou apelido pedagógico.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Novo nome
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Manhã 9º · Turma de Literatura · Eletiva 3"
            maxLength={60}
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && valid && !saving) handleSave(); }}
          />
          <p className="text-[11px] text-muted-foreground">{trimmed.length}/60 caracteres</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!valid || saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameClassDialog;
