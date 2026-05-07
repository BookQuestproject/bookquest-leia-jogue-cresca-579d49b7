import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Link as LinkIcon, MessageCircle, Mail, UserPlus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  classId: string;
  className: string;
  accessCode: string;
  onAdded?: () => void;
}

const InviteStudentsDialog = ({ open, onOpenChange, classId, className, accessCode, onAdded }: Props) => {
  const [handle, setHandle] = useState("");
  const [adding, setAdding] = useState(false);
  const link = `${window.location.origin}/edu/aluno?code=${accessCode}`;
  const message = `Olá! Entre na turma "${className}" no BookQuest EDU.\nCódigo: ${accessCode}\nLink: ${link}`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  };

  const addStudent = async () => {
    if (!handle.trim()) return;
    setAdding(true);
    const { data: found, error } = await supabase
      .rpc("find_user_by_handle" as any, { _handle: handle.trim() })
      .maybeSingle();
    if (error || !found) {
      toast.error("Aluno não encontrado");
      setAdding(false);
      return;
    }
    const { data: ok } = await supabase.rpc("teacher_add_student_to_class" as any, {
      _class_id: classId,
      _student_user_id: (found as any).id,
    });
    if (!ok) {
      toast.error("Não foi possível adicionar");
    } else {
      toast.success(`${(found as any).full_name ?? handle} adicionado(a)`);
      setHandle("");
      onAdded?.();
    }
    setAdding(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Convidar alunos para {className}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Code */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Código de acesso
            </label>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20 font-mono text-lg font-bold text-primary text-center tracking-widest">
                {accessCode}
              </div>
              <Button variant="outline" size="icon" onClick={() => copy(accessCode, "Código")}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Link de convite
            </label>
            <div className="mt-2 flex items-center gap-2">
              <Input value={link} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={() => copy(link, "Link")}>
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Share */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank")}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                (window.location.href = `mailto:?subject=${encodeURIComponent(
                  `Convite para a turma ${className}`
                )}&body=${encodeURIComponent(message)}`)
              }
              className="gap-2"
            >
              <Mail className="h-4 w-4" /> E-mail
            </Button>
          </div>

          {/* Manual add */}
          <div className="pt-3 border-t border-border">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Adicionar aluno manualmente
            </label>
            <p className="text-[11px] text-muted-foreground mt-1">
              Digite o @username ou o e-mail do aluno já cadastrado no BookQuest.
            </p>
            <div className="mt-2 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@username ou email"
                  className="pl-9"
                  onKeyDown={(e) => e.key === "Enter" && addStudent()}
                />
              </div>
              <Button onClick={addStudent} disabled={adding || !handle.trim()}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteStudentsDialog;
