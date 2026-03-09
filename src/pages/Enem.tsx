import { useState, useMemo } from "react";
import {
  GraduationCap, BookOpen, Search, Sparkles, Trophy, Star, ChevronRight,
  Award, Lightbulb, Zap, BookMarked, Filter, Target, Clock, CheckCircle,
  ArrowRight, RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useAcademicDiagnosis } from "@/hooks/useAcademicDiagnosis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RepertoireProgressPanel } from "@/components/repertoire/RepertoireProgressPanel";
import { DailyChallenge } from "@/components/repertoire/DailyChallenge";
import { RepertoireCard } from "@/components/repertoire/RepertoireCard";
import { repertoriosCompletos } from "@/data/repertorios";

/* ═══════════ DATA ═══════════ */

interface Repertorio {
  id: string;
  titulo: string;
  autor: string;
  temas: string[];
  resumo: string;
  exemploUso: string;
  resumoRapido: string;
}

interface ObraVestibular {
  id: string;
  titulo: string;
  autor: string;
  vestibulares: string[];
  genero: string;
  capitulos: { titulo: string; resumo: string }[];
  contextoHistorico: string;
  temasRedacao: string[];
  frasesImportantes: string[];
}

const repertorios: Repertorio[] = [
  {
    id: "1984", titulo: "1984", autor: "George Orwell",
    temas: ["controle social", "tecnologia", "vigilância", "liberdade de expressão", "totalitarismo"],
    resumo: "Romance distópico que retrata uma sociedade totalitária onde o governo controla todos os aspectos da vida dos cidadãos através da vigilância constante e da manipulação da verdade.",
    exemploUso: "Na obra '1984', de George Orwell, a figura do Grande Irmão representa o controle estatal absoluto sobre a população. De forma análoga, na sociedade contemporânea, o uso indiscriminado de dados pessoais por grandes corporações tecnológicas configura uma forma moderna de vigilância.",
    resumoRapido: "Sociedade totalitária com vigilância constante. Use para temas sobre controle, tecnologia e liberdade.",
  },
  {
    id: "admiravel-mundo-novo", titulo: "Admirável Mundo Novo", autor: "Aldous Huxley",
    temas: ["tecnologia", "consumismo", "alienação", "controle social", "biotecnologia"],
    resumo: "Distopia onde a sociedade é controlada pelo prazer, consumo e engenharia genética.",
    exemploUso: "Em 'Admirável Mundo Novo', Huxley antecipou a alienação causada pelo consumismo desenfreado. No Brasil atual, a dependência de redes sociais reflete essa lógica de controle pelo entretenimento.",
    resumoRapido: "Controle pelo prazer e consumo. Use para alienação, consumismo e manipulação social.",
  },
  {
    id: "a-hora-da-estrela", titulo: "A Hora da Estrela", autor: "Clarice Lispector",
    temas: ["desigualdade social", "migração", "invisibilidade social", "identidade", "gênero"],
    resumo: "Narra a história de Macabéa, uma jovem nordestina que vive em São Paulo enfrentando miséria e invisibilidade social.",
    exemploUso: "A personagem Macabéa encarna a invisibilidade social dos migrantes nordestinos nas grandes cidades, evidenciando a desigualdade estrutural no Brasil.",
    resumoRapido: "Nordestina invisível em SP. Use para desigualdade social, migração e invisibilidade.",
  },
  {
    id: "vidas-secas", titulo: "Vidas Secas", autor: "Graciliano Ramos",
    temas: ["desigualdade social", "seca", "migração", "desumanização", "pobreza"],
    resumo: "Retrata a saga de Fabiano e sua família pelo sertão nordestino, enfrentando a seca, a fome e a exploração social.",
    exemploUso: "Em 'Vidas Secas', a desumanização de Fabiano evidencia como a miséria extrema priva os indivíduos de sua própria humanidade.",
    resumoRapido: "Família retirante no sertão. Use para pobreza, seca e desumanização.",
  },
  {
    id: "quarto-de-despejo", titulo: "Quarto de Despejo", autor: "Carolina Maria de Jesus",
    temas: ["desigualdade social", "fome", "racismo", "gênero", "periferia"],
    resumo: "Diário de uma catadora de papel que vive na favela do Canindé, em São Paulo, relatando a fome e a miséria com brutal honestidade.",
    exemploUso: "Carolina Maria de Jesus, em 'Quarto de Despejo', denuncia a fome como instrumento de opressão social. Seu relato permanece atual diante da insegurança alimentar que afeta milhões de brasileiros.",
    resumoRapido: "Diário real da favela. Use para fome, racismo e desigualdade urbana.",
  },
  {
    id: "o-cortico", titulo: "O Cortiço", autor: "Aluísio Azevedo",
    temas: ["desigualdade social", "urbanização", "determinismo", "exploração", "racismo"],
    resumo: "Retrata a vida em um cortiço carioca no final do século XIX, mostrando as relações de exploração e as condições degradantes.",
    exemploUso: "Em 'O Cortiço', Aluísio Azevedo denuncia a exploração habitacional e as condições desumanas da classe trabalhadora, tema atualíssimo nas periferias brasileiras.",
    resumoRapido: "Vida em cortiço no Rio. Use para urbanização, exploração e determinismo social.",
  },
];

