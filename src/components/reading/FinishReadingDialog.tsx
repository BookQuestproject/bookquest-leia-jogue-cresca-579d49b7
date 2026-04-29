import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, BookOpen } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onFinishedFully: () => void;
  onPartial: () => void;
  themeColor?: string;
  isSession?: boolean;
}

const FinishReadingDialog = ({ open, onOpenChange, onFinishedFully, onPartial, themeColor = "var(--primary)", isSession }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-serif">
            Você terminou {isSession ? "a sessão" : "o capítulo"}?
          </DialogTitle>
          <DialogDescription className="text-center">
            Conta pra gente como foi essa sessão de leitura — vamos registrar do jeito certo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 mt-4">
          <Button
            size="lg"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={onFinishedFully}
            style={{
              background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + "%")}))`,
            }}
          >
            <CheckCircle className="w-6 h-6 shrink-0" />
            <div className="text-left">
              <div className="font-semibold">Terminei {isSession ? "a sessão" : "o capítulo"}</div>
              <div className="text-xs opacity-80">Avança no livro e ganha Essência cheia</div>
            </div>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={onPartial}
          >
            <BookOpen className="w-6 h-6 shrink-0 text-primary" />
            <div className="text-left">
              <div className="font-semibold">Li só um pouco</div>
              <div className="text-xs text-muted-foreground">Salva o tempo, mas não avança o capítulo</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinishReadingDialog;
