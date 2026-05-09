import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import { AuthProvider } from "@/hooks/useAuth";
import { ProfileProvider } from "@/hooks/useProfile";
import { TutorialProvider } from "@/contexts/TutorialContext";


import SpotlightOverlay from "@/components/tutorial/SpotlightOverlay";
import RouteTransition from "@/components/visual/RouteTransition";
import CategoryIntro from "@/components/tutorial/CategoryIntro";
import QuizGate from "@/components/QuizGate";
import UsernameGate from "@/components/UsernameGate";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import QuizOnboarding from "./pages/QuizOnboarding";
import Ranking from "./pages/Ranking";
import Comunidade from "./pages/Comunidade";
import EspacoLiterario from "./pages/EspacoLiterario";
import Premium from "./pages/Premium";
import Perfil from "./pages/Perfil";
import Trilhas from "./pages/Trilhas";
import Estante from "./pages/Estante";
import Biblioteca from "./pages/Biblioteca";
import Missoes from "./pages/Missoes";
import BookClub from "./pages/BookClub";
import Mentoria from "./pages/Mentoria";
import Enem from "./pages/Enem";
import RepertoireDetail from "./pages/RepertoireDetail";
import Configuracoes from "./pages/Configuracoes";
import Noticias from "./pages/Noticias";
import Conquistas from "./pages/Conquistas";
import MeuVocabulario from "./pages/MeuVocabulario";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ChapterReading from "./pages/ChapterReading";
import Admin from "./pages/Admin";
import AdminFounderPreview from "./pages/AdminFounderPreview";
import AuthCallback from "./pages/AuthCallback";
import EduEntry from "./pages/edu/EduEntry";
import EduProfessor from "./pages/edu/EduProfessor";
import DemoEduProfessor from "./pages/edu/DemoEduProfessor";
import DemoEduAluno from "./pages/edu/DemoEduAluno";
import Desafios from "./pages/Desafios";
import EduTurmas from "./pages/edu/EduTurmas";
import EduTurmaDetail from "./pages/edu/EduTurmaDetail";
import EduRelatorios from "./pages/edu/EduRelatorios";
import EduLivros from "./pages/edu/EduLivros";
import EduAluno from "./pages/edu/EduAluno";
import EduJornadas from "./pages/edu/EduJornadas";
import EduPerguntas from "./pages/edu/EduPerguntas";
import EduComunicacao from "./pages/edu/EduComunicacao";
import EduConfiguracoes from "./pages/edu/EduConfiguracoes";
import PoliticaDePrivacidade from "./pages/PoliticaDePrivacidade";
import TermosDeServico from "./pages/TermosDeServico";
import Install from "./pages/Install";

// App configuration
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProfileProvider>
        
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <TutorialProvider>
              <SpotlightOverlay />
              <CategoryIntro />
              <QuizGate>
              <UsernameGate>
                <RouteTransition>
                <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/home" element={<Index />} />
                <Route path="/dashboard" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/quiz-literario" element={<QuizOnboarding />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/comunidade" element={<EspacoLiterario />} />
                <Route path="/espaco-literario" element={<EspacoLiterario />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/trilhas" element={<Trilhas />} />
                <Route path="/trilhas/:bookId" element={<Trilhas />} />
                <Route path="/estante" element={<Estante />} />
                <Route path="/biblioteca" element={<Biblioteca />} />
                <Route path="/missoes" element={<Missoes />} />
                <Route path="/conquistas" element={<Conquistas />} />
                <Route path="/bookclub" element={<BookClub />} />
                <Route path="/desafios" element={<Desafios />} />
                <Route path="/mentoria" element={<Mentoria />} />
                <Route path="/enem" element={<Enem />} />
                <Route path="/enem/repertorio/:id" element={<RepertoireDetail />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/noticias" element={<Noticias />} />
                <Route path="/vocabulario" element={<MeuVocabulario />} />
                <Route path="/ler/:bookId/:chapterId" element={<ChapterReading />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/founder-preview" element={<AdminFounderPreview />} />
                <Route path="/edu" element={<EduEntry />} />
                <Route path="/edu/demo/professor" element={<DemoEduProfessor />} />
                <Route path="/edu/demo/aluno" element={<DemoEduAluno />} />
                <Route path="/edu/aluno" element={<EduAluno />} />
                <Route path="/edu/professor" element={<EduProfessor />} />
                <Route path="/edu/turmas" element={<EduTurmas />} />
                <Route path="/edu/turmas/:classId" element={<EduTurmaDetail />} />
                <Route path="/edu/relatorios" element={<EduRelatorios />} />
                <Route path="/edu/livros" element={<EduLivros />} />
                <Route path="/edu/jornadas" element={<EduJornadas />} />
                <Route path="/edu/perguntas" element={<EduPerguntas />} />
                <Route path="/edu/comunicacao" element={<EduComunicacao />} />
                <Route path="/edu/configuracoes" element={<EduConfiguracoes />} />
                <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />
                <Route path="/termos-de-servico" element={<TermosDeServico />} />
                <Route path="*" element={<NotFound />} />
                </Routes>
                </RouteTransition>
              </UsernameGate>
              </QuizGate>
            </TutorialProvider>
          </BrowserRouter>
          
        </TooltipProvider>
        
      </ProfileProvider>
    </AuthProvider>
    <Analytics />
  </QueryClientProvider>
);

export default App;
