import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, CheckCircle, Clock, BookOpen, Timer, HelpCircle, Sparkles, AlertCircle, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PostChapterReflection from "@/components/PostChapterReflection";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// This would ideally come from a shared data source
const bookData: Record<string, {
  title: string;
  themeColor: string;
  chapters: Array<{
    id: number;
    title: string;
    icon: string;
    totalPages: number;
    question?: {
      text: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    };
  }>;
}> = {
  "harry-potter-1": {
    title: "Harry Potter e a Pedra Filosofal",
    themeColor: "350 45% 32%",
    chapters: [
      {
        id: 1,
        title: "O Menino que Sobreviveu",
        icon: "🏠",
        totalPages: 24,
        question: {
          text: "Por que os Dursley tinham tanto medo de que os vizinhos descobrissem sobre os Potter?",
          options: [
            "Porque os Potter eram criminosos procurados",
            "Porque não queriam ser associados a algo 'anormal'",
            "Porque deviam dinheiro aos Potter",
            "Porque os Potter eram celebridades famosas"
          ],
          correctAnswer: 1,
          explanation: "Os Dursley valorizavam acima de tudo a 'normalidade' e temiam qualquer associação com o mundo mágico."
        }
      },
      { id: 2, title: "O Vidro que Sumiu", icon: "🐍", totalPages: 18, question: {
        text: "O que aconteceu no zoológico que deixou os Dursley furiosos?",
        options: ["Harry comprou um sorvete", "O vidro do terrário da cobra desapareceu", "Harry falou com outros visitantes sobre magia", "Dudley caiu em uma poça"],
        correctAnswer: 1,
        explanation: "Harry involuntariamente fez o vidro do terrário desaparecer, permitindo que a cobra escapasse."
      }},
      { id: 3, title: "As Cartas de Ninguém", icon: "✉️", totalPages: 22, question: {
        text: "Por que o tio Válter tentou impedir Harry de receber as cartas?",
        options: ["As cartas continham ameaças", "Ele sabia que eram de Hogwarts e queria esconder a verdade", "As cartas eram cobranças de dívidas", "Ele achava que eram propagandas"],
        correctAnswer: 1,
        explanation: "Válter sabia que as cartas vinham de Hogwarts e queria impedir Harry de descobrir sobre o mundo bruxo."
      }},
      { id: 4, title: "O Guardião das Chaves", icon: "🗝️", totalPages: 20, question: {
        text: "Quem é o 'Guardião das Chaves' que aparece para Harry?",
        options: ["Dumbledore", "Hagrid", "Snape", "McGonagall"],
        correctAnswer: 1,
        explanation: "Hagrid é o Guardião das Chaves e Terrenos de Hogwarts, e foi ele quem revelou a Harry que ele era um bruxo."
      }},
      { id: 5, title: "O Beco Diagonal", icon: "🏪", totalPages: 28, question: {
        text: "Qual foi a primeira coisa que Harry comprou no Beco Diagonal?",
        options: ["Sua varinha", "Seu uniforme", "Seus livros", "Ele primeiro foi ao Gringotes trocar dinheiro"],
        correctAnswer: 3,
        explanation: "Antes de comprar qualquer material, Harry e Hagrid foram ao banco Gringotes para acessar o cofre dos Potter."
      }},
      { id: 6, title: "A Viagem da Plataforma", icon: "🚂", totalPages: 18, question: {
        text: "Quem ajudou Harry a encontrar a Plataforma 9¾?",
        options: ["Hagrid deixou instruções escritas", "A família Weasley", "Um funcionário do trem", "Ele encontrou sozinho"],
        correctAnswer: 1,
        explanation: "A Sra. Weasley e seus filhos ajudaram Harry a atravessar a barreira para a Plataforma 9¾."
      }},
      { id: 7, title: "O Chapéu Seletor", icon: "🎩", totalPages: 16, question: {
        text: "O que o Chapéu Seletor considerou antes de colocar Harry na Grifinória?",
        options: ["Colocá-lo na Corvinal", "Colocá-lo na Sonserina", "Colocá-lo na Lufa-Lufa", "Não selecioná-lo"],
        correctAnswer: 1,
        explanation: "O Chapéu considerou colocar Harry na Sonserina, mas Harry pediu para não ir para lá."
      }},
      { id: 8, title: "O Mestre das Poções", icon: "⚗️", totalPages: 20, question: {
        text: "Por que Snape parecia não gostar de Harry desde o início?",
        options: ["Harry errou uma poção", "Harry lembrava seu pai, com quem Snape tinha rivalidade", "Harry chegou atrasado na aula", "Harry desrespeitou Snape"],
        correctAnswer: 1,
        explanation: "Snape tinha uma antiga rivalidade com Tiago Potter, pai de Harry, e transferiu esses sentimentos para o filho."
      }},
      { id: 9, title: "O Duelo à Meia-Noite", icon: "⚔️", totalPages: 22, question: {
        text: "Quem desafiou Harry para um duelo à meia-noite?",
        options: ["Rony Weasley", "Neville Longbottom", "Draco Malfoy", "Fred Weasley"],
        correctAnswer: 2,
        explanation: "Draco Malfoy desafiou Harry para um duelo, mas na verdade era uma armadilha para que ele fosse pego fora da cama."
      }},
      { id: 10, title: "O Espelho de Ojesed", icon: "🪞", totalPages: 24, question: {
        text: "O que Harry viu quando olhou no Espelho de Ojesed?",
        options: ["Ele mesmo como capitão de Quadribol", "Sua família, incluindo seus pais", "Dumbledore sorrindo", "O mundo trouxa"],
        correctAnswer: 1,
        explanation: "O Espelho de Ojesed mostra o desejo mais profundo do coração. Harry viu seus pais e sua família ao redor dele."
      }},
    ]
  },
  "percy-jackson-1": {
    title: "Percy Jackson e o Ladrão de Raios",
    themeColor: "210 55% 30%",
    chapters: [
      { id: 1, title: "Eu Vaporizo Minha Professora", icon: "⚡", totalPages: 15, question: {
        text: "O que aconteceu com a Sra. Dodds durante a excursão ao museu?",
        options: ["Ela desmaiou", "Ela se transformou em uma Fúria e atacou Percy", "Ela foi demitida", "Ela desapareceu misteriosamente"],
        correctAnswer: 1,
        explanation: "A Sra. Dodds era na verdade uma Fúria disfarçada e atacou Percy no museu, sendo vaporizada por ele."
      }},
      { id: 2, title: "Três Velhas Tricotando", icon: "🧶", totalPages: 18, question: {
        text: "O que as três velhas tricotando representavam na mitologia?",
        options: ["As Musas", "As Moiras (Parcas), que controlam o destino", "As Harpias", "As Ninfas"],
        correctAnswer: 1,
        explanation: "As três velhas eram as Moiras, que na mitologia grega tecem, medem e cortam o fio da vida de cada pessoa."
      }},
      { id: 3, title: "Grover Perde as Calças", icon: "🐐", totalPages: 20, question: {
        text: "Qual segredo de Grover foi revelado neste capítulo?",
        options: ["Ele era um espião", "Ele era um sátiro com pernas de bode", "Ele podia voar", "Ele era filho de um deus"],
        correctAnswer: 1,
        explanation: "Percy descobriu que Grover era um sátiro — metade humano, metade bode — enviado para protegê-lo."
      }},
    ]
  },
  "dom-casmurro": {
    title: "Dom Casmurro",
    themeColor: "35 40% 28%",
    chapters: [
      { id: 1, title: "Do título", icon: "📜", totalPages: 8, question: {
        text: "Por que o narrador se autodenomina 'Dom Casmurro'?",
        options: ["Era seu nome de batismo", "Foi um apelido dado por um poeta por ele ser fechado e calado", "Era um título de nobreza", "Ele escolheu esse nome por diversão"],
        correctAnswer: 1,
        explanation: "O apelido 'Dom Casmurro' foi dado por um jovem poeta porque Bentinho cochilou durante seus versos no trem."
      }},
      { id: 2, title: "Do livro", icon: "📖", totalPages: 10, question: {
        text: "Qual era a intenção do narrador ao escrever o livro?",
        options: ["Ficar famoso como escritor", "Atar as duas pontas da vida e restaurar a adolescência na velhice", "Denunciar injustiças sociais", "Contar a história de seus pais"],
        correctAnswer: 1,
        explanation: "Bentinho queria reconstruir a casa de Matacavalos e, com ela, reviver as memórias de sua juventude."
      }},
      { id: 3, title: "A denúncia", icon: "🔔", totalPages: 12, question: {
        text: "O que José Dias denunciou a D. Glória?",
        options: ["Que Bentinho estava doente", "Que Bentinho e Capitu estavam sempre juntos e namorando", "Que Bentinho queria fugir de casa", "Que Capitu roubava livros"],
        correctAnswer: 1,
        explanation: "José Dias alertou D. Glória sobre a proximidade entre Bentinho e Capitu, sugerindo que estavam namorando."
      }},
    ]
  },
  "o-pequeno-principe": {
    title: "O Pequeno Príncipe",
    themeColor: "40 65% 45%",
    chapters: [
      { id: 1, title: "O Desenho", icon: "🎨", totalPages: 6, question: {
        text: "O que os adultos viam no desenho do narrador quando criança?",
        options: ["Uma jiboia engolindo um elefante", "Um chapéu", "Uma montanha", "Um barco"],
        correctAnswer: 1,
        explanation: "Os adultos viam apenas um chapéu, sem perceber que era uma jiboia que engoliu um elefante, mostrando a falta de imaginação dos crescidos."
      }},
      { id: 2, title: "O Encontro", icon: "⭐", totalPages: 10, question: {
        text: "Onde o narrador encontrou o Pequeno Príncipe pela primeira vez?",
        options: ["Em uma floresta encantada", "No deserto do Saara, após uma pane no avião", "Em uma cidade grande", "Em um navio no oceano"],
        correctAnswer: 1,
        explanation: "O aviador encontrou o Pequeno Príncipe no deserto do Saara, onde havia feito um pouso forçado."
      }},
      { id: 3, title: "O Asteroide B-612", icon: "🪐", totalPages: 8, question: {
        text: "Por que o Pequeno Príncipe precisava cuidar dos baobás em seu asteroide?",
        options: ["Para ter sombra", "Porque se crescessem, destruiriam o pequeno planeta", "Para colher frutas", "Para decorar o asteroide"],
        correctAnswer: 1,
        explanation: "Os baobás, se não arrancados quando pequenos, cresceriam tanto que suas raízes destruiriam o minúsculo asteroide."
      }},
    ]
  },
};