const obrasVestibular: ObraVestibular[] = [
  {
    id: "dom-casmurro", titulo: "Dom Casmurro", autor: "Machado de Assis",
    vestibulares: ["fuvest", "unicamp", "unesp"],
    genero: "Romance Realista",
    contextoHistorico: "Publicado em 1899, no auge do Realismo brasileiro. Machado critica a sociedade patriarcal do Segundo Reinado.",
    temasRedacao: ["ciúme", "patriarcalismo", "narrativa não-confiável", "casamento", "sociedade de aparências"],
    frasesImportantes: [
      "Não consultes dicionários. Casmurro não está aqui no sentido que eles lhe dão.",
      "A confusão era geral, porque a justiça humana não é a divina.",
    ],
    capitulos: [
      { titulo: "Do título", resumo: "Bento Santiago explica por que recebeu o apelido de Dom Casmurro e seu projeto de reconstruir a casa da infância." },
      { titulo: "Do livro", resumo: "O narrador justifica a escrita de suas memórias para 'atar as duas pontas da vida'." },
      { titulo: "A denúncia", resumo: "José Dias sugere à mãe de Bentinho que Capitu tem 'olhos de cigana oblíqua e dissimulada'." },
      { titulo: "O seminário", resumo: "Bentinho é enviado ao seminário por promessa de sua mãe, iniciando a separação de Capitu." },
      { titulo: "Olhos de ressaca", resumo: "Descrição famosa dos olhos de Capitu e o início da obsessão de Bentinho." },
    ],
  },
  {
    id: "memorias-postumas", titulo: "Memórias Póstumas de Brás Cubas", autor: "Machado de Assis",
    vestibulares: ["fuvest", "unicamp"],
    genero: "Romance Realista",
    contextoHistorico: "Publicado em 1881, marca a transição do Romantismo para o Realismo no Brasil. Narrado por um defunto autor.",
    temasRedacao: ["hipocrisia social", "vaidade", "escravidão", "classe social", "morte"],
    frasesImportantes: [
      "Ao verme que primeiro roeu as frias carnes do meu cadáver dedico como saudosa lembrança estas Memórias Póstumas.",
      "Não tive filhos, não transmiti a nenhuma criatura o legado da nossa miséria.",
    ],
    capitulos: [
      { titulo: "Óbito do autor", resumo: "Brás Cubas narra sua própria morte por pneumonia e decide escrever suas memórias." },
      { titulo: "O emplasto", resumo: "Apresenta a ideia fixa do emplasto anti-hipocondríaco que o levou à morte." },
      { titulo: "Genealogia", resumo: "Brás Cubas descreve sua linhagem familiar com ironia mordaz." },
    ],
  },
  {
    id: "capitaes-da-areia", titulo: "Capitães da Areia", autor: "Jorge Amado",
    vestibulares: ["unesp", "ufmg"],
    genero: "Romance Social",
    contextoHistorico: "Publicado em 1937, no contexto da Era Vargas e das tensões sociais no Brasil. Retrata crianças abandonadas em Salvador.",
    temasRedacao: ["menor abandonado", "desigualdade", "infância", "violência urbana", "exclusão social"],
    frasesImportantes: [
      "A cidade é deles. De dia, recuam para o trapiche. De noite, a cidade é dos Capitães da Areia.",
    ],
    capitulos: [
      { titulo: "Cartas à redação", resumo: "Jornais publicam denúncias sobre um grupo de meninos de rua em Salvador." },
      { titulo: "Sob a lua num velho trapiche abandonado", resumo: "Apresentação do bando e de Pedro Bala, seu líder carismático." },
      { titulo: "Noite dos Capitães da Areia", resumo: "A rotina do grupo entre roubos, aventuras e a solidão da vida nas ruas." },
    ],
  },
  {
    id: "grande-sertao", titulo: "Grande Sertão: Veredas", autor: "Guimarães Rosa",
    vestibulares: ["fuvest", "unicamp", "ufmg"],
    genero: "Romance Regionalista",
    contextoHistorico: "Publicado em 1956, é considerado a obra-prima do modernismo brasileiro. Linguagem inovadora e reflexão existencial.",
    temasRedacao: ["bem vs mal", "identidade", "sertão", "linguagem", "amor proibido"],
    frasesImportantes: [
      "O diabo não existe... e eu digo! O que existe é homem humano.",
      "Viver é muito perigoso.",
    ],
    capitulos: [
      { titulo: "O início da travessia", resumo: "Riobaldo narra sua vida como jagunço e reflete sobre a existência do diabo." },
      { titulo: "Diadorim", resumo: "Surgimento de Diadorim, a figura ambígua que transforma a vida de Riobaldo." },
      { titulo: "A guerra", resumo: "Conflitos entre bandos jagunços no sertão de Minas Gerais." },
    ],
  },
  {
    id: "macunaima", titulo: "Macunaíma", autor: "Mário de Andrade",
    vestibulares: ["fuvest", "unesp"],
    genero: "Rapsódia Modernista",
    contextoHistorico: "Publicado em 1928, no auge do Modernismo brasileiro. Construção do 'herói sem nenhum caráter' como símbolo da brasilidade.",
    temasRedacao: ["identidade nacional", "cultura popular", "miscigenação", "modernismo"],
    frasesImportantes: [
      "Ai, que preguiça!",
      "Pouca saúde e muita saúva, os males do Brasil são.",
    ],
    capitulos: [
      { titulo: "Macunaíma", resumo: "Nascimento do herói na tribo tapanhumas, demonstrando preguiça e esperteza desde criança." },
      { titulo: "Maioridade", resumo: "Macunaíma cresce e parte em aventuras pelo Brasil." },
    ],
  },
  {
    id: "iracema", titulo: "Iracema", autor: "José de Alencar",
    vestibulares: ["unesp", "ufmg"],
    genero: "Romance Indianista",
    contextoHistorico: "Publicado em 1865, representa o Romantismo e o indianismo brasileiro. Alegoria da formação do povo brasileiro.",
    temasRedacao: ["colonização", "identidade nacional", "miscigenação", "natureza"],
    frasesImportantes: [
      "Iracema, a virgem dos lábios de mel, que tinha os cabelos mais negros que a asa da graúna.",
    ],
    capitulos: [
      { titulo: "O encontro", resumo: "Iracema encontra Martim, o guerreiro branco, nas terras dos tabajaras." },
      { titulo: "O exílio", resumo: "Iracema abandona sua tribo por amor a Martim." },
    ],
  },
  {
    id: "o-alienista", titulo: "O Alienista", autor: "Machado de Assis",
    vestibulares: ["fuvest", "unicamp", "unesp"],
    genero: "Conto / Novela Realista",
    contextoHistorico: "Publicado em 1882, é uma sátira ao cientificismo e ao poder autoritário. Machado de Assis critica a linha tênue entre razão e loucura, questionando os limites da ciência.",
    temasRedacao: ["ciência e poder", "loucura vs razão", "autoritarismo", "relativismo", "crítica social"],
    frasesImportantes: [
      "A loucura, objeto dos meus estudos, era até agora uma ilha perdida no oceano da razão; começo a suspeitar que é um continente.",
      "Suponho que o senhor não contesta que esta moça está louca. Está vestida de uma maneira fora do comum.",
    ],
    capitulos: [
      { titulo: "A chegada de Simão Bacamarte", resumo: "O médico retorna a Itaguaí com o projeto de estudar a loucura e funda a Casa Verde." },
      { titulo: "A Casa Verde", resumo: "O asilo cresce descontroladamente, internando cada vez mais cidadãos sob critérios arbitrários." },
      { titulo: "A Revolta", resumo: "O barbeiro Porfírio lidera uma rebelião contra Bacamarte, mas acaba internado." },
      { titulo: "O desfecho", resumo: "Bacamarte inverte seus critérios e, ao final, interna a si mesmo como o único louco verdadeiro." },
    ],
  },
  {
    id: "sao-bernardo", titulo: "São Bernardo", autor: "Graciliano Ramos",
    vestibulares: ["fuvest", "unicamp", "ufmg"],
    genero: "Romance Regionalista / Modernista",
    contextoHistorico: "Publicado em 1934, no contexto da Segunda Fase do Modernismo. Retrata a brutalidade do sistema patriarcal e latifundiário do Nordeste brasileiro.",
    temasRedacao: ["patriarcalismo", "violência doméstica", "coisificação humana", "capitalismo rural", "solidão"],
    frasesImportantes: [
      "Fiz coisas boas e coisas ruins; fiz coisas ruins como quem faz coisas boas.",
      "Cinquenta anos perdidos, cinquenta anos gastos sem objetivo, a toa.",
    ],
    capitulos: [
      { titulo: "A ascensão de Paulo Honório", resumo: "Ex-guia de cego narra como se tornou dono da fazenda São Bernardo através de métodos violentos." },
      { titulo: "O casamento com Madalena", resumo: "Paulo Honório se casa com a professora Madalena, esperando que ela seja mais uma de suas posses." },
      { titulo: "O ciúme e a tragédia", resumo: "O ciúme doentio de Paulo Honório sufoca Madalena, levando-a ao suicídio." },
      { titulo: "A solidão", resumo: "Sozinho e destruído, Paulo Honório tenta encontrar sentido escrevendo suas memórias." },
    ],
  },
  {
    id: "angustia", titulo: "Angústia", autor: "Graciliano Ramos",
    vestibulares: ["fuvest", "ufmg"],
    genero: "Romance Psicológico",
    contextoHistorico: "Publicado em 1936, é uma obra da Segunda Geração Modernista. Explora a mente atormentada de um funcionário público em Maceió, mesclando realidade e delírio.",
    temasRedacao: ["alienação", "ciúme", "loucura", "classe social", "violência psicológica"],
    frasesImportantes: [
      "Levanto-me, bebo café, passo o dia escrevendo coisas que me repugnam.",
      "As mãos sujas, mãos de assassino...",
    ],
    capitulos: [
      { titulo: "Luís da Silva", resumo: "Apresentação do protagonista, um escritor frustrado e funcionário público que vive uma existência medíocre." },
      { titulo: "Marina", resumo: "Luís se apaixona pela vizinha Marina, que o troca pelo rico e superficial Julião Tavares." },
      { titulo: "A obsessão", resumo: "Consumido por ciúme e ódio, Luís mergulha em delírios e memórias fragmentadas da infância." },
      { titulo: "O crime", resumo: "Luís assassina Julião Tavares e é tomado pelo remorso e pela paranoia." },
    ],
  },
  {
    id: "a-moreninha", titulo: "A Moreninha", autor: "Joaquim Manuel de Macedo",
    vestibulares: ["unesp", "ufmg"],
    genero: "Romance Romântico",
    contextoHistorico: "Publicado em 1844, é considerado o primeiro romance brasileiro de sucesso. Representa o Romantismo urbano com idealização amorosa e costumes da sociedade carioca.",
    temasRedacao: ["amor idealizado", "costumes sociais", "juventude", "romantismo brasileiro"],
    frasesImportantes: [
      "É ela! É ela! É ela! É ela!",
      "A paixão é como a onda: vai e vem, e cada vez que vem, vem mais forte.",
    ],
    capitulos: [
      { titulo: "A aposta", resumo: "Augusto, estudante de medicina, aposta com amigos que nunca se apaixonará, pois é namorador inconstante." },
      { titulo: "A ilha de Paquetá", resumo: "Durante um fim de semana na ilha, Augusto conhece Carolina, a Moreninha, e se apaixona perdidamente." },
      { titulo: "O breve e a promessa", resumo: "Augusto descobre que ele e Carolina já haviam se prometido na infância através de um breve." },
    ],
  },
  {
    id: "luciola", titulo: "Lucíola", autor: "José de Alencar",
    vestibulares: ["fuvest", "unesp"],
    genero: "Romance Urbano Romântico",
    contextoHistorico: "Publicado em 1862, é um perfil de mulher que explora a dualidade entre pureza e pecado na sociedade carioca do Segundo Reinado. José de Alencar critica a hipocrisia moral da elite.",
    temasRedacao: ["moralidade", "hipocrisia social", "redenção", "prostituição", "amor e sacrifício"],
    frasesImportantes: [
      "Quem sabe? A sociedade grande inventou um grande número de pecados que não estão no catecismo.",
      "Eu não sou Lúcia; sou Lucíola, a borboleta de fogo.",
    ],
    capitulos: [
      { titulo: "O encontro no Glória", resumo: "Paulo, jovem provinciano, avista Lúcia pela primeira vez e confunde-a com uma moça de família." },
      { titulo: "A revelação", resumo: "Paulo descobre que Lúcia é uma cortesã famosa no Rio de Janeiro, mas não consegue afastar-se." },
      { titulo: "A transformação", resumo: "O amor de Paulo desperta em Lúcia a pureza de Maria da Glória, seu verdadeiro nome." },
      { titulo: "O sacrifício", resumo: "Lúcia adoece e morre, redimida pelo amor, carregando o filho que perdeu como símbolo de sua redenção." },
    ],
  },
];

