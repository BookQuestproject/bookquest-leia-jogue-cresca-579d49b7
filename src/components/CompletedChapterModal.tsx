import { useState, useEffect } from "react";
import { CheckCircle, Clock, BookOpen, RotateCcw, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface CompletedChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: {
    id: number;
    title: string;
    icon: string;
  };
  bookId: string;
  themeColor: string;
  onReread: () => void;
}

interface ReadingData {
  elapsed_time: number;
  notes: string | null;
  is_completed: boolean;
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}min ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}min ${secs}s`;
  }
  return `${secs}s`;
};

const CompletedChapterModal = ({
  isOpen,
  onClose,
  chapter,
  bookId,
  themeColor,
  onReread,
}: CompletedChapterModalProps) => {
  const { user } = useAuth();
  const [readingData, setReadingData] = useState<ReadingData | null>(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReadingData = async () => {
      if (!user || !isOpen) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("reading_progress")
          .select("elapsed_time, notes, is_completed")
          .eq("user_id", user.id)
          .eq("book_id", bookId)
          .eq("chapter_id", String(chapter.id))
          .maybeSingle();

        if (error) {
          console.error("Error loading reading data:", error);
        } else if (data) {
          setReadingData(data);
          setNotes(data.notes || "");
        }
      } catch (err) {
        console.error("Error loading reading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReadingData();
  }, [user, bookId, chapter.id, isOpen]);

  const handleSaveNotes = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("reading_progress")
        .update({ notes })
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .eq("chapter_id", String(chapter.id));

      if (error) {
        console.error("Error saving notes:", error);
        toast.error("Erro ao salvar anotações");
      } else {
        toast.success("Anotações salvas!");
      }
    } catch (err) {
      console.error("Error saving notes:", err);
      toast.error("Erro ao salvar anotações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReread = async () => {
    if (!user) return;

    try {
      // Reset the reading progress
      const { error } = await supabase
        .from("reading_progress")
        .update({ 
          elapsed_time: 0, 
          is_completed: false,
          is_paused: false 
        })
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .eq("chapter_id", String(chapter.id));

      if (error) {
        console.error("Error resetting progress:", error);
        toast.error("Erro ao reiniciar leitura");
        return;
      }

      toast.success("Progresso reiniciado! Boa releitura!");
      onClose();
      onReread();
    } catch (err) {
      console.error("Error resetting progress:", err);
      toast.error("Erro ao reiniciar leitura");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-serif">
            <span className="text-2xl">{chapter.icon}</span>
            <span>Capítulo {chapter.id}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Chapter Title */}
          <div className="text-center">
            <h3 className="font-serif text-lg font-semibold mb-2">
              {chapter.title}
            </h3>
          </div>

          {/* Completion Badge */}
          <div 
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg"
            style={{
              background: `linear-gradient(135deg, hsl(142 70% 45% / 0.15), hsl(142 70% 45% / 0.08))`,
              border: `1px solid hsl(142 70% 45% / 0.3)`,
            }}
          >
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium text-green-600">Leitura Concluída</span>
          </div>

          {/* Reading Time */}
          {!loading && readingData && (
            <div 
              className="flex items-center justify-center gap-3 py-4 px-4 rounded-lg"
              style={{
                background: `linear-gradient(135deg, hsl(${themeColor} / 0.12), hsl(${themeColor} / 0.06))`,
                border: `1px solid hsl(${themeColor} / 0.25)`,
              }}
            >
              <Clock className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Tempo de leitura</p>
                <p className="font-bold text-lg" style={{ color: `hsl(${themeColor})` }}>
                  {formatTime(readingData.elapsed_time)}
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-pulse text-muted-foreground">
                Carregando dados...
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Suas anotações sobre este capítulo
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escreva suas reflexões, citações favoritas ou pontos importantes..."
              className="min-h-[100px] resize-none"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveNotes}
              disabled={isSaving}
              className="w-full gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Salvando..." : "Salvar Anotações"}
            </Button>
          </div>

          {/* Reread Button */}
          <Button
            variant="outline"
            onClick={handleReread}
            className="w-full gap-2"
            style={{
              borderColor: `hsl(${themeColor} / 0.5)`,
              color: `hsl(${themeColor})`,
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Reler Capítulo (zerar tempo)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompletedChapterModal;