import ReadingCountdown from "@/components/ReadingCountdown";

type ReadingState = "intro" | "countdown" | "reading" | "reflection" | "completed";

const ChapterReading = () => {
  const { bookId, chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, loading: progressLoading, saveProgress, markAsCompleted, clearProgress } = useReadingProgress(bookId, chapterId);
  
  const [readingState, setReadingState] = useState<ReadingState>("intro");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const [isTimerError, setIsTimerError] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const book = bookId ? bookData[bookId] : null;
  const chapter = book?.chapters.find(c => c.id === Number(chapterId));
  const themeColor = book?.themeColor || "350 45% 32%";

  // Restore progress when loaded
  useEffect(() => {
    if (!progressLoading && progress && !hasRestoredProgress && !progress.is_completed) {
      setElapsedTime(progress.elapsed_time);
      setIsPaused(true);
      setReadingState("reading");
      setHasRestoredProgress(true);
    }
  }, [progress, progressLoading, hasRestoredProgress]);

  // Timer logic
  useEffect(() => {
    if (readingState === "reading" && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [readingState, isPaused]);

  // Auto-save when paused
  useEffect(() => {
    if (readingState === "reading" && isPaused && user && elapsedTime > 0) {
      saveProgress(elapsedTime, true, false);
    }
  }, [isPaused, readingState, elapsedTime, user, saveProgress]);

  // Save progress when leaving the page (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (readingState === "reading" && user && elapsedTime > 0) {
        // Use sendBeacon for reliable save on page unload
        const data = JSON.stringify({
          user_id: user.id,
          book_id: bookId,
          chapter_id: chapterId,
          elapsed_time: elapsedTime,
          is_paused: true,
          is_completed: false,
        });
        
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/reading_progress?on_conflict=user_id,book_id,chapter_id`,
          new Blob([data], { type: 'application/json' })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [readingState, user, elapsedTime, bookId, chapterId]);

  // Save progress when navigating away (component unmount)
  useEffect(() => {
    return () => {
      if (readingState === "reading" && user && elapsedTime > 0) {
        saveProgress(elapsedTime, true, false);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeReadable = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}min ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}min ${secs}s`;
    }
    return `${secs}s`;
  };

  const handleStartReading = () => {
    if (hasRestoredProgress) {
      // Resuming - skip countdown
      setReadingState("reading");
      setIsPaused(false);
    } else {
      setReadingState("countdown");
    }
  };

  const handleCountdownComplete = () => {
    setElapsedTime(0);
    setReadingState("reading");
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  // Minimum reading time: 30 seconds to prevent accidental/invalid completions
  const MIN_READING_TIME = 30;

  const handleChapterComplete = async () => {
    // Validate minimum reading time
    if (elapsedTime < MIN_READING_TIME) {
      // Trigger shake animation and red background
      setIsTimerError(true);
      setTimeout(() => setIsTimerError(false), 600);
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Mark as completed (keeps the record for showing in trail)
    if (user) {
      await markAsCompleted(elapsedTime);
    }
    
    // Always go to reflection (AI-generated questions)
    setReadingState("reflection");
  };

  const handleReflectionComplete = (xp: number) => {
    setEarnedXp(xp);
    setReadingState("completed");
  };

  const handleBackToTrail = () => {
    if (readingState === "reflection") {
      setShowExitConfirm(true);
      return;
    }
    navigate(`/trilhas/${bookId}`);
  };

  const handleConfirmExit = async () => {
    // Revert completion — clear progress so chapter is NOT marked as done
    if (user) {
      await clearProgress();
    }
    setShowExitConfirm(false);
    navigate(`/trilhas/${bookId}`);
  };

  if (!book || !chapter) {
    return (
      <Layout>
        <div className="py-8 text-center">
          <h1 className="text-2xl font-serif font-semibold mb-4">Capítulo não encontrado</h1>
          <Link to="/trilhas">
            <Button variant="outline">Voltar às trilhas</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Show loading while checking for saved progress
  if (progressLoading && user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-8 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
            <div className="h-6 bg-muted rounded w-48 mx-auto" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        {/* Back Button */}
        <button 
          onClick={handleBackToTrail}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para {book.title}
        </button>

        {/* Exit Confirmation Dialog */}
        <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <AlertDialogTitle>Sair da reflexão?</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-sm leading-relaxed">
                Se você sair agora, <strong>todo o seu progresso neste capítulo será perdido</strong> e ele <strong>não será concluído</strong>. Você precisará ler novamente para desbloqueá-lo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continuar respondendo</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmExit}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sair e perder progresso
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Intro State - Explain how it works */}
        {readingState === "intro" && (
          <div className="animate-fade-in space-y-8">
            {/* Header Card */}
            <div 
              className="rounded-xl p-6 text-center"
              style={{
                background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
              }}
            >
              <span className="text-5xl mb-4 block">{chapter.icon}</span>
              <p className="text-white/70 text-sm mb-1">Capítulo {chapter.id}</p>
              <h1 className="text-2xl font-serif font-semibold text-white mb-2">
                {chapter.title}
              </h1>
              <p className="text-white/60 text-sm">{chapter.totalPages} páginas</p>
            </div>

            {/* How it works */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                Como funciona a trilha
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `hsl(${themeColor} / 0.15)` }}
                  >
                    <Timer className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Acompanhamos sua leitura</h3>
                    <p className="text-sm text-muted-foreground">
                      Um cronômetro vai registrar o tempo que você leva para ler o capítulo. 
                      Assim você pode acompanhar seu progresso e ritmo de leitura.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `hsl(${themeColor} / 0.15)` }}
                  >
                    <Pause className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Pause quando precisar</h3>
                    <p className="text-sm text-muted-foreground">
                      Precisa fazer uma pausa? Sem problemas! Você pode pausar o cronômetro 
                      e continuar depois, sem perder seu progresso.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `hsl(${themeColor} / 0.15)` }}
                  >
                    <HelpCircle className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Quiz ao final</h3>
                    <p className="text-sm text-muted-foreground">
                      Após concluir a leitura, responda perguntas sobre o capítulo para 
                      testar sua compreensão e ganhar pontos!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <Button 
              size="xl" 
              className="w-full gap-3"
              onClick={handleStartReading}
              style={{ 
                background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
              }}
            >
              <Play className="w-6 h-6" />
              Iniciar Leitura
            </Button>
          </div>
        )}

        {/* Countdown State */}
        {readingState === "countdown" && (
          <ReadingCountdown
            onComplete={handleCountdownComplete}
            themeColor={themeColor}
            chapterTitle={chapter.title}
          />
        )}

        {/* Reading State - Timer Active */}
        {readingState === "reading" && (
          <div className="animate-fade-in space-y-8">
            {/* Chapter Info */}
            <div className="text-center mb-4">
              <span className="text-4xl mb-2 block">{chapter.icon}</span>
              <p className="text-sm text-muted-foreground">Capítulo {chapter.id}</p>
              <h1 className="text-xl font-serif font-semibold">{chapter.title}</h1>
            </div>

            {/* Timer Display */}
            <div 
              className={`rounded-2xl p-8 text-center transition-all duration-200 ${
                isTimerError ? 'animate-[shake_0.5s_ease-in-out]' : ''
              }`}
              style={{
                background: isTimerError 
                  ? 'linear-gradient(135deg, hsl(0 65% 45%), hsl(0 65% 35%))'
                  : `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
              }}
            >
              <div className="flex items-center justify-center gap-2 text-white/70 text-sm mb-3">
                <Clock className="w-4 h-4" />
                {isPaused ? "Leitura pausada" : "Tempo de leitura"}
              </div>
              
              <div 
                className={`text-6xl lg:text-7xl font-mono font-bold text-white mb-4 tracking-wider ${
                  isPaused ? 'animate-pulse' : ''
                }`}
              >
                {formatTime(elapsedTime)}
              </div>

              <p className="text-white/60 text-sm">
                {chapter.totalPages} páginas • {book.title}
              </p>
            </div>

            {/* Reading Instructions */}
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Abra seu livro e leia o capítulo. Quando terminar, clique em "Capítulo Concluído".
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2"
                onClick={handlePauseResume}
              >
                {isPaused ? (
                  <>
                    <Play className="w-5 h-5" />
                    Continuar
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5" />
                    Pausar
                  </>
                )}
              </Button>
              
              <Button 
                size="lg" 
                className="gap-2"
                onClick={handleChapterComplete}
                style={{ 
                  background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                }}
              >
                <CheckCircle className="w-5 h-5" />
                Concluído
              </Button>
            </div>
          </div>
        )}

        {/* Reflection State - AI-powered post-chapter questions */}
        {readingState === "reflection" && (
          <PostChapterReflection
            bookTitle={book.title}
            chapterTitle={chapter.title}
            chapterId={chapter.id}
            totalChapters={book.chapters.length}
            themeColor={themeColor}
            readingTime={elapsedTime}
            onComplete={handleReflectionComplete}
          />
        )}

        {/* Completed State */}
        {readingState === "completed" && (
          <div className="animate-fade-in text-center space-y-8">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
              style={{ background: `hsl(${themeColor} / 0.15)` }}
            >
              <CheckCircle className="w-12 h-12" style={{ color: `hsl(${themeColor})` }} />
            </div>

            <div>
              <h2 className="text-2xl font-serif font-semibold mb-2">Capítulo Concluído!</h2>
              <p className="text-muted-foreground">
                Você completou "{chapter.title}"
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border inline-block">
              <div className="flex items-center gap-6 justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold" style={{ color: `hsl(${themeColor})` }}>
                    +{earnedXp}
                  </p>
                  <p className="text-xs text-muted-foreground">XP ganhos</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <div className="flex items-center gap-1.5 justify-center mb-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">tempo de leitura</p>
                  </div>
                  <p className="text-3xl font-bold" style={{ color: `hsl(${themeColor})` }}>
                    {formatTimeReadable(elapsedTime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                size="lg"
                onClick={handleBackToTrail}
                style={{ 
                  background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                }}
              >
                Voltar para Trilha
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChapterReading;
