import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Lightbulb, BookOpen, Sparkles, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";
import { Input } from "@/components/ui/input";
import logoCrown from "@/assets/logo-crown-transparent.png";

type QuizStep = "name" | "age" | "level" | "time" | "questions" | "curiosity" | "result";

interface ReaderProfile {
  name: string;
  ageRange: "10-13" | "14-17" | "18-25" | "26+";
  level: "iniciante" | "intermediario" | "avancado";
  timePerDay: number;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  genreMapping: string[];
}

const questions: Question[] = [
  {
    id: 1,
    question: "Como você prefere passar um dia de chuva?",
    options: [
      "Explorando mundos imaginários e criaturas fantásticas",
      "Resolvendo um mistério intrigante",
      "Vivendo uma história de amor envolvente",
      "Aprendendo algo novo sobre o mundo",
      "Mergulhando em ação e aventuras emocionantes",
    ],
    genreMapping: ["fantasia", "misterio", "romance", "nao-ficcao", "aventura"],
  },
  {
    id: 2,
    question: "O que mais te atrai em um filme?",
    options: [
      "Mundos mágicos com poderes especiais",
      "Reviravoltas surpreendentes no final",
      "Conexões emocionais entre personagens",
      "Histórias baseadas em fatos reais",
      "Cenas de ação e perseguições",
    ],
    genreMapping: ["fantasia", "misterio", "romance", "nao-ficcao", "aventura"],
  },
  {
    id: 3,
    question: "Se pudesse jantar com qualquer pessoa, escolheria:",
    options: [
      "Um mago ou feiticeiro poderoso",
      "Um detetive famoso",
      "Um poeta ou escritor romântico",
      "Um cientista ou inventor revolucionário",
      "Um explorador de terras desconhecidas",
    ],
    genreMapping: ["fantasia", "misterio", "romance", "nao-ficcao", "aventura"],
  },
  {
    id: 4,
    question: "Qual ambiente te deixa mais confortável?",
    options: [
      "Uma floresta encantada e misteriosa",
      "Uma mansão antiga cheia de segredos",
      "Um café aconchegante em Paris",
      "Uma biblioteca repleta de conhecimento",
      "Uma montanha a ser escalada",
    ],
    genreMapping: ["fantasia", "misterio", "romance", "nao-ficcao", "aventura"],
  },
  {
    id: 5,
    question: "O que você mais valoriza em uma amizade?",
    options: [
      "Lealdade inquebrantável em batalhas épicas",
      "Cumplicidade para desvendar segredos",
      "Apoio emocional e conexão profunda",
      "Troca de ideias e crescimento mútuo",
      "Coragem para enfrentar desafios juntos",
    ],
    genreMapping: ["fantasia", "misterio", "romance", "nao-ficcao", "aventura"],
  },
  {
    id: 6,
    question: "Qual superpoder você escolheria?",
    options: [
      "Controlar elementos da natureza",
      "Ler mentes para descobrir verdades",
      "Sentir as emoções de outras pessoas",
      "Ter conhecimento ilimitado",
      "Super força e velocidade",
    ],
    genreMapping: ["fantasia", "misterio", "romance", "nao-ficcao", "aventura"],
  },
  {
    id: 7,
    question: "Como você lida com um problema difícil?",
    options: [
      "Busco soluções criativas e mágicas",
      "Analiso cada detalhe até encontrar a resposta",
      "Sigo meu coração e intuição",
      "Pesquiso e estudo o assunto profundamente",
      "Enfrento de frente com coragem",
    ],
    genreMapping: ["fantasia", "misterio", "romance", "nao-ficcao", "aventura"],
  },
];

const curiosities = [
  {
    title: "Você sabia?",
    text: "Pessoas que leem regularmente têm 2,5 vezes mais vocabulário ativo do que pessoas que não leem. Isso melhora a comunicação em todas as áreas da vida!",
  },
  {
    title: "Curiosidade",
    text: "Ler por apenas 6 minutos reduz o estresse em 68%, mais do que ouvir música ou tomar chá. A leitura é um dos relaxantes mais poderosos!",
  },
];

