import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, BookMarked, Calendar, CheckCircle, MessageSquare, Search, Send, Target, Trophy } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useStreakTick } from "@/hooks/useStreakTick";
import { useVocabulary } from "@/hooks/useVocabulary";
import { useClassDiscussions } from "@/hooks/useClassDiscussions";
import { type Mission, type MissionCategory, getLevel, getMissionsForLevel, getReaderLevel } from "@/components/missions/MissionTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import ProgressBar from "@/components/ProgressBar";
import AchievementsSection from "@/components/AchievementsSection";
import HabitToast from "@/components/missions/HabitToast";
import ChallengeModal from "@/components/missions/ChallengeModal";
import MilestoneOverlay from "@/components/missions/MilestoneOverlay";
import type { BookQuestTrailChapter } from "@/components/BookQuestTrailMap";
import { supabase } from "@/integrations/supabase/client";

const BARRIER_LABELS: Record<string, string> = {
  time: "Falta de tempo",
  focus: "Dificuldade de foco",
  interest: "Manter o interesse",
  difficulty: "Entender o texto",
};

const SUPPORT_LABELS: Record<string, string> = {
  discoveries: "Pistas e descobertas",
  characters: "Personagens",
  competition: "Competição e ranking",
};
type FeatureSectionProps = { classId: string; bookTitle: string | null; chapters: BookQuestTrailChapter[]; onStartChapter: (chapterNumber: number) => void; };

const getPeriods = () => {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const month = now.toISOString().slice(0, 7);
  const tmp = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = (tmp.getUTCDay() + 6) % 7;
  tmp.setUTCDate(tmp.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 4));
  const week = String(tmp.getUTCFullYear()) + "-W" + String(1 + Math.round(((tmp.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7)).padStart(2, "0");
  return { day, week, month };
};

const loadDone = (key: string, period: string) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    if (parsed.period !== period) { localStorage.removeItem(key); return new Set<string>(); }
    return new Set<string>(Array.isArray(parsed.ids) ? parsed.ids : []);
  } catch { return new Set<string>(); }
};

