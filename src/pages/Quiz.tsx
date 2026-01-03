import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Lightbulb, BookOpen, Sparkles } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";

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

const genreResults: Record<string, { title: string; description: string; books: string[] }> = {
  fantasia: {
    title: "Fantasia",
    description: "Você é um sonhador nato! Adora explorar mundos mágicos, criaturas fantásticas e histórias épicas. Sua imaginação não tem limites.",
    books: ["Harry Potter", "O Senhor dos Anéis", "As Crônicas de Nárnia", "Percy Jackson", "Eragon"],
  },
  misterio: {
    title: "Mistério e Suspense",
    description: "Você adora um bom enigma! Tem mente analítica e fica vidrado até descobrir todas as reviravoltas. Nada escapa do seu olhar atento.",
    books: ["E Não Sobrou Nenhum", "O Código Da Vinci", "Sherlock Holmes", "Gone Girl", "A Garota no Trem"],
  },
  romance: {
    title: "Romance",
    description: "Você é movido por emoções e conexões profundas! Histórias de amor te cativam e você acredita no poder dos sentimentos.",
    books: ["Orgulho e Preconceito", "A Culpa é das Estrelas", "Me Chame Pelo Seu Nome", "Depois", "Como Eu Era Antes de Você"],
  },
  "nao-ficcao": {
    title: "Não-Ficção",
    description: "Você é curioso e sedento por conhecimento! Prefere aprender sobre o mundo real e expandir seus horizontes constantemente.",
    books: ["Sapiens", "O Poder do Hábito", "Pai Rico, Pai Pobre", "Rápido e Devagar", "Mindset"],
  },
  aventura: {
    title: "Aventura e Ação",
    description: "Adrenalina é seu combustível! Você ama histórias cheias de ação, desafios e jornadas épicas que tiram o fôlego.",
    books: ["Jogos Vorazes", "O Ladrão de Raios", "Divergente", "Maze Runner", "As Aventuras de Pi"],
  },
};

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showCuriosity, setShowCuriosity] = useState(false);
  const [curiosityIndex, setCuriosityIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

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
      setShowCuriosity(true);
      if (currentQuestion === 5) setCuriosityIndex(1);
      return;
    }

    if (currentQuestion === questions.length - 1) {
      setShowResult(true);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleContinue = () => {
    setShowCuriosity(false);
    if (currentQuestion === questions.length - 1) {
      setShowResult(true);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const calculateResult = () => {
    const genreCount: Record<string, number> = {};
    
    answers.forEach((answerIndex, questionIndex) => {
      const genre = questions[questionIndex].genreMapping[answerIndex];
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });

    const winningGenre = Object.entries(genreCount).reduce((a, b) => 
      a[1] > b[1] ? a : b
    )[0];

    return genreResults[winningGenre];
  };

  if (showResult) {
    const result = calculateResult();
    
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 pulse-glow">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Seu Gênero Literário</h1>
            <p className="text-muted-foreground">Baseado nas suas respostas, descobrimos seu perfil!</p>
          </div>

          <div className="glass-card rounded-3xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4">{result.title}</h2>
            <p className="text-lg text-muted-foreground mb-6">{result.description}</p>
            
            <div className="border-t border-border pt-6">
              <h3 className="font-bold mb-4">Livros recomendados para você:</h3>
              <div className="grid gap-3">
                {result.books.map((book, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span className="font-medium">{book}</span>
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
              setCurrentQuestion(0);
              setAnswers([]);
              setShowResult(false);
              setShowCuriosity(false);
              setCuriosityIndex(0);
            }}>
              Refazer quiz
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (showCuriosity) {
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
            <Button variant="hero" size="lg" onClick={handleContinue}>
              Continuar
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
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