interface BookRecommendation {
  title: string;
  author: string;
  pages: number;
  readingTime: string;
  level: "iniciante" | "intermediario" | "avancado";
  minAge: number;
}

const genreBooks: Record<string, BookRecommendation[]> = {
  fantasia: [
    { title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", pages: 96, readingTime: "2h", level: "iniciante", minAge: 10 },
    { title: "Percy Jackson - O Ladrão de Raios", author: "Rick Riordan", pages: 400, readingTime: "8h", level: "iniciante", minAge: 10 },
    { title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", pages: 264, readingTime: "6h", level: "intermediario", minAge: 10 },
    { title: "As Crônicas de Nárnia", author: "C.S. Lewis", pages: 768, readingTime: "16h", level: "intermediario", minAge: 10 },
    { title: "O Senhor dos Anéis", author: "J.R.R. Tolkien", pages: 1200, readingTime: "30h", level: "avancado", minAge: 14 },
    { title: "O Nome do Vento", author: "Patrick Rothfuss", pages: 656, readingTime: "15h", level: "avancado", minAge: 16 },
  ],
  misterio: [
    { title: "A Garota no Trem", author: "Paula Hawkins", pages: 336, readingTime: "7h", level: "iniciante", minAge: 18 },
    { title: "E Não Sobrou Nenhum", author: "Agatha Christie", pages: 272, readingTime: "5h", level: "iniciante", minAge: 14 },
    { title: "Gone Girl", author: "Gillian Flynn", pages: 432, readingTime: "9h", level: "intermediario", minAge: 18 },
    { title: "O Código Da Vinci", author: "Dan Brown", pages: 480, readingTime: "10h", level: "intermediario", minAge: 16 },
    { title: "Sherlock Holmes - Obra Completa", author: "Arthur Conan Doyle", pages: 1408, readingTime: "35h", level: "avancado", minAge: 14 },
    { title: "O Silêncio dos Inocentes", author: "Thomas Harris", pages: 352, readingTime: "8h", level: "avancado", minAge: 18 },
  ],
  romance: [
    { title: "A Culpa é das Estrelas", author: "John Green", pages: 288, readingTime: "5h", level: "iniciante", minAge: 14 },
    { title: "Como Eu Era Antes de Você", author: "Jojo Moyes", pages: 384, readingTime: "7h", level: "iniciante", minAge: 16 },
    { title: "Orgulho e Preconceito", author: "Jane Austen", pages: 432, readingTime: "9h", level: "intermediario", minAge: 14 },
    { title: "Me Chame Pelo Seu Nome", author: "André Aciman", pages: 248, readingTime: "5h", level: "intermediario", minAge: 18 },
    { title: "Anna Karenina", author: "Liev Tolstói", pages: 864, readingTime: "20h", level: "avancado", minAge: 18 },
    { title: "O Morro dos Ventos Uivantes", author: "Emily Brontë", pages: 400, readingTime: "9h", level: "avancado", minAge: 16 },
  ],
  "nao-ficcao": [
    { title: "O Poder do Hábito", author: "Charles Duhigg", pages: 408, readingTime: "8h", level: "iniciante", minAge: 14 },
    { title: "Mindset", author: "Carol S. Dweck", pages: 320, readingTime: "6h", level: "iniciante", minAge: 14 },
    { title: "Sapiens", author: "Yuval Noah Harari", pages: 464, readingTime: "10h", level: "intermediario", minAge: 16 },
    { title: "Rápido e Devagar", author: "Daniel Kahneman", pages: 608, readingTime: "14h", level: "intermediario", minAge: 18 },
    { title: "Uma Breve História do Tempo", author: "Stephen Hawking", pages: 256, readingTime: "7h", level: "avancado", minAge: 16 },
    { title: "O Gene Egoísta", author: "Richard Dawkins", pages: 544, readingTime: "12h", level: "avancado", minAge: 18 },
  ],
  aventura: [
    { title: "As Aventuras de Pi", author: "Yann Martel", pages: 320, readingTime: "6h", level: "iniciante", minAge: 12 },
    { title: "Jogos Vorazes", author: "Suzanne Collins", pages: 400, readingTime: "8h", level: "iniciante", minAge: 14 },
    { title: "Maze Runner", author: "James Dashner", pages: 400, readingTime: "8h", level: "intermediario", minAge: 14 },
    { title: "Divergente", author: "Veronica Roth", pages: 496, readingTime: "10h", level: "intermediario", minAge: 14 },
    { title: "A Ilha do Tesouro", author: "Robert Louis Stevenson", pages: 304, readingTime: "7h", level: "avancado", minAge: 12 },
    { title: "20.000 Léguas Submarinas", author: "Júlio Verne", pages: 448, readingTime: "10h", level: "avancado", minAge: 14 },
  ],
};

const genreInfo: Record<string, { title: string; description: string }> = {
  fantasia: {
    title: "Fantasia",
    description: "Você é um sonhador nato! Adora explorar mundos mágicos, criaturas fantásticas e histórias épicas. Sua imaginação não tem limites.",
  },
  misterio: {
    title: "Mistério e Suspense",
    description: "Você adora um bom enigma! Tem mente analítica e fica vidrado até descobrir todas as reviravoltas. Nada escapa do seu olhar atento.",
  },
  romance: {
    title: "Romance",
    description: "Você é movido por emoções e conexões profundas! Histórias de amor te cativam e você acredita no poder dos sentimentos.",
  },
  "nao-ficcao": {
    title: "Não-Ficção",
    description: "Você é curioso e sedento por conhecimento! Prefere aprender sobre o mundo real e expandir seus horizontes constantemente.",
  },
  aventura: {
    title: "Aventura e Ação",
    description: "Adrenalina é seu combustível! Você ama histórias cheias de ação, desafios e jornadas épicas que tiram o fôlego.",
  },
};

const TOTAL_STEPS = 4 + questions.length;

const ageRangeToMaxAge = (range: string): number => {
  switch (range) {
    case "10-13": return 13;
    case "14-17": return 17;
    case "18-25": return 25;
    case "26+": return 99;
    default: return 99;
  }
};

const Quiz = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<QuizStep>("name");
  const [profile, setProfile] = useState<ReaderProfile>({
    name: "",
    ageRange: "14-17",
    level: "iniciante",
    timePerDay: 20,
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [curiosityIndex, setCuriosityIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [resultGenre, setResultGenre] = useState<string>("");

  const getCurrentStepNumber = (): number => {
    switch (step) {
      case "name": return 1;
      case "age": return 2;
      case "level": return 3;
      case "time": return 4;
      case "questions": return 5 + currentQuestion;
      case "curiosity": return 5 + currentQuestion;
      case "result": return TOTAL_STEPS;
      default: return 1;
    }
  };

  const progress = (getCurrentStepNumber() / TOTAL_STEPS) * 100;

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestion === 2 || currentQuestion === 5) {
      setStep("curiosity");
      if (currentQuestion === 5) setCuriosityIndex(1);
      return;
    }

    if (currentQuestion === questions.length - 1) {
      calculateResult(newAnswers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleContinueCuriosity = () => {
    setStep("questions");
    if (currentQuestion === questions.length - 1) {
      calculateResult(answers);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const calculateResult = (finalAnswers: number[]) => {
    const genreCount: Record<string, number> = {};
    finalAnswers.forEach((answerIndex, questionIndex) => {
      const genre = questions[questionIndex].genreMapping[answerIndex];
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });
    const winningGenre = Object.entries(genreCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    setResultGenre(winningGenre);
    setStep("result");

    // Save recommended book titles to localStorage for the Biblioteca tag
    const allBooksForGenre = genreBooks[winningGenre] || [];
    const userMaxAge = ageRangeToMaxAge(profile.ageRange);
    const recommended = allBooksForGenre.filter(book => {
      if (book.minAge > userMaxAge) return false;
      if (profile.level === "iniciante" && book.level !== "iniciante") return false;
      if (profile.level === "intermediario" && book.level === "avancado") return false;
      return true;
    }).slice(0, 5);
    const titles = recommended.map(b => b.title);
    localStorage.setItem("bookquest-quiz-recommendations", JSON.stringify(titles));
  };

  const getRecommendedBooks = () => {
    const allBooks = genreBooks[resultGenre] || [];
    const userMaxAge = ageRangeToMaxAge(profile.ageRange);
    
    return allBooks.filter(book => {
      if (book.minAge > userMaxAge) return false;
      if (profile.level === "iniciante" && book.level !== "iniciante") return false;
      if (profile.level === "intermediario" && book.level === "avancado") return false;
      const estimatedDays = parseInt(book.readingTime) / (profile.timePerDay / 60);
      if (profile.timePerDay <= 15 && estimatedDays > 30) return false;
      return true;
    }).slice(0, 5);
  };

  // Step: Name
  const renderNameStep = () => (
    <div className="max-w-md w-full">
      <div className="text-center mb-8">
        <img src={logoCrown} alt="BookQuest" className="w-20 h-20 object-contain mx-auto mb-6 drop-shadow-lg" />
        <h1 className="text-3xl font-serif font-bold mb-2">Quiz Literário</h1>
        <p className="text-white/60">Primeiro, como você quer ser chamado?</p>
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-8">
        <Input
          placeholder="Digite seu nome..."
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="text-lg bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/40 focus-visible:ring-accent mb-6"
        />
        <Button
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2"
          onClick={() => profile.name.trim() && setStep("age")}
          disabled={!profile.name.trim()}
        >
          Próxima <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="mt-6">
        <ProgressBar value={progress} max={100} />
        <p className="text-xs text-white/40 text-center mt-2">Pergunta 1 de {TOTAL_STEPS}</p>
      </div>
    </div>
  );

  const renderAgeStep = () => {
    const ageOptions = [
      { id: "10-13", label: "10 a 13 anos", desc: "Pré-adolescente" },
      { id: "14-17", label: "14 a 17 anos", desc: "Adolescente" },
      { id: "18-25", label: "18 a 25 anos", desc: "Jovem adulto" },
      { id: "26+", label: "26 anos ou mais", desc: "Adulto" },
    ];
    return (
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold mb-2">Qual a sua faixa etária, {profile.name}?</h1>
          <p className="text-white/60">Isso nos ajuda a recomendar livros adequados.</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-6">
          <div className="space-y-3 mb-6">
            {ageOptions.map((age) => (
              <button key={age.id} onClick={() => setProfile({ ...profile, ageRange: age.id as any })}
                className={`w-full p-4 rounded-xl text-left transition-all ${profile.ageRange === age.id ? "bg-accent text-accent-foreground ring-2 ring-accent" : "bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]"}`}>
                <p className="font-bold">{age.label}</p>
                <p className={`text-xs ${profile.ageRange === age.id ? "text-accent-foreground/70" : "text-white/50"}`}>{age.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/[0.08]" onClick={() => setStep("name")}><ArrowLeft className="w-4 h-4" /></Button>
            <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2" onClick={() => setStep("level")}>Próxima <ArrowRight className="w-4 h-4" /></Button>
          </div>
        </div>
        <div className="mt-6">
          <ProgressBar value={progress} max={100} />
          <p className="text-xs text-white/40 text-center mt-2">Pergunta 2 de {TOTAL_STEPS}</p>
        </div>
      </div>
    );
  };

  const renderLevelStep = () => {
    const levels = [
      { id: "iniciante", label: "Iniciante", desc: "Estou começando a ler ou leio pouco" },
      { id: "intermediario", label: "Intermediário", desc: "Leio de vez em quando" },
      { id: "avancado", label: "Avançado", desc: "Leio bastante e com frequência" },
    ];
    return (
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold mb-2">Qual é o seu nível de leitura?</h1>
          <p className="text-white/60">Vamos recomendar livros do tamanho ideal.</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-6">
          <div className="space-y-3 mb-6">
            {levels.map((level) => (
              <button key={level.id} onClick={() => setProfile({ ...profile, level: level.id as any })}
                className={`w-full p-4 rounded-xl text-left transition-all ${profile.level === level.id ? "bg-accent text-accent-foreground ring-2 ring-accent" : "bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]"}`}>
                <p className="font-bold">{level.label}</p>
                <p className={`text-xs ${profile.level === level.id ? "text-accent-foreground/70" : "text-white/50"}`}>{level.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/[0.08]" onClick={() => setStep("age")}><ArrowLeft className="w-4 h-4" /></Button>
            <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2" onClick={() => setStep("time")}>Próxima <ArrowRight className="w-4 h-4" /></Button>
          </div>
        </div>
        <div className="mt-6">
          <ProgressBar value={progress} max={100} />
          <p className="text-xs text-white/40 text-center mt-2">Pergunta 3 de {TOTAL_STEPS}</p>
        </div>
      </div>
    );
  };

  const renderTimeStep = () => {
    const timeOptions = [
      { value: 10, label: "10 min", desc: "Um pouquinho" },
      { value: 20, label: "20 min", desc: "Leitura leve" },
      { value: 30, label: "30 min", desc: "Bom ritmo" },
      { value: 60, label: "1 hora+", desc: "Dedicado" },
    ];
    return (
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold mb-2">Quanto tempo por dia para leitura?</h1>
          <p className="text-white/60">Qualquer tempo é válido!</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {timeOptions.map((time) => (
              <button key={time.value} onClick={() => setProfile({ ...profile, timePerDay: time.value })}
                className={`p-4 rounded-xl text-center transition-all ${profile.timePerDay === time.value ? "bg-accent text-accent-foreground ring-2 ring-accent" : "bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]"}`}>
                <p className="font-bold text-lg">{time.label}</p>
                <p className={`text-xs ${profile.timePerDay === time.value ? "text-accent-foreground/70" : "text-white/50"}`}>{time.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/[0.08]" onClick={() => setStep("level")}><ArrowLeft className="w-4 h-4" /></Button>
            <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2" onClick={() => setStep("questions")}>Começar Quiz <ArrowRight className="w-4 h-4" /></Button>
          </div>
        </div>
        <div className="mt-6">
          <ProgressBar value={progress} max={100} />
          <p className="text-xs text-white/40 text-center mt-2">Pergunta 4 de {TOTAL_STEPS}</p>
        </div>
      </div>
    );
  };

  const renderCuriosityStep = () => {
    const curiosity = curiosities[curiosityIndex];
    return (
      <div className="max-w-2xl w-full">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-4">{curiosity.title}</h2>
          <p className="text-lg text-white/60 mb-8">{curiosity.text}</p>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2" size="lg" onClick={handleContinueCuriosity}>
            Continuar <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  };

  const showGuidedReading = profile.level === "iniciante" || profile.level === "intermediario";

  const getReadingPlan = (book: BookRecommendation) => {
    const pagesPerMinute = 0.5;
    const dailyPages = Math.max(1, Math.round(profile.timePerDay * pagesPerMinute));
    const totalDays = Math.ceil(book.pages / dailyPages);
    return { dailyPages, totalDays };
  };

  const renderResultStep = () => {
    const genre = genreInfo[resultGenre];
    const recommendedBooks = getRecommendedBooks();
    return (
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6 pulse-glow">
            <Sparkles className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-2">Olá, {profile.name}!</h1>
          <p className="text-white/60">Baseado nas suas respostas, descobrimos seu perfil!</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-accent mb-4">{genre?.title}</h2>
          <p className="text-lg text-white/60 mb-6">{genre?.description}</p>
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white/[0.06] rounded-xl">
            <div className="text-center"><p className="text-sm text-white/50">Idade</p><p className="font-bold">{profile.ageRange}</p></div>
            <div className="text-center"><p className="text-sm text-white/50">Nível</p><p className="font-bold capitalize">{profile.level}</p></div>
            <div className="text-center"><p className="text-sm text-white/50">Tempo/dia</p><p className="font-bold">{profile.timePerDay} min</p></div>
          </div>
          <div className="border-t border-white/[0.08] pt-6">
            <h3 className="font-bold mb-4">📚 Livros recomendados para você:</h3>
            <div className="grid gap-3">
              {recommendedBooks.map((book, index) => {
                const plan = showGuidedReading ? getReadingPlan(book) : null;
                return (
                  <div key={index} className="rounded-xl bg-white/[0.06] overflow-hidden">
                    <div className="flex items-center gap-3 p-3">
                      <BookOpen className="w-5 h-5 text-accent flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{book.title}</p>
                        <p className="text-xs text-white/50">{book.author} • {book.pages} páginas</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent">~{book.readingTime}</span>
                    </div>
                    {plan && (
                      <div className="px-3 pb-3">
                        <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-accent" />
                            <p className="text-xs font-bold text-accent uppercase tracking-wider">Leitura Guiada</p>
                          </div>
                          <p className="text-sm text-white/90">
                            📖 Comece lendo da <span className="font-bold text-accent">página 1</span> até a <span className="font-bold text-accent">página {plan.dailyPages}</span>
                          </p>
                          <div className="flex items-center gap-3 text-xs text-white/50">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              ~{profile.timePerDay} min/dia
                            </span>
                            <span>•</span>
                            <span>~{plan.dailyPages} pág/dia</span>
                            <span>•</span>
                            <span>~{plan.totalDays} dias no total</span>
                          </div>
                          <p className="text-[11px] text-white/40 italic">
                            Esse é o mínimo sugerido para o dia — fique à vontade para ler mais! 🚀
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {recommendedBooks.length === 0 && (
                <p className="text-white/50 text-sm text-center py-4">Nenhum livro encontrado. Explore a biblioteca!</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold" size="lg" onClick={() => navigate("/perfil")}>Ver meu perfil</Button>
          <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/[0.08]" size="lg" onClick={() => { setStep("name"); setCurrentQuestion(0); setAnswers([]); setCuriosityIndex(0); setProfile({ name: "", ageRange: "14-17", level: "iniciante", timePerDay: 20 }); }}>Refazer quiz</Button>
        </div>
      </div>
    );
  };

  const renderQuestionsStep = () => {
    const question = questions[currentQuestion];
    return (
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/50">Pergunta {getCurrentStepNumber()} de {TOTAL_STEPS}</span>
            <span className="text-sm font-medium text-accent">{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={progress} max={100} />
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-8">
          <h2 className="text-xl lg:text-2xl font-serif font-bold mb-6">{question.question}</h2>
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <button key={index} onClick={() => handleOptionSelect(index)}
                className={`w-full p-4 rounded-xl text-left transition-all ${selectedOption === index ? "bg-accent text-accent-foreground ring-2 ring-accent" : "bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]"}`}>
                {option}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            {currentQuestion > 0 && (
              <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/[0.08]" onClick={() => { setCurrentQuestion(currentQuestion - 1); setAnswers(answers.slice(0, -1)); setSelectedOption(null); }}><ArrowLeft className="w-4 h-4" /></Button>
            )}
            {currentQuestion === 0 && (
              <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/[0.08]" onClick={() => setStep("time")}><ArrowLeft className="w-4 h-4" /></Button>
            )}
            <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2" onClick={handleNext} disabled={selectedOption === null}>
              {currentQuestion === questions.length - 1 ? "Ver resultado" : "Próxima"} <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case "name": return renderNameStep();
      case "age": return renderAgeStep();
      case "level": return renderLevelStep();
      case "time": return renderTimeStep();
      case "curiosity": return renderCuriosityStep();
      case "result": return renderResultStep();
      case "questions": return renderQuestionsStep();
    }
  };

  return (
    <div className="min-h-screen bg-primary text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.06] via-transparent to-accent/[0.03]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-accent/[0.04] blur-[120px]" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {renderStep()}
      </div>
    </div>
  );
};

export default Quiz;
