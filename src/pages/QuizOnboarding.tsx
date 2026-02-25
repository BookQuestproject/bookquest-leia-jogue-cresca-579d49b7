import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Lightbulb, BookOpen, Sparkles, User, Clock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

interface ReaderProfile {
  name: string;
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
}

// Page limits by experience level for progressive difficulty
const pageLimitsByLevel = {
  iniciante: { min: 0, max: 300 },       // Beginners: up to 300 pages
  intermediario: { min: 200, max: 600 }, // Intermediate: 200-600 pages
  avancado: { min: 400, max: 2000 },     // Advanced: 400+ pages
};

const genreBooks: Record<string, BookRecommendation[]> = {
  fantasia: [
    // Iniciante (shorter books)
    { title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", pages: 96, readingTime: "2h", level: "iniciante" },
    { title: "Coraline", author: "Neil Gaiman", pages: 176, readingTime: "3h", level: "iniciante" },
    { title: "O Hobbit", author: "J.R.R. Tolkien", pages: 288, readingTime: "6h", level: "iniciante" },
    // Intermediário
    { title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", pages: 264, readingTime: "6h", level: "intermediario" },
    { title: "Percy Jackson - O Ladrão de Raios", author: "Rick Riordan", pages: 400, readingTime: "8h", level: "intermediario" },
    { title: "As Crônicas de Nárnia", author: "C.S. Lewis", pages: 512, readingTime: "12h", level: "intermediario" },
    // Avançado (longer books)
    { title: "O Nome do Vento", author: "Patrick Rothfuss", pages: 656, readingTime: "15h", level: "avancado" },
    { title: "O Senhor dos Anéis - Trilogia", author: "J.R.R. Tolkien", pages: 1200, readingTime: "30h", level: "avancado" },
    { title: "Duna", author: "Frank Herbert", pages: 896, readingTime: "22h", level: "avancado" },
  ],
  misterio: [
    // Iniciante
    { title: "E Não Sobrou Nenhum", author: "Agatha Christie", pages: 272, readingTime: "5h", level: "iniciante" },
    { title: "Assassinato no Expresso do Oriente", author: "Agatha Christie", pages: 208, readingTime: "4h", level: "iniciante" },
    { title: "O Caso dos Dez Negrinhos", author: "Agatha Christie", pages: 192, readingTime: "4h", level: "iniciante" },
    // Intermediário
    { title: "A Garota no Trem", author: "Paula Hawkins", pages: 336, readingTime: "7h", level: "intermediario" },
    { title: "Gone Girl", author: "Gillian Flynn", pages: 432, readingTime: "9h", level: "intermediario" },
    { title: "O Código Da Vinci", author: "Dan Brown", pages: 480, readingTime: "10h", level: "intermediario" },
    // Avançado
    { title: "O Silêncio dos Inocentes", author: "Thomas Harris", pages: 352, readingTime: "8h", level: "avancado" },
    { title: "Sherlock Holmes - Obra Completa", author: "Arthur Conan Doyle", pages: 1408, readingTime: "35h", level: "avancado" },
    { title: "Crime e Castigo", author: "Fiódor Dostoiévski", pages: 672, readingTime: "16h", level: "avancado" },
  ],
  romance: [
    // Iniciante
    { title: "A Culpa é das Estrelas", author: "John Green", pages: 288, readingTime: "5h", level: "iniciante" },
    { title: "Querido John", author: "Nicholas Sparks", pages: 276, readingTime: "5h", level: "iniciante" },
    { title: "Simplesmente Acontece", author: "Cecelia Ahern", pages: 256, readingTime: "5h", level: "iniciante" },
    // Intermediário
    { title: "Como Eu Era Antes de Você", author: "Jojo Moyes", pages: 384, readingTime: "7h", level: "intermediario" },
    { title: "Me Chame Pelo Seu Nome", author: "André Aciman", pages: 248, readingTime: "5h", level: "intermediario" },
    { title: "Orgulho e Preconceito", author: "Jane Austen", pages: 432, readingTime: "9h", level: "intermediario" },
    // Avançado
    { title: "O Morro dos Ventos Uivantes", author: "Emily Brontë", pages: 400, readingTime: "9h", level: "avancado" },
    { title: "Anna Karenina", author: "Liev Tolstói", pages: 864, readingTime: "20h", level: "avancado" },
    { title: "Os Miseráveis", author: "Victor Hugo", pages: 1488, readingTime: "35h", level: "avancado" },
  ],
  "nao-ficcao": [
    // Iniciante
    { title: "O Poder do Hábito", author: "Charles Duhigg", pages: 288, readingTime: "6h", level: "iniciante" },
    { title: "Pai Rico, Pai Pobre", author: "Robert Kiyosaki", pages: 208, readingTime: "4h", level: "iniciante" },
    { title: "Mindset", author: "Carol S. Dweck", pages: 280, readingTime: "6h", level: "iniciante" },
    // Intermediário
    { title: "Sapiens", author: "Yuval Noah Harari", pages: 464, readingTime: "10h", level: "intermediario" },
    { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", pages: 512, readingTime: "12h", level: "intermediario" },
    { title: "O Gene Egoísta", author: "Richard Dawkins", pages: 496, readingTime: "11h", level: "intermediario" },
    // Avançado
    { title: "Uma Breve História do Tempo", author: "Stephen Hawking", pages: 256, readingTime: "7h", level: "avancado" },
    { title: "Cosmos", author: "Carl Sagan", pages: 432, readingTime: "10h", level: "avancado" },
    { title: "Homo Deus", author: "Yuval Noah Harari", pages: 528, readingTime: "13h", level: "avancado" },
  ],
  aventura: [
    // Iniciante
    { title: "As Aventuras de Pi", author: "Yann Martel", pages: 288, readingTime: "6h", level: "iniciante" },
    { title: "A Volta ao Mundo em 80 Dias", author: "Júlio Verne", pages: 224, readingTime: "5h", level: "iniciante" },
    { title: "Robinson Crusoé", author: "Daniel Defoe", pages: 272, readingTime: "6h", level: "iniciante" },
    // Intermediário
    { title: "Jogos Vorazes", author: "Suzanne Collins", pages: 400, readingTime: "8h", level: "intermediario" },
    { title: "Maze Runner", author: "James Dashner", pages: 400, readingTime: "8h", level: "intermediario" },
    { title: "Divergente", author: "Veronica Roth", pages: 496, readingTime: "10h", level: "intermediario" },
    // Avançado
    { title: "A Ilha do Tesouro", author: "Robert Louis Stevenson", pages: 304, readingTime: "7h", level: "avancado" },
    { title: "20.000 Léguas Submarinas", author: "Júlio Verne", pages: 448, readingTime: "10h", level: "avancado" },
    { title: "Moby Dick", author: "Herman Melville", pages: 752, readingTime: "18h", level: "avancado" },
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

type QuizStep = "profile" | "questions" | "curiosity" | "result";

const QuizOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateQuizCompleted } = useProfile();
  
  const [step, setStep] = useState<QuizStep>("profile");
  const [profile, setProfile] = useState<ReaderProfile>({
    name: "",
    level: "iniciante",
    timePerDay: 20,
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [curiosityIndex, setCuriosityIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [resultGenre, setResultGenre] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const handleProfileSubmit = () => {
    if (profile.name.trim()) {
      setStep("questions");
    }
  };

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

    const winningGenre = Object.entries(genreCount).reduce((a, b) => 
      a[1] > b[1] ? a : b
    )[0];

    setResultGenre(winningGenre);
    setStep("result");
  };

  const getRecommendedBooks = () => {
    const allBooks = genreBooks[resultGenre] || [];
    const pageLimit = pageLimitsByLevel[profile.level];
    
    return allBooks.filter(book => {
      // Filter by experience level
      if (book.level !== profile.level) {
        // Allow one level up/down for variety
        if (profile.level === "iniciante" && book.level === "avancado") return false;
        if (profile.level === "avancado" && book.level === "iniciante") return false;
      }
      
      // Apply page limits based on user level
      if (book.pages > pageLimit.max) return false;
      
      // Time filter - estimate based on daily reading time
      const readingHours = parseInt(book.readingTime);
      const estimatedDays = readingHours / (profile.timePerDay / 60);
      
      // For beginners with little time, prefer shorter books
      if (profile.level === "iniciante" && profile.timePerDay <= 15 && estimatedDays > 14) return false;
      
      return true;
    })
    // Sort by pages ascending for beginners, descending for advanced
    .sort((a, b) => {
      if (profile.level === "iniciante") return a.pages - b.pages;
      if (profile.level === "avancado") return b.pages - a.pages;
      return 0;
    })
    .slice(0, 5);
  };

  const handleFinishQuiz = async () => {
    setIsSaving(true);
    
    const literaryProfile = {
      name: profile.name,
      level: profile.level,
      timePerDay: profile.timePerDay,
      genre: resultGenre,
      genreInfo: genreInfo[resultGenre],
      completedAt: new Date().toISOString(),
    };

    await updateQuizCompleted(literaryProfile);
    navigate('/');
  };

  const handleSkipQuiz = async () => {
    setIsSaving(true);
    await updateQuizCompleted({ skipped: true, completedAt: new Date().toISOString() });
    navigate('/');
  };

  // Profile Step
  if (step === "profile") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Bem-vindo ao BookQuest!</h1>
            <p className="text-muted-foreground mb-4">
              Antes de começar, vamos descobrir seu perfil literário para personalizar sua experiência.
            </p>
            <button
              onClick={handleSkipQuiz}
              disabled={isSaving}
              className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
            >
              Pular quiz e entrar direto
            </button>
          </div>

          <div className="glass-card rounded-3xl p-8">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  <User className="w-4 h-4 inline mr-2" />
                  Como deseja ser chamado?
                </label>
                <Input
                  placeholder="Seu nome de exibição"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">
                  <Layers className="w-4 h-4 inline mr-2" />
                  Qual é o seu nível de leitura?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "iniciante", label: "Iniciante", desc: "Começando" },
                    { id: "intermediario", label: "Intermediário", desc: "Leio às vezes" },
                    { id: "avancado", label: "Avançado", desc: "Leio muito" },
                  ].map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setProfile({ ...profile, level: level.id as any })}
                      className={`p-3 rounded-xl text-center transition-all ${
                        profile.level === level.id
                          ? "bg-secondary text-secondary-foreground ring-2 ring-secondary"
                          : "bg-muted text-primary hover:bg-muted/80"
                      }`}
                    >
                      <p className="font-bold text-sm">{level.label}</p>
                      <p className="text-xs opacity-70">{level.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Quanto tempo disponível por dia para leitura?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 60].map((time) => (
                    <button
                      key={time}
                      onClick={() => setProfile({ ...profile, timePerDay: time })}
                      className={`p-3 rounded-xl text-center transition-all ${
                        profile.timePerDay === time
                          ? "bg-secondary text-secondary-foreground ring-2 ring-secondary"
                          : "bg-muted text-primary hover:bg-muted/80"
                      }`}
                    >
                      <p className="font-bold">{time}</p>
                      <p className="text-xs opacity-70">min</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                variant="hero" 
                size="lg" 
                className="w-full gap-2"
                onClick={handleProfileSubmit}
                disabled={!profile.name.trim()}
              >
                Continuar
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Curiosity Step
  if (step === "curiosity") {
    const curiosity = curiosities[curiosityIndex];
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full animate-fade-in">
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
              <Lightbulb className="w-8 h-8 text-warning" />
            </div>
            <h2 className="text-2xl font-bold mb-4">{curiosity.title}</h2>
            <p className="text-lg text-muted-foreground mb-8">{curiosity.text}</p>
            <Button variant="hero" size="lg" onClick={handleContinueCuriosity}>
              Continuar
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Result Step
  if (step === "result") {
    const genre = genreInfo[resultGenre];
    const recommendedBooks = getRecommendedBooks();
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 pulse-glow">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Parabéns, {profile.name}!</h1>
            <p className="text-muted-foreground">Descobrimos seu perfil literário!</p>
          </div>

          <div className="glass-card rounded-3xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">{genre?.title}</h2>
            <p className="text-lg text-muted-foreground mb-6">{genre?.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted rounded-xl">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Nível</p>
                <p className="font-bold capitalize">{profile.level}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Tempo/dia</p>
                <p className="font-bold">{profile.timePerDay} min</p>
              </div>
            </div>
            
            <div className="border-t border-border pt-6">
              <h3 className="font-bold mb-4">Livros recomendados para você:</h3>
              <div className="space-y-3">
                {recommendedBooks.map((book, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.author} • {book.readingTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button 
            variant="hero" 
            size="lg" 
            className="w-full gap-2"
            onClick={handleFinishQuiz}
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Começar minha jornada"}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Questions Step
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full animate-fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Pergunta {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={progress} max={100} />
        </div>

        <div className="glass-card rounded-3xl p-8">
          <h2 className="text-xl lg:text-2xl font-bold mb-6">{question.question}</h2>

          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  selectedOption === index
                    ? "bg-secondary text-secondary-foreground ring-2 ring-secondary"
                    : "bg-muted text-primary hover:bg-muted/80"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            {currentQuestion > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentQuestion(currentQuestion - 1);
                  setAnswers(answers.slice(0, -1));
                  setSelectedOption(null);
                }}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="hero"
              className="flex-1 gap-2"
              onClick={handleNext}
              disabled={selectedOption === null}
            >
              {currentQuestion === questions.length - 1 ? "Ver resultado" : "Próxima"}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizOnboarding;
