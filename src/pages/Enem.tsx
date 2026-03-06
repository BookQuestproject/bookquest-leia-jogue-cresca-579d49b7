import { useState, useMemo } from "react";
import { Crown, Lock, GraduationCap, BookOpen, Search, Sparkles, Trophy, Star, ChevronRight, Award, Lightbulb, Zap, BookMarked, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";

/* ═══════════════════════════════════════════════════
   DATA: Repertórios Socioculturais
   ═══════════════════════════════════════════════════ */

interface Repertorio {
  id: string;
  titulo: string;
  autor: string;
  temas: string[];
  resumo: string;
  exemploUso: string;
  resumoRapido: string;
}

const repertorios: Repertorio[] = [
  {
    id: "1984",
    titulo: "1984",
    autor: "George Orwell",
    temas: ["controle social", "tecnologia", "vigilância", "liberdade de expressão", "totalitarismo"],
    resumo: "Romance distópico que retrata uma sociedade totalitária onde o governo controla todos os aspectos da vida dos cidadãos através da vigilância constante e da manipulação da verdade.",
    exemploUso: "Na obra '1984', de George Orwell, a figura do Grande Irmão representa o controle estatal absoluto sobre a população. De forma análoga, na sociedade contemporânea, o uso indiscriminado de dados pessoais por grandes corporações tecnológicas configura uma forma moderna de vigilância que ameaça a privacidade individual.",
    resumoRapido: "Sociedade totalitária com vigilância constante. Use para temas sobre controle, tecnologia e liberdade.",
  },
  {
    id: "admiravel-mundo-novo",
    titulo: "Admirável Mundo Novo",
    autor: "Aldous Huxley",
    temas: ["tecnologia", "consumismo", "alienação", "controle social", "biotecnologia"],
    resumo: "Distopia onde a sociedade é controlada pelo prazer, consumo e engenharia genética. As pessoas são condicionadas desde o nascimento para aceitar seu papel social.",
    exemploUso: "Em 'Admirável Mundo Novo', Huxley antecipou a alienação causada pelo consumismo desenfreado. No Brasil atual, a dependência excessiva de redes sociais e conteúdos superficiais reflete essa mesma lógica de controle pelo entretenimento e pela satisfação imediata.",
    resumoRapido: "Controle pelo prazer e consumo. Use para temas sobre alienação, consumismo e manipulação social.",
  },
  {
    id: "a-hora-da-estrela",
    titulo: "A Hora da Estrela",
    autor: "Clarice Lispector",
    temas: ["desigualdade social", "migração", "invisibilidade social", "identidade", "gênero"],
    resumo: "Narra a história de Macabéa, uma jovem nordestina que vive em São Paulo enfrentando miséria, solidão e invisibilidade social, revelando as profundas desigualdades do Brasil.",
    exemploUso: "A personagem Macabéa, de Clarice Lispector em 'A Hora da Estrela', encarna a invisibilidade social dos migrantes nordestinos nas grandes cidades. Sua trajetória evidencia como a desigualdade estrutural no Brasil marginaliza populações inteiras, negando-lhes acesso a direitos básicos.",
    resumoRapido: "Nordestina invisível em SP. Use para desigualdade social, migração e invisibilidade.",
  },
  {
    id: "vidas-secas",
    titulo: "Vidas Secas",
    autor: "Graciliano Ramos",
    temas: ["seca", "desigualdade social", "migração", "pobreza", "educação"],
    resumo: "Retrata a vida miserável de uma família de retirantes no sertão nordestino, evidenciando a desumanização causada pela pobreza extrema e pela falta de oportunidades.",
    exemploUso: "Em 'Vidas Secas', Graciliano Ramos ilustra como a miséria e a falta de acesso à educação desumanizam os indivíduos. A dificuldade da família de Fabiano em se comunicar reflete a exclusão linguística e social que persiste nas regiões mais pobres do Brasil contemporâneo.",
    resumoRapido: "Família de retirantes no sertão. Use para pobreza, seca, educação e exclusão social.",
  },
  {
    id: "o-cortico",
    titulo: "O Cortiço",
    autor: "Aluísio Azevedo",
    temas: ["desigualdade social", "moradia", "exploração", "racismo", "urbanização"],
    resumo: "Retrata a vida em um cortiço no Rio de Janeiro do século XIX, expondo as desigualdades sociais, a exploração dos trabalhadores e as condições precárias de moradia.",
    exemploUso: "A obra 'O Cortiço', de Aluísio Azevedo, revela como as condições precárias de moradia perpetuam ciclos de pobreza e exclusão. Essa realidade permanece atual nas favelas e periferias brasileiras, onde milhões de pessoas vivem sem acesso a saneamento básico e infraestrutura adequada.",
    resumoRapido: "Vida precária em cortiço carioca. Use para moradia, desigualdade e urbanização.",
  },
  {
    id: "memorias-postumas",
    titulo: "Memórias Póstumas de Brás Cubas",
    autor: "Machado de Assis",
    temas: ["desigualdade social", "elite brasileira", "escravidão", "hipocrisia social", "ética"],
    resumo: "Narrado por um defunto autor, o romance expõe com ironia a hipocrisia da elite brasileira do século XIX, suas relações de poder e a naturalização da escravidão.",
    exemploUso: "Machado de Assis, em 'Memórias Póstumas de Brás Cubas', expõe a hipocrisia da elite brasileira que, enquanto pregava valores morais, se beneficiava da exploração de escravizados. Essa contradição persiste na sociedade atual, onde discursos de meritocracia frequentemente ignoram as desigualdades estruturais.",
    resumoRapido: "Ironia sobre a elite brasileira. Use para hipocrisia social, ética e desigualdade.",
  },
  {
    id: "quarto-de-despejo",
    titulo: "Quarto de Despejo",
    autor: "Carolina Maria de Jesus",
    temas: ["pobreza", "fome", "racismo", "gênero", "periferia", "invisibilidade social"],
    resumo: "Diário de uma catadora de papel na favela do Canindé, em São Paulo. Carolina relata a fome, a miséria e a discriminação racial enfrentadas diariamente.",
    exemploUso: "Carolina Maria de Jesus, em 'Quarto de Despejo', oferece um testemunho visceral da fome e da exclusão social nas periferias brasileiras. Seu relato denuncia a intersecção entre pobreza, racismo e gênero que permanece como um dos maiores desafios sociais do país.",
    resumoRapido: "Diário de catadora na favela. Use para fome, racismo, gênero e periferia.",
  },
  {
    id: "fahrenheit-451",
    titulo: "Fahrenheit 451",
    autor: "Ray Bradbury",
    temas: ["censura", "cultura", "educação", "tecnologia", "liberdade de expressão"],
    resumo: "Sociedade futurista onde livros são proibidos e queimados. A população é mantida alienada por entretenimento superficial e telas onipresentes.",
    exemploUso: "Em 'Fahrenheit 451', Bradbury alerta sobre os perigos da censura e da substituição do pensamento crítico pelo entretenimento superficial. Na era das fake news e da desinformação digital, essa reflexão se torna ainda mais urgente para a preservação da democracia.",
    resumoRapido: "Livros proibidos e queimados. Use para censura, cultura e pensamento crítico.",
  },
  {
    id: "capitaes-da-areia",
    titulo: "Capitães da Areia",
    autor: "Jorge Amado",
    temas: ["infância", "criminalidade", "desigualdade social", "abandono", "educação"],
    resumo: "Conta a história de um grupo de meninos de rua em Salvador que sobrevivem através de furtos e golpes, revelando o abandono social da infância pobre no Brasil.",
    exemploUso: "Jorge Amado, em 'Capitães da Areia', retrata crianças abandonadas pela sociedade e empurradas para a criminalidade. Essa realidade permanece atual no Brasil, onde milhares de crianças e adolescentes vivem em situação de rua, sem acesso a educação, saúde e proteção adequadas.",
    resumoRapido: "Meninos de rua em Salvador. Use para infância, criminalidade e abandono social.",
  },
  {
    id: "dom-casmurro",
    titulo: "Dom Casmurro",
    autor: "Machado de Assis",
    temas: ["ciúme", "machismo", "patriarcado", "narrativa", "relações de poder"],
    resumo: "Bentinho narra sua relação com Capitu sob a sombra do ciúme obsessivo. O romance questiona a confiabilidade do narrador masculino que julga e condena a mulher.",
    exemploUso: "Em 'Dom Casmurro', Machado de Assis constrói um narrador que, consumido pelo ciúme patriarcal, condena Capitu sem provas concretas. Essa dinâmica reflete como, historicamente, a voz masculina predomina nos julgamentos sobre o comportamento feminino, perpetuando desigualdades de gênero.",
    resumoRapido: "Ciúme e julgamento patriarcal. Use para machismo, gênero e relações de poder.",
  },
];

const todosOsTemas = Array.from(
  new Set(repertorios.flatMap((r) => r.temas))
).sort();

/* Exemplos de redações nota 1000 */
const redacoesModelo = [
  {
    tema: "Manipulação do comportamento do usuário pelo controle de dados na internet",
    ano: "ENEM 2018",
    repertorio: "1984 – George Orwell",
    trecho: "Assim como o Grande Irmão de Orwell controlava a informação para manipular a população, as grandes corporações tecnológicas utilizam algoritmos e coleta massiva de dados para influenciar comportamentos de consumo e opiniões políticas.",
  },
  {
    tema: "Democratização do acesso ao cinema no Brasil",
    ano: "ENEM 2019",
    repertorio: "Quarto de Despejo – Carolina Maria de Jesus",
    trecho: "Carolina Maria de Jesus, ao relatar a exclusão cultural vivida na favela, evidencia como o acesso à arte e ao entretenimento permanece um privilégio de poucos no Brasil, reforçando a necessidade de políticas de democratização cultural.",
  },
  {
    tema: "Invisibilidade e registro civil",
    ano: "ENEM 2021",
    repertorio: "Vidas Secas – Graciliano Ramos",
    trecho: "A família de Fabiano, em 'Vidas Secas', representa os milhões de brasileiros que existem à margem do Estado, sem documentos e sem direitos, evidenciando como a invisibilidade civil perpetua ciclos de exclusão social.",
  },
];

/* Conquistas de repertório */
const badges = [
  { nome: "Explorador Iniciante", descricao: "Estudar 3 repertórios", icon: BookOpen, meta: 3 },
  { nome: "Repertório Diverso", descricao: "Estudar 5 repertórios", icon: Star, meta: 5 },
  { nome: "Mestre Argumentador", descricao: "Estudar 8 repertórios", icon: Trophy, meta: 8 },
  { nome: "Enciclopédia Viva", descricao: "Estudar todos os repertórios", icon: Award, meta: repertorios.length },
];

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */

type Tab = "biblioteca" | "busca" | "rapido" | "redacoes" | "conquistas";

const Enem = () => {
  const { isPremium } = useProfile();
  const [activeTab, setActiveTab] = useState<Tab>("biblioteca");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTema, setSelectedTema] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [estudados, setEstudados] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("bookquest_repertorios_estudados");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const marcarEstudado = (id: string) => {
    setEstudados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("bookquest_repertorios_estudados", JSON.stringify([...next]));
      return next;
    });
  };

  const filteredRepertorios = useMemo(() => {
    let list = repertorios;
    if (selectedTema) {
      list = list.filter((r) => r.temas.includes(selectedTema));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.titulo.toLowerCase().includes(q) ||
          r.autor.toLowerCase().includes(q) ||
          r.temas.some((t) => t.includes(q))
      );
    }
    return list;
  }, [searchQuery, selectedTema]);

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "biblioteca", label: "Biblioteca", icon: BookOpen },
    { key: "busca", label: "Buscar Tema", icon: Search },
    { key: "rapido", label: "Rápido", icon: Zap },
    { key: "redacoes", label: "Redações", icon: BookMarked },
    { key: "conquistas", label: "Conquistas", icon: Trophy },
  ];

  return (
    <Layout isPremium={isPremium}>
      <div className="py-8" data-tutorial="enem-header">
        {/* Premium Banner for non-premium */}
        {!isPremium && (
          <div className="rounded-2xl p-4 mb-6 bg-accent/5 border border-accent/20 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-bold text-sm">Conteúdo Premium</p>
                  <p className="text-xs text-muted-foreground">Visualização prévia — assine para interagir</p>
                </div>
              </div>
              <Link to="/premium">
                <Button size="sm" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                  <Crown className="w-4 h-4" />
                  Assinar Premium
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-3">
            <Crown className="w-3.5 h-3.5" />
            Premium
          </div>
          <h1 className="text-3xl font-serif font-bold mb-2 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" />
            Repertório para Redação
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Desenvolva argumentos poderosos para ENEM e vestibulares usando obras literárias como repertório sociocultural. Pesquise por tema, estude exemplos e conquiste badges.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={!isPremium ? "opacity-70 pointer-events-none select-none" : ""}>
          {/* ═══ BIBLIOTECA DE REPERTÓRIOS ═══ */}
          {activeTab === "biblioteca" && (
            <div className="space-y-4 animate-fade-in">
              {/* Search + Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por título, autor ou tema..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                {selectedTema && (
                  <button
                    onClick={() => setSelectedTema(null)}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    {selectedTema}
                    <span className="ml-1">✕</span>
                  </button>
                )}
              </div>

              {/* Repertório Cards */}
              {filteredRepertorios.map((rep) => {
                const isExpanded = expandedId === rep.id;
                const isEstudado = estudados.has(rep.id);
                return (
                  <div
                    key={rep.id}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isEstudado
                        ? "bg-primary/5 border-primary/20"
                        : "bg-card border-border hover:border-primary/30"
                    }`}
                  >
                    {/* Header */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : rep.id)}
                      className="w-full flex items-start gap-4 p-5 text-left"
                    >
                      <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-serif font-bold text-base">{rep.titulo}</h3>
                          {isEstudado && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                              Estudado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{rep.autor}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {rep.temas.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTema(t);
                              }}
                              className="px-2 py-0.5 rounded-full bg-muted text-[11px] text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                            >
                              {t}
                            </span>
                          ))}
                          {rep.temas.length > 3 && (
                            <span className="px-2 py-0.5 text-[11px] text-muted-foreground">
                              +{rep.temas.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-muted-foreground flex-shrink-0 mt-2 transition-transform duration-300 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-5 pb-5 space-y-4 animate-fade-in">
                        <div className="h-px bg-border" />

                        {/* Resumo */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            Contexto da Obra
                          </h4>
                          <p className="text-sm leading-relaxed">{rep.resumo}</p>
                        </div>

                        {/* Exemplo de Uso */}
                        <div className="rounded-xl bg-accent/5 border border-accent/15 p-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-2 flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5" />
                            Exemplo de Uso em Redação
                          </h4>
                          <p className="text-sm leading-relaxed italic text-muted-foreground">
                            "{rep.exemploUso}"
                          </p>
                        </div>

                        {/* Action */}
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => marcarEstudado(rep.id)}
                            className={
                              isEstudado
                                ? "bg-muted text-muted-foreground hover:bg-muted/80"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                            }
                          >
                            {isEstudado ? "Desmarcar" : "Marcar como Estudado ✓"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredRepertorios.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Nenhum repertório encontrado para essa busca.</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ BUSCA POR TEMA ═══ */}
          {activeTab === "busca" && (
            <div className="animate-fade-in">
              <p className="text-sm text-muted-foreground mb-6">
                Selecione um tema para encontrar repertórios literários relacionados.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {todosOsTemas.map((tema) => {
                  const count = repertorios.filter((r) => r.temas.includes(tema)).length;
                  return (
                    <button
                      key={tema}
                      onClick={() => {
                        setSelectedTema(tema);
                        setActiveTab("biblioteca");
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-sm"
                    >
                      <span className="capitalize">{tema}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-bold">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ REPERTÓRIO RÁPIDO ═══ */}
          {activeTab === "rapido" && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-sm text-muted-foreground mb-4">
                Revisão rápida de repertórios — ideal para estudo de última hora.
              </p>
              {repertorios.map((rep) => (
                <div
                  key={rep.id}
                  className="flex gap-4 p-4 rounded-xl bg-card border border-border"
                >
                  <div className="w-1 rounded-full bg-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-serif font-bold text-sm mb-0.5">
                      {rep.titulo}{" "}
                      <span className="font-sans font-normal text-muted-foreground">
                        — {rep.autor}
                      </span>
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {rep.resumoRapido}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ REDAÇÕES MODELO ═══ */}
          {activeTab === "redacoes" && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-sm text-muted-foreground mb-4">
                Exemplos de como repertórios foram usados em redações de alto nível.
              </p>
              {redacoesModelo.map((red, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-card border border-border p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[11px] font-bold">
                      {red.ano}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                      {red.repertorio}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold mb-3">{red.tema}</h4>
                  <div className="rounded-xl bg-muted/50 p-4 border-l-4 border-primary">
                    <p className="text-sm italic leading-relaxed text-muted-foreground">
                      "{red.trecho}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ CONQUISTAS ═══ */}
          {activeTab === "conquistas" && (
            <div className="animate-fade-in">
              <p className="text-sm text-muted-foreground mb-6">
                Estude repertórios e desbloqueie conquistas! Você estudou{" "}
                <span className="font-bold text-primary">{estudados.size}</span> de{" "}
                <span className="font-bold">{repertorios.length}</span> repertórios.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {badges.map((badge) => {
                  const unlocked = estudados.size >= badge.meta;
                  return (
                    <div
                      key={badge.nome}
                      className={`rounded-2xl border p-5 flex items-center gap-4 transition-all ${
                        unlocked
                          ? "bg-accent/5 border-accent/20 shadow-lg shadow-accent/10"
                          : "bg-card border-border opacity-60"
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          unlocked
                            ? "bg-accent/10"
                            : "bg-muted"
                        }`}
                      >
                        <badge.icon
                          className={`w-7 h-7 ${
                            unlocked ? "text-accent" : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{badge.nome}</h4>
                        <p className="text-xs text-muted-foreground">{badge.descricao}</p>
                        <div className="mt-2 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (estudados.size / badge.meta) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Non-premium CTA overlay */}
        {!isPremium && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm mb-4">
              Assine o Premium para acessar todos os repertórios, exemplos de redação e conquistas.
            </p>
            <Link to="/premium">
              <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Crown className="w-4 h-4" />
                Desbloquear Repertórios
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Enem;
