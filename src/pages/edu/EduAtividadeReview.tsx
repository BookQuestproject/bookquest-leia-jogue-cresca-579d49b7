import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import EduLayout from "./EduLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft, BookOpen, CheckCircle2, Loader2, MessageSquare, Save, Users, ClipboardList,
} from "lucide-react";

interface QuestionRow {
  id: string;
  class_id: string;
  chapter_number: number | null;
  question_text: string;
  created_at: string;
}

interface ResponseRow {
  id: string;
  question_id: string;
  user_id: string;
  response_text: string;
  created_at: string;
  reviewed_at: string | null;
  teacher_feedback: string | null;
  profile?: { full_name: string | null; email: string | null; avatar_url: string | null } | null;
}

const EduAtividadeReview = () => {
  const { id: questionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [question, setQuestion] = useState<QuestionRow | null>(null);
  const [className, setClassName] = useState<string>("");
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "reviewed" | "all">("pending");

  useEffect(() => {
    if (!questionId) return;
    (async () => {
      setLoading(true);
      const { data: q } = await supabase
        .from("class_questions")
        .select("*")
        .eq("id", questionId)
        .maybeSingle();
      if (!q) { setLoading(false); return; }
      setQuestion(q as QuestionRow);

      const { data: c } = await supabase
        .from("classes")
        .select("name")
        .eq("id", (q as any).class_id)
        .maybeSingle();
      setClassName((c as any)?.name ?? "");

      const { data: r } = await supabase
        .from("class_question_responses")
        .select("*")
        .eq("question_id", questionId)
        .order("created_at", { ascending: false });
      const rows = (r as ResponseRow[]) ?? [];

      // Hydrate author profiles
      const userIds = Array.from(new Set(rows.map((x) => x.user_id)));
      if (userIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", userIds);
        const byId = new Map((profs ?? []).map((p: any) => [p.id, p]));
        rows.forEach((x) => { x.profile = byId.get(x.user_id) ?? null; });
      }
      setResponses(rows);
      const initialDrafts: Record<string, string> = {};
      rows.forEach((x) => { initialDrafts[x.id] = x.teacher_feedback ?? ""; });
      setDrafts(initialDrafts);
      setLoading(false);
    })();
  }, [questionId]);

  const filtered = useMemo(() => {
    if (tab === "pending") return responses.filter((r) => !r.reviewed_at);
    if (tab === "reviewed") return responses.filter((r) => !!r.reviewed_at);
    return responses;
  }, [responses, tab]);

  const markReviewed = async (resp: ResponseRow) => {
    if (!user) return;
    setSavingId(resp.id);
    const feedback = drafts[resp.id] ?? "";
    const { error } = await supabase
      .from("class_question_responses")
      .update({
        teacher_feedback: feedback,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", resp.id);
    setSavingId(null);
    if (error) {
      toast({ title: "Erro", description: "Falha ao salvar revisão.", variant: "destructive" });
      return;
    }
    toast({ title: "✅ Resposta revisada!" });
    setResponses((prev) => prev.map((r) =>
      r.id === resp.id
        ? { ...r, teacher_feedback: feedback, reviewed_at: new Date().toISOString() }
        : r
    ));
  };

  const reopenReview = async (resp: ResponseRow) => {
    const { error } = await supabase
      .from("class_question_responses")
      .update({ reviewed_at: null, reviewed_by: null })
      .eq("id", resp.id);
    if (error) {
      toast({ title: "Erro", variant: "destructive" });
      return;
    }
    setResponses((prev) => prev.map((r) =>
      r.id === resp.id ? { ...r, reviewed_at: null } : r
    ));
    toast({ title: "Revisão reaberta" });
  };

  const counts = {
    pending: responses.filter((r) => !r.reviewed_at).length,
    reviewed: responses.filter((r) => !!r.reviewed_at).length,
    total: responses.length,
  };

  return (
    <EduLayout
      breadcrumbExtra={[
        { label: "Atividades", to: "/edu/atividades", icon: ClipboardList },
        { label: question ? `Revisão · ${className || "turma"}` : "Revisão", icon: MessageSquare },
      ]}
    >
      <div className="space-y-6">
        <Link
          to="/edu/atividades"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para atividades
        </Link>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !question ? (
          <Card><CardContent className="py-16 text-center text-sm text-muted-foreground">
            Atividade não encontrada.
          </CardContent></Card>
        ) : (
          <>
            {/* Activity header */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    <Users className="h-3 w-3" /> {className}
                  </Badge>
                  {question.chapter_number != null && (
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <BookOpen className="h-3 w-3" /> Cap. {question.chapter_number}
                    </Badge>
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(question.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <CardTitle className="text-base font-semibold text-foreground leading-snug">
                  {question.question_text}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{counts.total} respostas</span>
                <span className="text-accent font-semibold">{counts.pending} para revisar</span>
                <span className="text-emerald-500">{counts.reviewed} revisadas</span>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2">
              {([
                { id: "pending", label: `Para revisar (${counts.pending})` },
                { id: "reviewed", label: `Revisadas (${counts.reviewed})` },
                { id: "all", label: `Todas (${counts.total})` },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    tab === t.id
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Responses */}
            {filtered.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">
                Nada por aqui.
              </CardContent></Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((r) => {
                  const reviewed = !!r.reviewed_at;
                  const name = r.profile?.full_name || r.profile?.email || "Aluno";
                  return (
                    <Card key={r.id} className={`bg-card border ${reviewed ? "border-emerald-500/30" : "border-border hover:border-accent/40"} transition`}>
                      <CardHeader className="pb-2 flex flex-row items-center justify-between gap-3 space-y-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[12px] font-bold text-primary-foreground flex-shrink-0">
                            {name.substring(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Enviada em {new Date(r.created_at).toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        {reviewed ? (
                          <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Revisada
                          </Badge>
                        ) : (
                          <Badge className="bg-accent/15 text-accent border-accent/30">Pendente</Badge>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="rounded-lg bg-muted/50 border border-border p-3">
                          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                            {r.response_text}
                          </p>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                            Comentário do professor
                          </label>
                          <Textarea
                            rows={2}
                            value={drafts[r.id] ?? ""}
                            onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                            placeholder="Escreva um feedback (opcional)..."
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          {reviewed && (
                            <Button variant="outline" size="sm" onClick={() => reopenReview(r)} className="text-[11px]">
                              Reabrir
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => markReviewed(r)}
                            disabled={savingId === r.id}
                            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5 text-[11px]"
                          >
                            {savingId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            {reviewed ? "Atualizar feedback" : "Marcar como revisada"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </EduLayout>
  );
};

export default EduAtividadeReview;