const VESTIBULARES = [
  { id: "fuvest", label: "Fuvest (USP)", color: "hsl(var(--accent))" },
  { id: "unicamp", label: "Unicamp", color: "hsl(220, 90%, 56%)" },
  { id: "unesp", label: "Unesp", color: "hsl(150, 60%, 45%)" },
  { id: "ufmg", label: "UFMG", color: "hsl(0, 70%, 55%)" },
];

const TEMAS_ENEM = [
  "desigualdade social", "tecnologia", "controle social", "educação",
  "racismo", "gênero", "migração", "consumismo", "liberdade de expressão",
  "urbanização", "fome", "pobreza", "identidade", "alienação",
];

/* ═══════════ DIAGNOSIS COMPONENT ═══════════ */

const DiagnosisQuiz = ({ onComplete }: { onComplete: () => void }) => {
  const { saveDiagnosis } = useAcademicDiagnosis();
  const [step, setStep] = useState(0);
  const [focus, setFocus] = useState("");
  const [exams, setExams] = useState<string[]>([]);
  const [hours, setHours] = useState(5);
  const [saving, setSaving] = useState(false);

  const handleFinish = async (selectedHours?: number) => {
    setSaving(true);
    const ok = await saveDiagnosis({ focus, targetExams: exams, weeklyHours: selectedHours ?? hours });
    setSaving(false);
    if (ok) onComplete();
  };

  const toggleExam = (id: string) => {
    setExams(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 py-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Target className="h-7 w-7 text-accent" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Diagnóstico Acadêmico</h2>
        <p className="text-sm text-muted-foreground mt-1">Vamos personalizar sua trilha de estudos</p>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-muted/40"}`} />
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Qual seu foco principal?</h3>
          {[
            { value: "enem", label: "ENEM", desc: "Repertório sociocultural para redação e interpretação de texto" },
            { value: "vestibulares", label: "Vestibulares", desc: "Obras obrigatórias e análise literária para provas específicas" },
            { value: "ambos", label: "Ambos", desc: "Preparação completa para ENEM e vestibulares" },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => { setFocus(opt.value); setStep(1); }}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${
                focus === opt.value ? "border-accent bg-accent/10" : "border-border bg-card hover:bg-muted/30"
              }`}
            >
              <p className="font-medium text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (focus === "vestibulares" || focus === "ambos") && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Quais vestibulares você pretende prestar?</h3>
          <div className="grid grid-cols-2 gap-2">
            {VESTIBULARES.map(v => (
              <button
                key={v.id}
                onClick={() => toggleExam(v.id)}
                className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                  exams.includes(v.id) ? "border-accent bg-accent/10 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted/30"
                }`}
              >
                {exams.includes(v.id) && <CheckCircle className="h-3.5 w-3.5 inline mr-1.5 text-accent" />}
                {v.label}
              </button>
            ))}
          </div>
          <Button onClick={() => setStep(2)} disabled={exams.length === 0} className="w-full mt-2">
            Continuar <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {step === 1 && focus === "enem" && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Quantas horas por semana pode dedicar à leitura?</h3>
          <div className="grid grid-cols-3 gap-2">
            {[3, 5, 7, 10, 15, 20].map(h => (
              <button
                key={h}
                onClick={() => { setHours(h); handleFinish(h); }}
                disabled={saving}
                className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                  hours === h ? "border-accent bg-accent/10 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted/30"
                }`}
              >
                {h}h/semana
              </button>
            ))}
          </div>
          {saving && <p className="text-center text-sm text-muted-foreground">Salvando...</p>}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Quantas horas por semana pode dedicar à leitura?</h3>
          <div className="grid grid-cols-3 gap-2">
            {[3, 5, 7, 10, 15, 20].map(h => (
              <button
                key={h}
                onClick={() => { setHours(h); handleFinish(h); }}
                disabled={saving}
                className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                  hours === h ? "border-accent bg-accent/10 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted/30"
                }`}
              >
                {h}h/semana
              </button>
            ))}
          </div>
          {saving && <p className="text-center text-sm text-muted-foreground">Salvando...</p>}
        </div>
      )}
    </div>
  );
};

