import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EduLayout from "./EduLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BookOpen, Check, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Chapter = {
  id?: string;
  chapter_number: number;
  title: string;
  start_page: number;
  end_page: number;
};

const EduJourneyChapters = () => {
  const { journeyId } = useParams<{ journeyId: string }>();
  const [journey, setJourney] = useState<any | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!journeyId) return;
    (async () => {
      setLoading(true);
      const [{ data: j }, { data: rows }] = await Promise.all([
        supabase.from("edu_journeys" as any).select("*").eq("id", journeyId).maybeSingle(),
        supabase.from("edu_journey_chapters" as any).select("*").eq("journey_id", journeyId).order("chapter_number", { ascending: true }),
      ]);
      setJourney(j);
      if (rows?.length) {
        setChapters((rows as any[]).map((x) => ({
          id: x.id,
          chapter_number: x.chapter_number,
          title: x.title || `Capítulo ${x.chapter_number}`,
          start_page: x.start_page,
          end_page: x.end_page,
        })));
      } else {
        const total = Number((j as any)?.total_chapters || 1);
        const totalPages = Number((j as any)?.total_pages || 0);
        const size = totalPages ? Math.ceil(totalPages / total) : 1;
        setChapters(Array.from({ length: total }, (_, i) => ({
          chapter_number: i + 1,
          title: `Capítulo ${i + 1}`,
          start_page: i === 0 ? 1 : i * size + 1,
          end_page: totalPages ? Math.min(totalPages, (i + 1) * size) : (i + 1) * size,
        })));
      }
      setLoading(false);
    })();
  }, [journeyId]);

  const updateChapter = (index: number, patch: Partial<Chapter>) => {
    setChapters((prev) => prev.map((c, i) => i === index ? { ...c, ...patch } : c));
  };

  const addChapter = () => {
    const next = chapters.length + 1;
    const previousEnd = chapters[chapters.length - 1]?.end_page || 0;
    setChapters((prev) => [...prev, {
      chapter_number: next,
      title: `Capítulo ${next}`,
      start_page: Math.max(1, previousEnd + 1),
      end_page: Math.max(2, previousEnd + 10),
    }]);
  };

  const removeChapter = (index: number) => {
    if (chapters.length <= 1) return;
    setChapters((prev) => prev.filter((_, i) => i !== index).map((c, i) => ({ ...c, chapter_number: i + 1 })));
  };

  const invalid = useMemo(() => chapters.some((c, i) =>
    c.start_page < 1 ||
    c.end_page < c.start_page ||
    (i > 0 && c.start_page <= chapters[i - 1].end_page)
  ), [chapters]);

  const save = async () => {
    if (!journeyId || invalid || !chapters.length) return;
    setSaving(true);
    const { error: deleteError } = await supabase.from("edu_journey_chapters" as any).delete().eq("journey_id", journeyId);
    if (deleteError) {
      toast.error("Não consegui atualizar os capítulos.");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("edu_journey_chapters" as any).insert(
      chapters.map((c) => ({
        journey_id: journeyId,
        chapter_number: c.chapter_number,
        title: c.title.trim() || `Capítulo ${c.chapter_number}`,
        start_page: c.start_page,
        end_page: c.end_page,
      }))
    );
    setSaving(false);
    if (error) {
      toast.error("Não consegui salvar o mapa de capítulos.");
      return;
    }
    toast.success("Mapa de capítulos salvo.");
  };

  return (
    <EduLayout breadcrumbExtra={[
      { label: "Jornadas", to: "/edu/jornadas", icon: BookOpen },
      { label: "Capítulos", icon: BookOpen },
    ]}>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link to="/edu/jornadas" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent">
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar para jornadas
            </Link>
            <h1 className="text-2xl font-bold text-foreground mt-3">{journey?.title || "Mapa de capítulos"}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure os limites reais de cada capítulo. Isso protege a experiência contra spoilers e permite liberar cada etapa no momento certo.
            </p>
          </div>
          <Button variant="outline" onClick={addChapter} className="gap-2">
            <Plus className="h-4 w-4" /> Adicionar capítulo
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Mapa da leitura</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {chapters.map((chapter, index) => (
                  <div key={chapter.id || chapter.chapter_number} className="grid grid-cols-1 lg:grid-cols-[70px_1fr_120px_120px_44px] gap-3 items-end rounded-2xl border border-border bg-card p-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Cap.</p>
                      <div className="h-10 flex items-center font-bold">{chapter.chapter_number}</div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Título</label>
                      <Input value={chapter.title} onChange={(e) => updateChapter(index, { title: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Página inicial</label>
                      <Input type="number" min={1} value={chapter.start_page} onChange={(e) => updateChapter(index, { start_page: Number(e.target.value) })} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Página final</label>
                      <Input type="number" min={1} value={chapter.end_page} onChange={(e) => updateChapter(index, { end_page: Number(e.target.value) })} className="mt-1" />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeChapter(index)} disabled={chapters.length <= 1} className="h-10 w-10 text-muted-foreground hover:text-destructive" aria-label="Remover capítulo">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {invalid && (
                  <p className="text-sm text-destructive">Revise as páginas: os capítulos precisam estar em ordem e não podem se sobrepor.</p>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={save} disabled={saving || invalid} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Salvar mapa
              </Button>
            </div>
          </>
        )}
      </div>
    </EduLayout>
  );
};

export default EduJourneyChapters;
