import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/hooks/useAuth";
import { ProfileProvider } from "@/hooks/useProfile";
import { TutorialProvider } from "@/contexts/TutorialContext";
import SpotlightOverlay from "@/components/tutorial/SpotlightOverlay";
import CategoryIntro from "@/components/tutorial/CategoryIntro";
import QuizGate from "@/components/QuizGate";
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
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ChapterReading from "./pages/ChapterReading";
import Admin from "./pages/Admin";
import AdminFounderPreview from "./pages/AdminFounderPreview";
import EduDashboard from "./pages/edu/EduDashboard";
import Desafios from "./pages/Desafios";
import EduTurmas from "./pages/edu/EduTurmas";
import EduTurmaDetail from "./pages/edu/EduTurmaDetail";
import EduRelatorios from "./pages/edu/EduRelatorios";

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
                <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/home" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/quiz-onboarding" element={<QuizOnboarding />} />
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
                <Route path="/bookclub" element={<BookClub />} />
                <Route path="/desafios" element={<Desafios />} />
                <Route path="/mentoria" element={<Mentoria />} />
                <Route path="/enem" element={<Enem />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/noticias" element={<Noticias />} />
                <Route path="/ler/:bookId/:chapterId" element={<ChapterReading />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/founder-preview" element={<AdminFounderPreview />} />
                <Route path="/edu" element={<EduDashboard />} />
                <Route path="/edu/turmas" element={<EduTurmas />} />
                <Route path="/edu/turmas/:classId" element={<EduTurmaDetail />} />
                <Route path="/edu/relatorios" element={<EduRelatorios />} />
                <Route path="*" element={<NotFound />} />
                </Routes>
              </QuizGate>
            </TutorialProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ProfileProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
