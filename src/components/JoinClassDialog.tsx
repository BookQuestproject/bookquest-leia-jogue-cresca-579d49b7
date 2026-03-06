import { useState } from "react";
import { useClasses } from "@/hooks/useClasses";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";

interface JoinClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JoinClassDialog = ({ open, onOpenChange }: JoinClassDialogProps) => {
  const { joinClassByCode } = useClasses();
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setJoining(true);
    const ok = await joinClassByCode(code.trim());
    setJoining(false);
    if (ok) {
      setCode("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Entrar em uma Turma
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Digite o código fornecido pelo seu professor para entrar na turma.
          </p>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex: A3B7K2"
            maxLength={6}
            className="text-center text-lg font-mono tracking-widest"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleJoin} disabled={code.trim().length < 4 || joining}>
            {joining ? "Entrando..." : "Entrar na Turma"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinClassDialog;
