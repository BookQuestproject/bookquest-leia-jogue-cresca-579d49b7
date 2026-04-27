// Dados fictícios para o modo demonstração do BookQuest EDU
// Toda a navegação demo consome este arquivo — nenhum dado é gravado no banco.

export const DEMO_SCHOOL = "Escola Modelo BookQuest";
export const DEMO_TEACHER = {
  id: "demo-teacher-1",
  name: "Prof. Ana Souza",
  email: "ana.souza@escolamodelo.demo",
  avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Ana%20Souza&backgroundColor=1E3A8A&textColor=ffffff",
};

export const DEMO_STUDENT = {
  id: "demo-student-lucas",
  name: "Lucas Martins",
  username: "lucasmartins",
  email: "lucas.martins@escolamodelo.demo",
  avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Lucas%20Martins&backgroundColor=D4AF37&textColor=000000",
  xp: 1240,
  essencia: 320,
  level: 7,
  streak: 12,
};

export const DEMO_CLASS = {
  id: "demo-class-8a",
  name: "8º Ano A",
  grade: "8º Ano",
  school: DEMO_SCHOOL,
  access_code: "DEMO8A",
  book_title: "O Pequeno Príncipe",
  book_author: "Antoine de Saint-Exupéry",
  book_cover: "https://m.media-amazon.com/images/I/71OZY035QKL._AC_UF1000,1000_QL80_.jpg",
  total_pages: 96,
  total_chapters: 27,
  reading_start_date: "2025-04-01",
  reading_deadline: "2025-05-15",
  members_count: 28,
  avg_progress: 64,
};

// 28 alunos com nomes brasileiros realistas
const FIRST_NAMES = [
  "Lucas", "Maria", "Pedro", "Júlia", "Gabriel", "Sofia", "Mateus", "Helena",
  "Arthur", "Alice", "Bernardo", "Laura", "Heitor", "Manuela", "Davi", "Valentina",
  "Theo", "Cecília", "Miguel", "Beatriz", "Rafael", "Lara", "Enzo", "Isabela",
  "Bryan", "Mariana", "Caio", "Yasmin",
];
const LAST_NAMES = [
  "Martins", "Silva", "Souza", "Oliveira", "Pereira", "Costa", "Almeida", "Ribeiro",
  "Carvalho", "Gomes", "Lima", "Araújo", "Fernandes", "Barbosa", "Rocha", "Dias",
  "Nascimento", "Cavalcanti", "Mendes", "Pinto", "Cardoso", "Reis", "Castro", "Correia",
  "Teixeira", "Moreira", "Andrade", "Vieira",
];

export interface DemoStudent {
  id: string;
  name: string;
  avatar: string;
  current_page: number;
  progress_percent: number;
  pages_today: number;
  last_active: string;
  badges: number;
  status: "ahead" | "on_track" | "behind";
}