export const EduMissionsSection = () => {
  const { profile } = useProfile();
  const { tick } = useStreakTick();
  const readerLevel = useMemo(() => getReaderLevel(profile?.literary_profile), [profile?.literary_profile]);
  const levelMissions = useMemo(() => getMissionsForLevel(readerLevel), [readerLevel]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [habitToast, setHabitToast] = useState<{ title: string; xp: number } | null>(null);
  const [challengeModal, setChallengeModal] = useState<{ title: string; xp: number } | null>(null);
  const [milestoneOverlay, setMilestoneOverlay] = useState<{ title: string; xp: number; unlockedTitle?: string } | null>(null);

  const syncMissions = useCallback(() => {
    const periods = getPeriods();
    const doneByCategory: Record<MissionCategory, Set<string>> = {
      habit: loadDone("missoes:habit:done", periods.day),
      challenge: loadDone("missoes:challenge:done", periods.week),
      milestone: loadDone("missoes:milestone:done", periods.month),
    };
    setMissions(levelMissions.all.map((mission) => doneByCategory[mission.category].has(mission.id) ? { ...mission, completed: true, progress: mission.goal } : { ...mission, completed: false, progress: 0 }));
  }, [levelMissions]);

  useEffect(() => syncMissions(), [syncMissions]);

  const persistCompleted = (mission: Mission) => {
    const periods = getPeriods();
    const key = mission.category === "habit" ? "missoes:habit:done" : mission.category === "challenge" ? "missoes:challenge:done" : "missoes:milestone:done";
    const period = mission.category === "habit" ? periods.day : mission.category === "challenge" ? periods.week : periods.month;
    const done = loadDone(key, period);
    done.add(mission.id);
    localStorage.setItem(key, JSON.stringify({ period, ids: Array.from(done) }));
  };

  const handleComplete = (missionId: string) => {
    const mission = missions.find((item) => item.id === missionId);
    if (!mission || mission.completed) return;
    setMissions((current) => current.map((item) => item.id === missionId ? { ...item, completed: true, progress: item.goal } : item));
    setTotalXp((current) => current + mission.essenciaValue);
    persistCompleted(mission);
    tick();
    if (mission.category === "habit") setHabitToast({ title: mission.title, xp: mission.essenciaValue });
    else if (mission.category === "challenge") setChallengeModal({ title: mission.title, xp: mission.essenciaValue });
    else setMilestoneOverlay({ title: mission.title, xp: mission.essenciaValue, unlockedTitle: mission.id === "milestone-streak" ? "Leitor Persistente" : mission.id === "milestone-chapters" ? "Centenário Literário" : mission.id === "milestone-books" ? "Guardião da Estante" : undefined });
  };

  const habits = missions.filter((mission) => mission.category === "habit");
  const challenges = missions.filter((mission) => mission.category === "challenge");
  const milestones = missions.filter((mission) => mission.category === "milestone");
  const level = getLevel(totalXp);

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.18em] font-bold text-accent">Jornada de evolução</p><h1 className="text-3xl font-bold mt-2">Missões que cabem na sua leitura.</h1><p className="text-sm text-muted-foreground mt-2">Os mesmos hábitos do BookQuest, organizados dentro da experiência EDU.</p></div>
          <div className="rounded-2xl bg-accent/10 px-4 py-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nível</p><p className="font-bold text-accent">{level.current} · {totalXp} ✦</p></div>
        </div>
      </section>
      <EduMissionGroup title="Hábitos de leitura" subtitle="Base diária" icon={<BookOpen className="h-5 w-5 text-accent" />} missions={habits} onComplete={handleComplete} badge={habits.filter((m) => m.completed).length + "/" + habits.length + " hoje"} />
      <EduMissionGroup title="Desafios" subtitle="Superação semanal" icon={<Target className="h-5 w-5 text-secondary" />} missions={challenges} onComplete={handleComplete} />
      <EduMissionGroup title="Marcos" subtitle="Conquistas de evolução" icon={<Trophy className="h-5 w-5 text-accent" />} missions={milestones} onComplete={handleComplete} />
      {habitToast && <HabitToast isVisible missionTitle={habitToast.title} xp={habitToast.xp} onDone={() => setHabitToast(null)} />}
      {challengeModal && <ChallengeModal isOpen onClose={() => setChallengeModal(null)} missionTitle={challengeModal.title} xpGained={challengeModal.xp} />}
      {milestoneOverlay && <MilestoneOverlay isOpen onClose={() => setMilestoneOverlay(null)} missionTitle={milestoneOverlay.title} xpGained={milestoneOverlay.xp} unlockedTitle={milestoneOverlay.unlockedTitle} />}
    </div>
  );
};

const EduMissionGroup = ({ title, subtitle, icon, missions, onComplete, badge }: { title: string; subtitle: string; icon: React.ReactNode; missions: Mission[]; onComplete: (missionId: string) => void; badge?: string }) => (
  <section className="rounded-[30px] border border-border bg-card p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-5">{icon}<h2 className="text-xl font-bold">{title}</h2><span className="text-sm text-muted-foreground">{subtitle}</span>{badge && <span className="ml-auto text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full">{badge}</span>}</div>
    <div className="space-y-3">{missions.map((mission) => <EduMissionItem key={mission.id} mission={mission} onComplete={onComplete} />)}</div>
  </section>
);

