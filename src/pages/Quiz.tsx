import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Lightbulb, BookOpen, Sparkles, User, Clock, Layers } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";
import { Input } from "@/components/ui/input";

type QuizStep = "login" | "profile" | "questions" | "curiosity" | "result";

interface ReaderProfile {
  name: string;
  level: "iniciante" | "intermediario" | "avancado";
  timePerDay: number; // in minutes
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

const genreBooks: Record<string, BookRecommendation[]> = {
  fantasia: [
    { title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", pages: 96, readingTime: "2h", level: "iniciante" },
    { title: "Percy Jackson - O Ladrão de Raios", author: "Rick Riordan", pages: 400, readingTime: "8h", level: "iniciante" },
    { title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", pages: 264, readingTime: "6h", level: "intermediario" },
    { title: "As Crônicas de Nárnia", author: "C.S. Lewis", pages: 768, readingTime: "16h", level: "intermediario" },
    { title: "O Senhor dos Anéis", author: "J.R.R. Tolkien", pages: 1200, readingTime: "30h", level: "avancado" },
    { title: "O Nome do Vento", author: "Patrick Rothfuss", pages: 656, readingTime: "15h", level: "avancado" },
  ],
  misterio: [
    { title: "A Garota no Trem", author: "Paula Hawkins", pages: 336, readingTime: "7h", level: "iniciante" },
    { title: "E Não Sobrou Nenhum", author: "Agatha Christie", pages: 272, readingTime: "5h", level: "iniciante" },
    { title: "Gone Girl", author: "Gillian Flynn", pages: 432, readingTime: "9h", level: "intermediario" },
    { title: "O Código Da Vinci", author: "Dan Brown", pages: 480, readingTime: "10h", level: "intermediario" },
    { title: "Sherlock Holmes - Obra Completa", author: "Arthur Conan Doyle", pages: 1408, readingTime: "35h", level: "avancado" },
    { title: "O Silêncio dos Inocentes", author: "Thomas Harris", pages: 352, readingTime: "8h", level: "avancado" },
  ],
  romance: [
    { title: "A Culpa é das Estrelas", author: "John Green", pages: 288, readingTime: "5h", level: "iniciante" },
    { title: "Como Eu Era Antes de Você", author: "Jojo Moyes", pages: 384, readingTime: "7h", level: "iniciante" },
    { title: "Orgulho e Preconceito", author: "Jane Austen", pages: 432, readingTime: "9h", level: "intermediario" },
    { title: "Me Chame Pelo Seu Nome", author: "André Aciman", pages: 248, readingTime: "5h", level: "intermediario" },
    { title: "Anna Karenina", author: "Liev Tolstói", pages: 864, readingTime: "20h", level: "avancado" },
    { title: "O Morro dos Ventos Uivantes", author: "Emily Brontë", pages: 400, readingTime: "9h", level: "avancado" },
  ],
  "nao-ficcao": [
    { title: "O Poder do Hábito", author: "Charles Duhigg", pages: 408, readingTime: "8h", level: "iniciante" },
    { title: "Mindset", author: "Carol S. Dweck", pages: 320, readingTime: "6h", level: "iniciante" },
    { title: "Sapiens", author: "Yuval Noah Harari", pages: 464, readingTime: "10h", level: "intermediario" },
    { title: "Rápido e Devagar", author: "Daniel Kahneman", pages: 608, readingTime: "14h", level: "intermediario" },
    { title: "Uma Breve História do Tempo", author: "Stephen Hawking", pages: 256, readingTime: "7h", level: "avancado" },
    { title: "O Gene Egoísta", author: "Richard Dawkins", pages: 544, readingTime: "12h", level: "avancado" },
  ],
  aventura: [
    { title: "As Aventuras de Pi", author: "Yann Martel", pages: 320, readingTime: "6h", level: "iniciante" },
    { title: "Jogos Vorazes", author: "Suzanne Collins", pages: 400, readingTime: "8h", level: "iniciante" },
    { title: "Maze Runner", author: "James Dashner", pages: 400, readingTime: "8h", level: "intermediario" },
    { title: "Divergente", author: "Veronica Roth", pages: 496, readingTime: "10h", level: "intermediario" },
    { title: "A Ilha do Tesouro", author: "Robert Louis Stevenson", pages: 304, readingTime: "7h", level: "avancado" },
    { title: "20.000 Léguas Submarinas", author: "Júlio Verne", pages: 448, readingTime: "10h", level: "avancado" },
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

const Quiz = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<QuizStep>("login");
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

    // Show curiosity after question 2 and 5
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
    
    // Filter by level and time available
    return allBooks.filter(book => {
      // Level filter
      if (profile.level === "iniciante" && book.level !== "iniciante") return false;
      if (profile.level === "intermediario" && book.level === "avancado") return false;
      
      // Time filter - estimate based on daily reading time
      const estimatedDays = parseInt(book.readingTime) / (profile.timePerDay / 60);
      if (profile.timePerDay <= 15 && estimatedDays > 30) return false;
      
      return true;
    }).slice(0, 5);
  };

  // Login Step
  if (step === "login") {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Quiz Literário</h1>
            <p className="text-muted-foreground">
              Descubra seu gênero literário e receba recomendações personalizadas!
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  <User className="w-4 h-4 inline mr-2" />
                  Seu nome de exibição
                </label>
                <Input
                  placeholder="Como quer ser chamado?"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">
                  <Layers className="w-4 h-4 inline mr-2" />
                  Seu nível de leitura
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
                          ? "bg-accent text-accent-foreground ring-2 ring-accent"
                          : "bg-muted text-foreground hover:bg-muted/80"
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
                  Tempo disponível por dia
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 60].map((time) => (
                    <button
                      key={time}
                      onClick={() => setProfile({ ...profile, timePerDay: time })}
                      className={`p-3 rounded-xl text-center transition-all ${
                        profile.timePerDay === time
                          ? "bg-accent text-accent-foreground ring-2 ring-accent"
                          : "bg-muted text-foreground hover:bg-muted/80"
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
                Iniciar Quiz
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Curiosity Step
  if (step === "curiosity") {
    const curiosity = curiosities[curiosityIndex];
    
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-8 animate-fade-in">
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
      </Layout>
    );
  }

  // Result Step
  if (step === "result") {
    const genre = genreInfo[resultGenre];
    const recommendedBooks = getRecommendedBooks();
    
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 pulse-glow">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Olá, {profile.name}!</h1>
            <p className="text-muted-foreground">Baseado nas suas respostas, descobrimos seu perfil!</p>
          </div>

          <div className="glass-card rounded-3xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">{genre?.title}</h2>
            <p className="text-lg text-muted-foreground mb-6">{genre?.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-secondary rounded-xl">
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
              <h3 className="font-bold mb-4">📚 Livros recomendados para você:</h3>
              <div className="grid gap-3">
                {recommendedBooks.map((book, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                    <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.author} • {book.pages} páginas</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      ~{book.readingTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/perfil")}>
              Ver meu perfil
            </Button>
            <Button variant="outline" size="lg" onClick={() => {
              setStep("login");
              setCurrentQuestion(0);
              setAnswers([]);
              setCuriosityIndex(0);
              setProfile({ name: "", level: "iniciante", timePerDay: 20 });
            }}>
              Refazer quiz
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Questions Step
  const question = questions[currentQuestion];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 section-bg-quiz">
        {/* Header */}
        <div className="mb-8 animate-fade-in" data-tutorial="quiz-header">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              Pergunta {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-sm font-bold text-primary">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <ProgressBar value={currentQuestion + 1} max={questions.length} />
        </div>

        {/* Question */}
        <div className="animate-fade-in" key={currentQuestion}>
          <h2 className="text-2xl font-bold mb-8 text-center">{question.question}</h2>
          
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`quiz-option w-full text-left ${
                  selectedOption === index ? "selected" : ""
                }`}
              >
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                if (currentQuestion > 0) {
                  setCurrentQuestion(currentQuestion - 1);
                  setAnswers(answers.slice(0, -1));
                }
              }}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </Button>
            
            <Button
              variant="hero"
              onClick={handleNext}
              disabled={selectedOption === null}
            >
              {currentQuestion === questions.length - 1 ? "Ver resultado" : "Próxima"}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Quiz;