function buildStudents(): DemoStudent[] {
  const list: DemoStudent[] = [];
  for (let i = 0; i < 28; i++) {
    const name = `${FIRST_NAMES[i]} ${LAST_NAMES[i]}`;
    const seed = (i * 7 + 13) % 100;
    // Lucas (i=0) tem progresso parcial específico
    let current_page: number;
    if (i === 0) current_page = 58;
    else current_page = Math.min(96, Math.max(8, Math.floor((seed / 100) * 96)));
    const progress_percent = Math.round((current_page / 96) * 100);
    const status: DemoStudent["status"] =
      progress_percent >= 75 ? "ahead" : progress_percent >= 45 ? "on_track" : "behind";
    list.push({
      id: i === 0 ? DEMO_STUDENT.id : `demo-student-${i}`,
      name,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=${i % 2 ? "1E3A8A" : "D4AF37"}&textColor=ffffff`,
      current_page,
      progress_percent,
      pages_today: ((seed * 3) % 12) + 1,
      last_active: ["Agora", "5 min atrás", "1h atrás", "Hoje", "Ontem"][i % 5],
      badges: (seed % 5) + 1,
      status,
    });
  }
  // Ordenar por progresso desc para ranking
  return list.sort((a, b) => b.current_page - a.current_page);
}

export const DEMO_STUDENTS = buildStudents();

export const DEMO_LUCAS_PROGRESS = DEMO_STUDENTS.find(s => s.id === DEMO_STUDENT.id)!;

export const DEMO_RECENT_ACTIVITIES = [
  { id: "a1", student: "Maria Silva", action: "completou o capítulo 12", time: "Agora" },
  { id: "a2", student: "Lucas Martins", action: "leu 8 páginas hoje", time: "5 min atrás" },
  { id: "a3", student: "Pedro Souza", action: "ganhou medalha de 50%", time: "12 min atrás" },
  { id: "a4", student: "Júlia Oliveira", action: "respondeu a pergunta do cap. 10", time: "30 min atrás" },
  { id: "a5", student: "Gabriel Pereira", action: "atualizou progresso para 72%", time: "1h atrás" },
  { id: "a6", student: "Sofia Costa", action: "completou desafio semanal", time: "2h atrás" },
];

export const DEMO_PENDING_REVIEWS = [
  { id: "r1", student: "Maria Silva", chapter: "Cap. 12 — O Encontro", submitted: "Hoje, 14:32", type: "Reflexão" },
  { id: "r2", student: "Pedro Souza", chapter: "Cap. 11 — A Rosa", submitted: "Hoje, 11:08", type: "Resposta" },
  { id: "r3", student: "Júlia Oliveira", chapter: "Cap. 10 — A Raposa", submitted: "Ontem, 19:45", type: "Reflexão" },
  { id: "r4", student: "Gabriel Pereira", chapter: "Cap. 9 — O Aviador", submitted: "Ontem, 16:20", type: "Resposta" },
];

export const DEMO_CHAPTERS = [
  { number: 1, title: "Quando eu tinha seis anos", pages: 4, status: "done" as const },
  { number: 2, title: "O encontro no deserto", pages: 5, status: "done" as const },
  { number: 3, title: "De onde vens?", pages: 4, status: "done" as const },
  { number: 4, title: "O asteróide B-612", pages: 5, status: "done" as const },
  { number: 5, title: "Os baobás", pages: 4, status: "done" as const },
  { number: 6, title: "O pôr do sol", pages: 3, status: "done" as const },
  { number: 7, title: "A flor", pages: 4, status: "done" as const },
  { number: 8, title: "A rosa", pages: 5, status: "done" as const },
  { number: 9, title: "A despedida", pages: 4, status: "done" as const },
  { number: 10, title: "A raposa", pages: 6, status: "done" as const },
  { number: 11, title: "O encontro com o aviador", pages: 4, status: "done" as const },
  { number: 12, title: "O segredo do coração", pages: 5, status: "current" as const },
  { number: 13, title: "O retorno", pages: 4, status: "locked" as const },
  { number: 14, title: "Despedida final", pages: 5, status: "locked" as const },
];

export const DEMO_MISSIONS = [
  { id: "m1", title: "Ler 10 páginas hoje", reward: 20, progress: 8, goal: 10, type: "daily" as const },
  { id: "m2", title: "Completar 1 capítulo", reward: 30, progress: 0, goal: 1, type: "daily" as const },
  { id: "m3", title: "Ler 5 dias seguidos", reward: 80, progress: 4, goal: 5, type: "weekly" as const },
  { id: "m4", title: "Responder 3 reflexões da turma", reward: 60, progress: 2, goal: 3, type: "weekly" as const },
];

export const DEMO_ACHIEVEMENTS_STUDENT = [
  { id: "ac1", label: "Primeira página", icon: "📖", earned: true },
  { id: "ac2", label: "25% concluído", icon: "🥉", earned: true },
  { id: "ac3", label: "50% concluído", icon: "🥈", earned: true },
  { id: "ac4", label: "Sequência de 7 dias", icon: "🔥", earned: true },
  { id: "ac5", label: "75% concluído", icon: "🥇", earned: false },
  { id: "ac6", label: "Livro completo", icon: "🏆", earned: false },
];

export const DEMO_ANNOUNCEMENTS = [
  {
    id: "an1",
    teacher: DEMO_TEACHER.name,
    content: "Pessoal, lembrem-se: amanhã teremos discussão dos capítulos 10 a 12 em sala. Venham preparados!",
    created_at: "Hoje, 09:15",
  },
  {
    id: "an2",
    teacher: DEMO_TEACHER.name,
    content: "Parabéns à turma! Atingimos 64% de progresso médio. Continuem firmes na leitura.",
    created_at: "Ontem, 18:00",
  },
];

export const DEMO_CHALLENGES = [
  {
    id: "ch1",
    title: "Maratona da semana",
    description: "Leia 50 páginas até domingo",
    goal: 50,
    progress: 32,
    end_date: "Domingo",
    type: "weekly" as const,
  },
  {
    id: "ch2",
    title: "Top 5 do mês",
    description: "Esteja entre os 5 primeiros do ranking",
    goal: 5,
    progress: 1,
    end_date: "Final do mês",
    type: "monthly" as const,
  },
];

// ===== Atividades da turma (Demo) =====
export type DemoActivityResponseType = "text" | "multiple_choice" | "file" | "open";

export interface DemoActivityResponse {
  studentId: string;
  studentName: string;
  studentAvatar: string;
  responseText: string;
  submittedAt: string; // ISO
  reviewed: boolean;
  feedback?: string;
}

export interface DemoActivity {
  id: string;
  title: string;
  description: string;
  bookTitle?: string;
  chapter?: string;
  responseType: DemoActivityResponseType;
  deadline: string | null; // ISO date or null
  createdAt: string; // ISO
  closedManually?: boolean;
  responses: DemoActivityResponse[];
}

// Helpers para o seed
const today = new Date();
const addDays = (d: number) => {
  const x = new Date(today);
  x.setDate(x.getDate() + d);
  return x.toISOString();
};
const subDays = (d: number) => addDays(-d);

const seedResponses = (count: number): DemoActivityResponse[] =>
  DEMO_STUDENTS.slice(0, count).map((s, i) => ({
    studentId: s.id,
    studentName: s.name,
    studentAvatar: s.avatar,
    responseText:
      i % 3 === 0
        ? "A raposa ensina ao Pequeno Príncipe que o essencial é invisível aos olhos. Achei muito tocante a forma como ela explica o cativar."
        : i % 3 === 1
        ? "O capítulo me marcou pela simplicidade da mensagem. O autor mostra que os adultos esquecem do que realmente importa."
        : "A relação entre o Pequeno Príncipe e a rosa mostra como o amor envolve responsabilidade. Foi minha parte favorita até agora.",
    submittedAt: subDays(Math.floor(i / 3)),
    reviewed: i < 2,
    feedback: i < 2 ? "Ótima reflexão, continue assim!" : undefined,
  }));

export const DEMO_INITIAL_ACTIVITIES: DemoActivity[] = [
  {
    id: "act-seed-1",
    title: "Reflexão sobre a Raposa",
    description:
      "Releia o capítulo 10 (A raposa) e escreva, em pelo menos 5 linhas, o que você entendeu sobre a frase 'tu te tornas eternamente responsável por aquilo que cativas'.",
    bookTitle: DEMO_CLASS.book_title,
    chapter: "Cap. 10 — A raposa",
    responseType: "text",
    deadline: addDays(3),
    createdAt: subDays(2),
    responses: seedResponses(12),
  },
  {
    id: "act-seed-2",
    title: "Quiz: Asteróide B-612",
    description:
      "Responda quem é o astrônomo turco que descobriu o asteróide do Pequeno Príncipe e por que ninguém acreditou nele inicialmente.",
    bookTitle: DEMO_CLASS.book_title,
    chapter: "Cap. 4 — O asteróide B-612",
    responseType: "open",
    deadline: subDays(1), // já encerrada
    createdAt: subDays(7),
    responses: seedResponses(22),
  },
  {
    id: "act-seed-3",
    title: "Diário de leitura — capítulo livre",
    description:
      "Escolha qualquer capítulo já lido e escreva um diário de leitura registrando suas impressões. Não há prazo: entregue quando se sentir pronto.",
    bookTitle: DEMO_CLASS.book_title,
    responseType: "open",
    deadline: null,
    createdAt: subDays(5),
    responses: seedResponses(8),
  },
];

export const DEMO_REPORTS = {
  total_students: 28,
  active_today: 21,
  avg_pages_per_day: 7.2,
  on_track_count: 18,
  ahead_count: 6,
  behind_count: 4,
  completion_forecast: "12 dias",
  weekly_activity: [
    { day: "Seg", pages: 142 },
    { day: "Ter", pages: 168 },
    { day: "Qua", pages: 195 },
    { day: "Qui", pages: 210 },
    { day: "Sex", pages: 188 },
    { day: "Sáb", pages: 95 },
    { day: "Dom", pages: 78 },
  ],
};