const EduMissionItem = ({ mission, onComplete }: { mission: Mission; onComplete: (missionId: string) => void }) => {
  const Icon = mission.icon;
  return <div className="rounded-2xl border border-border bg-muted/10 p-4"><div className="flex items-start gap-4"><div className={"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 " + (mission.completed ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground")}>{mission.completed ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}</div><div className="flex-1 min-w-0"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 flex-wrap"><h3 className={"font-semibold " + (mission.completed ? "line-through text-muted-foreground" : "")}>{mission.title}</h3><span className="text-[10px] rounded-full bg-primary/10 text-primary px-2 py-0.5 font-bold uppercase tracking-wider">{mission.category}</span></div><span className="text-sm font-semibold text-accent whitespace-nowrap">+{mission.essenciaValue} ✦</span></div><p className="text-sm text-muted-foreground mt-1">{mission.description}</p>{!mission.completed && <div className="flex items-center gap-3 mt-3"><div className="flex-1"><ProgressBar value={mission.progress} max={mission.goal} /></div><span className="text-xs font-semibold text-muted-foreground">{mission.progress}/{mission.goal}</span></div>}{mission.completed && <p className="text-xs text-accent font-semibold mt-2">Concluído</p>}{!mission.completed && <Button size="sm" variant="outline" className="mt-3" onClick={() => onComplete(mission.id)}>Marcar como feito</Button>}</div></div></div>;
};

export const EduAchievementsSection = () => (
  <div className="space-y-6">
    <section className="rounded-[30px] border border-border bg-card p-6 shadow-sm"><p className="text-xs uppercase tracking-[0.18em] font-bold text-amber-500">Conquistas</p><h1 className="text-3xl font-bold mt-2">O que você já desbloqueou.</h1><p className="text-sm text-muted-foreground mt-2">As medalhas do BookQuest continuam valendo na experiência EDU.</p></section>
    <AchievementsSection />
  </div>
);

export const EduVocabularySection = ({ bookTitle }: { bookTitle: string | null }) => {
  const { words, loading, removeWord } = useVocabulary();
  const [search, setSearch] = useState("");
  const [bookFilter, setBookFilter] = useState<string>(bookTitle || "all");
  const books = useMemo(() => Array.from(new Set(words.map((word) => word.book_title).filter(Boolean) as string[])), [words]);
  useEffect(() => { setBookFilter(bookTitle || "all"); }, [bookTitle]);
  const filtered = useMemo(() => words.filter((word) => {
    const matchSearch = !search || word.word.toLowerCase().includes(search.toLowerCase()) || word.definition.toLowerCase().includes(search.toLowerCase());
    const matchBook = bookFilter === "all" || word.book_title === bookFilter;
    return matchSearch && matchBook;
  }), [words, search, bookFilter]);
  return <div className="space-y-6"><section className="rounded-[30px] border border-border bg-card p-6 shadow-sm"><p className="text-xs uppercase tracking-[0.18em] font-bold text-primary">Vocabulário</p><h1 className="text-3xl font-bold mt-2">Palavras que você descobriu.</h1><p className="text-sm text-muted-foreground mt-2">{bookTitle ? "Aqui entram também as palavras encontradas durante " + bookTitle + "." : "Quando um livro for definido, seu vocabulário pode ser organizado por ele."}</p></section>
    <div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Buscar palavra ou definição..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" /></div>{books.length > 0 && <select value={bookFilter} onChange={(event) => setBookFilter(event.target.value)} className="rounded-md border border-input bg-background px-3 h-10 text-sm"><option value="all">Todos os livros</option>{books.map((book) => <option key={book} value={book}>{book}</option>)}</select>}</div>
    {loading && <p className="text-center text-muted-foreground py-8">Carregando...</p>}{!loading && filtered.length === 0 && <Card className="p-12 text-center space-y-3"><BookMarked className="w-12 h-12 mx-auto text-muted-foreground/40" /><p className="text-muted-foreground">{words.length === 0 ? "Nenhuma palavra ainda. Durante a leitura, use o botão de palavra difícil." : "Nenhuma palavra corresponde aos filtros."}</p></Card>}
    <div className="grid gap-3">{filtered.map((word) => <Card key={word.id} className="p-4"><div className="flex items-start justify-between gap-3"><div className="flex-1 space-y-2"><h3 className="text-lg font-serif font-semibold capitalize">{word.word}</h3><p className="text-sm">{word.definition}</p>{word.synonyms?.length > 0 && <div className="flex flex-wrap gap-1.5">{word.synonyms.map((synonym, index) => <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{synonym}</span>)}</div>}{word.example && <p className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3">"{word.example}"</p>}<div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">{word.book_title && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{word.book_title}</span>}<span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(word.created_at).toLocaleDateString("pt-BR")}</span></div></div><Button variant="ghost" size="icon" onClick={() => removeWord(word.id)} aria-label="Remover palavra">×</Button></div></Card>)}</div>
  </div>;
};

export const EduClassDiscussionSection = ({ classId, bookTitle, chapters, onStartChapter }: FeatureSectionProps) => {
  const { discussions, loading, fetchDiscussions, createDiscussion } = useClassDiscussions();
  const [selectedChapter, setSelectedChapter] = useState(chapters[0]?.id || 1);
  const [content, setContent] = useState("");
  useEffect(() => { if (bookTitle) fetchDiscussions(classId); }, [classId, bookTitle, fetchDiscussions]);
  useEffect(() => { if (!chapters.some((chapter) => chapter.id === selectedChapter)) setSelectedChapter(chapters[0]?.id || 1); }, [chapters, selectedChapter]);
  const chapterDiscussions = discussions.filter((discussion) => discussion.chapter_number === selectedChapter);
  const submit = async () => { if (!content.trim()) return; const chapter = chapters.find((item) => item.id === selectedChapter); const result = await createDiscussion(classId, selectedChapter, content.trim(), chapter?.title || "Capítulo " + selectedChapter); if (result) setContent(""); };
  if (!bookTitle) return <section className="rounded-[30px] border border-dashed border-border bg-muted/10 p-10 text-center"><MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/50" /><h2 className="text-xl font-bold mt-4">O debate começa quando houver um livro.</h2><p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">Quando o professor definir o livro, cada capítulo poderá ganhar sua própria conversa.</p></section>;
  return <div className="space-y-6"><section className="rounded-[30px] border border-border bg-card p-6 shadow-sm"><p className="text-xs uppercase tracking-[0.18em] font-bold text-accent">Debate da turma</p><h1 className="text-3xl font-bold mt-2">{bookTitle}</h1><p className="text-sm text-muted-foreground mt-2">Um único espaço para conversar sobre o livro escolhido pelo professor, capítulo por capítulo.</p></section>
    <section className="rounded-[30px] border border-border bg-card p-6 shadow-sm"><div className="flex flex-wrap gap-2">{chapters.map((chapter) => <Button key={chapter.id} size="sm" variant={selectedChapter === chapter.id ? "default" : "outline"} onClick={() => setSelectedChapter(chapter.id)}>Cap. {chapter.id}</Button>)}</div><div className="mt-5 flex flex-col sm:flex-row gap-3"><Input value={content} onChange={(event) => setContent(event.target.value)} placeholder={"Compartilhe uma ideia sobre " + (chapters.find((chapter) => chapter.id === selectedChapter)?.title || "este capítulo") + "..."} onKeyDown={(event) => { if (event.key === "Enter") void submit(); }} /><Button onClick={() => void submit()} disabled={!content.trim()}><Send className="h-4 w-4 mr-2" /> Publicar</Button></div></section>
    <section className="rounded-[30px] border border-border bg-card p-6 shadow-sm">{loading ? <p className="text-sm text-muted-foreground">Carregando debate...</p> : chapterDiscussions.length === 0 ? <div className="py-10 text-center text-muted-foreground"><MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>Nenhuma conversa neste capítulo ainda.</p><Button variant="outline" size="sm" className="mt-4" onClick={() => onStartChapter(selectedChapter)}>Abrir capítulo</Button></div> : <div className="space-y-3">{chapterDiscussions.map((discussion) => <article key={discussion.id} className="rounded-2xl border border-border bg-muted/15 p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">Leitor da turma</p><span className="text-xs text-muted-foreground">{new Date(discussion.created_at).toLocaleString("pt-BR")}</span></div><p className="text-sm leading-relaxed mt-2">{discussion.content}</p></article>)}</div>}</section>
  </div>;
};

export const EduDiagnosticSummary = ({ onOpen }: { onOpen: () => void }) => {
  const [prefs, setPrefs] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) { if (active) setLoading(false); return; }
      const { data } = await supabase
        .from("edu_student_preferences" as any)
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (!active) return;
      setPrefs((data as Record<string, any>) || null);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const rows = [
    { label: "Rotina diária", value: prefs?.routine_minutes ? `${prefs.routine_minutes} min` : "Não informado" },
    { label: "Maior dificuldade", value: BARRIER_LABELS[prefs?.reading_barrier as string] || "Não informado" },
    { label: "Apoio preferido", value: SUPPORT_LABELS[prefs?.preferred_support as string] || "Não informado" },
  ];

  return (
    <Card className="rounded-[26px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] font-bold text-muted-foreground">Seu diagnóstico</p>
          <h2 className="text-xl font-bold mt-1">Como sua leitura está organizada</h2>
        </div>
        <Target className="h-6 w-6 text-primary" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3 mt-5">
        {rows.map((row) => (
          <div key={row.label} className="rounded-2xl border border-border bg-muted/20 p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{row.label}</p>
            <p className="text-sm font-semibold mt-1">{loading ? "..." : row.value}</p>
          </div>
        ))}
      </div>
      <Button className="mt-5" onClick={onOpen}>Refazer diagnóstico</Button>
    </Card>
  );
};