/* ═══════════ MAIN PAGE ═══════════ */

const Enem = () => {
  const { isPremium } = useProfile();
  const { user } = useAuth();
  const { diagnosis, loading: diagLoading, hasDiagnosis, resetDiagnosis } = useAcademicDiagnosis();
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [searchTema, setSearchTema] = useState("");
  const [selectedTemaFilter, setSelectedTemaFilter] = useState<string | null>(null);
  const [expandedRepertorio, setExpandedRepertorio] = useState<string | null>(null);
  const [expandedObra, setExpandedObra] = useState<string | null>(null);
  const [selectedVestibular, setSelectedVestibular] = useState<string | null>(null);
  const [studiedIds, setStudiedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("bookquest_studied_repertorios");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const markStudied = (id: string) => {
    const updated = new Set(studiedIds);
    if (updated.has(id)) updated.delete(id); else updated.add(id);
    setStudiedIds(updated);
    localStorage.setItem("bookquest_studied_repertorios", JSON.stringify([...updated]));
  };

  // Determine which tab to show based on diagnosis
  const defaultTab = useMemo(() => {
    if (!diagnosis) return "enem";
    if (diagnosis.focus === "vestibulares") return "vestibulares";
    return "enem";
  }, [diagnosis]);

  // Filter repertorios
  const filteredRepertorios = useMemo(() => {
    let list = repertorios;
    const query = searchTema.toLowerCase().trim();
    if (query) list = list.filter(r => r.temas.some(t => t.includes(query)) || r.titulo.toLowerCase().includes(query));
    if (selectedTemaFilter) list = list.filter(r => r.temas.includes(selectedTemaFilter));
    return list;
  }, [searchTema, selectedTemaFilter]);

  // Filter obras by vestibular
  const filteredObras = useMemo(() => {
    if (!selectedVestibular) return obrasVestibular;
    return obrasVestibular.filter(o => o.vestibulares.includes(selectedVestibular));
  }, [selectedVestibular]);

  // Show premium gate for non-premium
  if (!isPremium) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Trilhas Acadêmicas</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            Acesse repertórios socioculturais para o ENEM e obras obrigatórias de vestibulares com o plano Premium.
          </p>
          <Button asChild><a href="/premium">Assinar Premium</a></Button>
        </div>
      </Layout>
    );
  }

  // Show diagnosis if first visit
  if (!diagLoading && user && !hasDiagnosis && !showDiagnosis) {
    return (
      <Layout isPremium={isPremium}>
        <DiagnosisQuiz onComplete={() => setShowDiagnosis(false)} />
      </Layout>
    );
  }

  if (showDiagnosis) {
    return (
      <Layout isPremium={isPremium}>
        <DiagnosisQuiz onComplete={() => setShowDiagnosis(false)} />
      </Layout>
    );
  }

  return (
    <Layout isPremium={isPremium}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-7 w-7 text-accent" />
              Trilhas Acadêmicas
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {diagnosis?.focus === "enem" && "Foco: ENEM — Repertório sociocultural"}
              {diagnosis?.focus === "vestibulares" && `Foco: Vestibulares — ${diagnosis.target_exams.map(e => VESTIBULARES.find(v => v.id === e)?.label).filter(Boolean).join(", ")}`}
              {diagnosis?.focus === "ambos" && "Foco: ENEM + Vestibulares"}
              {!diagnosis && "Prepare-se para ENEM e Vestibulares"}
            </p>
          </div>
          {hasDiagnosis && (
            <Button variant="outline" size="sm" onClick={() => { resetDiagnosis(); setShowDiagnosis(true); }}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Refazer diagnóstico
            </Button>
          )}
        </div>

        {/* Main tabs */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="bg-muted/50 w-full">
            <TabsTrigger value="enem" className="flex-1">
              <Lightbulb className="h-4 w-4 mr-1.5" />
              ENEM
            </TabsTrigger>
            <TabsTrigger value="vestibulares" className="flex-1">
              <BookOpen className="h-4 w-4 mr-1.5" />
              Vestibulares
            </TabsTrigger>
            <TabsTrigger value="conquistas" className="flex-1">
              <Trophy className="h-4 w-4 mr-1.5" />
              Conquistas
            </TabsTrigger>
          </TabsList>

          {/* ═══ ENEM TAB ═══ */}
          <TabsContent value="enem" className="mt-4 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por tema (ex: desigualdade, tecnologia...)"
                value={searchTema}
                onChange={e => setSearchTema(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Theme filters */}
            <div className="flex flex-wrap gap-1.5">
              {TEMAS_ENEM.slice(0, 10).map(tema => (
                <button
                  key={tema}
                  onClick={() => setSelectedTemaFilter(selectedTemaFilter === tema ? null : tema)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedTemaFilter === tema
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tema}
                </button>
              ))}
            </div>

            {/* Repertoire cards */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Biblioteca de Repertórios ({filteredRepertorios.length})
              </h3>
              {filteredRepertorios.map(r => {
                const isExpanded = expandedRepertorio === r.id;
                const isStudied = studiedIds.has(r.id);
                return (
                  <Card key={r.id} className={`bg-card border-border transition-colors ${isStudied ? "border-accent/30" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <button onClick={() => setExpandedRepertorio(isExpanded ? null : r.id)} className="text-left flex-1">
                          <h4 className="font-semibold text-foreground text-sm">{r.titulo}</h4>
                          <p className="text-xs text-muted-foreground">{r.autor}</p>
                        </button>
                        <div className="flex items-center gap-2">
                          {isStudied && <CheckCircle className="h-4 w-4 text-accent" />}
                          <button
                            onClick={() => markStudied(r.id)}
                            className={`text-xs px-2 py-1 rounded-md transition-colors ${
                              isStudied ? "bg-accent/10 text-accent" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {isStudied ? "Estudado" : "Marcar"}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {r.temas.map(t => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{t}</span>
                        ))}
                      </div>

                      <p className="text-xs text-muted-foreground">{r.resumoRapido}</p>

                      {isExpanded && (
                        <div className="mt-4 space-y-3 pt-3 border-t border-border/30">
                          <div>
                            <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Resumo</h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">{r.resumo}</p>
                          </div>
                          <div className="bg-accent/5 border border-accent/10 rounded-lg p-3">
                            <h5 className="text-xs font-bold text-accent uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Exemplo de uso em redação
                            </h5>
                            <p className="text-xs text-foreground/80 leading-relaxed italic">"{r.exemploUso}"</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ═══ VESTIBULARES TAB ═══ */}
          <TabsContent value="vestibulares" className="mt-4 space-y-6">
            {/* Vestibular filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedVestibular(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !selectedVestibular ? "bg-accent text-accent-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                Todos
              </button>
              {VESTIBULARES.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVestibular(selectedVestibular === v.id ? null : v.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedVestibular === v.id ? "bg-accent text-accent-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Recommended based on diagnosis */}
            {diagnosis?.target_exams && diagnosis.target_exams.length > 0 && !selectedVestibular && (
              <div className="bg-accent/5 border border-accent/10 rounded-xl p-4">
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" />
                  Recomendado para você
                </h3>
                <p className="text-xs text-muted-foreground">
                  Baseado no seu diagnóstico: {diagnosis.target_exams.map(e => VESTIBULARES.find(v => v.id === e)?.label).filter(Boolean).join(", ")}
                </p>
              </div>
            )}

            {/* Obras list */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Obras Obrigatórias ({filteredObras.length})
              </h3>
              {filteredObras.map(obra => {
                const isExpanded = expandedObra === obra.id;
                const isStudied = studiedIds.has(`vest-${obra.id}`);
                return (
                  <Card key={obra.id} className={`bg-card border-border transition-colors ${isStudied ? "border-accent/30" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <button onClick={() => setExpandedObra(isExpanded ? null : obra.id)} className="text-left flex-1">
                          <h4 className="font-semibold text-foreground text-sm">{obra.titulo}</h4>
                          <p className="text-xs text-muted-foreground">{obra.autor} · {obra.genero}</p>
                        </button>
                        <button
                          onClick={() => markStudied(`vest-${obra.id}`)}
                          className={`text-xs px-2 py-1 rounded-md transition-colors ${
                            isStudied ? "bg-accent/10 text-accent" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {isStudied ? "✓ Estudado" : "Marcar"}
                        </button>
                      </div>

                      {/* Vestibular badges */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {obra.vestibulares.map(v => {
                          const vest = VESTIBULARES.find(x => x.id === v);
                          return (
                            <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-foreground font-medium">
                              {vest?.label}
                            </span>
                          );
                        })}
                      </div>

                      {isExpanded && (
                        <div className="mt-4 space-y-4 pt-3 border-t border-border/30">
                          {/* Context */}
                          <div>
                            <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Contexto Histórico
                            </h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">{obra.contextoHistorico}</p>
                          </div>

                          {/* Key themes */}
                          <div>
                            <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">Temas para Redação</h5>
                            <div className="flex flex-wrap gap-1">
                              {obra.temasRedacao.map(t => (
                                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">{t}</span>
                              ))}
                            </div>
                          </div>

                          {/* Important quotes */}
                          <div>
                            <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Frases Importantes
                            </h5>
                            {obra.frasesImportantes.map((f, i) => (
                              <p key={i} className="text-xs text-foreground/70 italic mb-1.5 pl-3 border-l-2 border-accent/30">"{f}"</p>
                            ))}
                          </div>

                          {/* Chapters */}
                          <div>
                            <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Resumo por Capítulos
                            </h5>
                            <div className="space-y-2">
                              {obra.capitulos.map((cap, i) => (
                                <div key={i} className="bg-muted/30 rounded-lg p-3">
                                  <p className="text-xs font-semibold text-foreground">{i + 1}. {cap.titulo}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{cap.resumo}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ═══ CONQUISTAS TAB ═══ */}
          <TabsContent value="conquistas" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "first", label: "Primeiro Repertório", desc: "Estude 1 repertório", goal: 1, icon: "📖" },
                { id: "five", label: "Estudante Dedicado", desc: "Estude 5 repertórios", goal: 5, icon: "📚" },
                { id: "ten", label: "Mestre do Repertório", desc: "Estude 10 repertórios", goal: 10, icon: "🎓" },
                { id: "vest3", label: "Vestibulando", desc: "Estude 3 obras de vestibular", goal: 3, icon: "🏆" },
                { id: "all-vest", label: "Preparado Total", desc: "Estude todas as obras", goal: obrasVestibular.length, icon: "👑" },
              ].map(badge => {
                const repertorioCount = [...studiedIds].filter(id => !id.startsWith("vest-")).length;
                const vestCount = [...studiedIds].filter(id => id.startsWith("vest-")).length;
                const progress = badge.id.includes("vest") ? vestCount : repertorioCount;
                const unlocked = progress >= badge.goal;
                return (
                  <Card key={badge.id} className={`bg-card border-border ${unlocked ? "border-accent/30" : ""}`}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`text-2xl ${unlocked ? "" : "grayscale opacity-40"}`}>{badge.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>{badge.label}</p>
                        <p className="text-xs text-muted-foreground">{badge.desc}</p>
                        <div className="h-1.5 rounded-full overflow-hidden bg-muted/60 mt-1.5">
                          <div
                            className="h-full rounded-full bg-accent transition-all"
                            style={{ width: `${Math.min((progress / badge.goal) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">{Math.min(progress, badge.goal)}/{badge.goal}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Enem;
