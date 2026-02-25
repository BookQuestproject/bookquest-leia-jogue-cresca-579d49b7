import { useState } from "react";
import {
  BookOpen,
  Check,
  X,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  List,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAdminBookSuggestions, BookSuggestion } from "@/hooks/useBookSuggestions";

export const AdminBookSuggestionsPanel = () => {
  const {
    suggestions,
    loading,
    updateSuggestionStatus,
    deleteSuggestion,
    refetch,
  } = useAdminBookSuggestions();

  const [selectedSuggestion, setSelectedSuggestion] = useState<BookSuggestion | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [chaptersList, setChaptersList] = useState("");
  const [bookSummary, setBookSummary] = useState("");
  const [narrativeContext, setNarrativeContext] = useState("");

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");
  const approvedSuggestions = suggestions.filter((s) => s.status === "approved");
  const rejectedSuggestions = suggestions.filter((s) => s.status === "rejected");

  const resetModal = () => {
    setSelectedSuggestion(null);
    setActionType(null);
    setAdminNotes("");
    setChaptersList("");
    setBookSummary("");
    setNarrativeContext("");
  };

  const handleAction = async () => {
    if (!selectedSuggestion || !actionType) return;

    const status = actionType === "approve" ? "approved" : "rejected";
    const chapters = chaptersList
      .split("\n")
      .map((c) => c.trim())
      .filter(Boolean);

    await updateSuggestionStatus(
      selectedSuggestion.id,
      status,
      adminNotes,
      actionType === "approve"
        ? {
            chapters_list: chapters.length > 0 ? chapters : undefined,
            book_summary: bookSummary || undefined,
            narrative_context: narrativeContext || undefined,
          }
        : undefined
    );
    resetModal();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-0.5 rounded-full text-xs bg-warning/20 text-warning">Pendente</span>;
      case "approved":
        return <span className="px-2 py-0.5 rounded-full text-xs bg-success/20 text-success">Aprovado</span>;
      case "rejected":
        return <span className="px-2 py-0.5 rounded-full text-xs bg-destructive/20 text-destructive">Rejeitado</span>;
      default:
        return null;
    }
  };

  const SuggestionCard = ({ suggestion }: { suggestion: BookSuggestion }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4 rounded-xl bg-muted border border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold">{suggestion.title}</h4>
                {getStatusBadge(suggestion.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                por {suggestion.author || "Autor não informado"}
              </p>
              {suggestion.reason && (
                <p className="text-sm mt-2 text-foreground/80">{suggestion.reason}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Enviado em {formatDate(suggestion.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {suggestion.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-success hover:text-success hover:bg-success/10"
                    onClick={() => {
                      setSelectedSuggestion(suggestion);
                      setActionType("approve");
                    }}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setSelectedSuggestion(suggestion);
                      setActionType("reject");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
              {suggestion.status !== "pending" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteSuggestion(suggestion.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <CollapsibleTrigger asChild>
                <Button size="sm" variant="ghost">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent>
            <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
              {suggestion.admin_notes && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs font-medium mb-1">Notas do Admin:</p>
                  <p className="text-sm">{suggestion.admin_notes}</p>
                </div>
              )}
              {suggestion.book_summary && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs font-medium mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Resumo:
                  </p>
                  <p className="text-sm">{suggestion.book_summary}</p>
                </div>
              )}
              {suggestion.narrative_context && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs font-medium mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Contexto:
                  </p>
                  <p className="text-sm">{suggestion.narrative_context}</p>
                </div>
              )}
              {suggestion.chapters_list && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs font-medium mb-1 flex items-center gap-1">
                    <List className="w-3 h-3" /> Capítulos:
                  </p>
                  <ul className="text-sm space-y-1">
                    {(suggestion.chapters_list as string[]).map((ch, i) => (
                      <li key={i} className="text-muted-foreground">• {ch}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Sugestões de Livros
        </h2>
        <Button variant="ghost" size="sm" onClick={refetch}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma sugestão de livro ainda</p>
        </div>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pendentes ({pendingSuggestions.length})</TabsTrigger>
            <TabsTrigger value="approved">Aprovados ({approvedSuggestions.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitados ({rejectedSuggestions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3 mt-4">
            {pendingSuggestions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma sugestão pendente</p>
            ) : (
              pendingSuggestions.map((s) => <SuggestionCard key={s.id} suggestion={s} />)
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-3 mt-4">
            {approvedSuggestions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma sugestão aprovada</p>
            ) : (
              approvedSuggestions.map((s) => <SuggestionCard key={s.id} suggestion={s} />)
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-3 mt-4">
            {rejectedSuggestions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma sugestão rejeitada</p>
            ) : (
              rejectedSuggestions.map((s) => <SuggestionCard key={s.id} suggestion={s} />)
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Approval Modal with detailed fields */}
      <Dialog open={!!selectedSuggestion} onOpenChange={(open) => !open && resetModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Aprovar" : "Rejeitar"} Sugestão
            </DialogTitle>
          </DialogHeader>

          {selectedSuggestion && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-muted">
                <h4 className="font-bold">{selectedSuggestion.title}</h4>
                <p className="text-sm text-muted-foreground">
                  por {selectedSuggestion.author || "Autor não informado"}
                </p>
              </div>

              {actionType === "approve" && (
                <>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Importante:</strong> Para aprovar uma sugestão, você deve preencher as informações abaixo para possibilitar a criação de trilhas literárias.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                      <List className="w-4 h-4" /> Lista de Capítulos (um por linha)
                    </label>
                    <Textarea
                      value={chaptersList}
                      onChange={(e) => setChaptersList(e.target.value)}
                      placeholder="Capítulo 1 - Título&#10;Capítulo 2 - Título&#10;..."
                      rows={5}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                      <FileText className="w-4 h-4" /> Resumo Geral da História
                    </label>
                    <Textarea
                      value={bookSummary}
                      onChange={(e) => setBookSummary(e.target.value)}
                      placeholder="Descreva brevemente a história do livro..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" /> Contexto Narrativo/Temático
                    </label>
                    <Textarea
                      value={narrativeContext}
                      onChange={(e) => setNarrativeContext(e.target.value)}
                      placeholder="Explique o contexto histórico, temas principais, gênero literário..."
                      rows={4}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Notas do Admin (opcional)
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Observações sobre esta decisão..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={resetModal}>
              Cancelar
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={handleAction}
            >
              {actionType === "approve" ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Aprovar
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Rejeitar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
