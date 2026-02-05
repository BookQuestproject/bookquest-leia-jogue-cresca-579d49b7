import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { ProfileProvider } from "@/hooks/useProfile";
import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import QuizOnboarding from "./pages/QuizOnboarding";
import Ranking from "./pages/Ranking";
import Comunidade from "./pages/Comunidade";
import Premium from "./pages/Premium";
import Perfil from "./pages/Perfil";
import Trilhas from "./pages/Trilhas";
import Estante from "./pages/Estante";
import Biblioteca from "./pages/Biblioteca";
import Missoes from "./pages/Missoes";
import BookClub from "./pages/BookClub";
import Mentoria from "./pages/Mentoria";
import Enem from "./pages/Enem";
import Configuracoes from "./pages/Configuracoes";
import Noticias from "./pages/Noticias";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ChapterReading from "./pages/ChapterReading";
 import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProfileProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/quiz-onboarding" element={<QuizOnboarding />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/comunidade" element={<Comunidade />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/trilhas" element={<Trilhas />} />
                <Route path="/trilhas/:bookId" element={<Trilhas />} />
                <Route path="/estante" element={<Estante />} />
                <Route path="/biblioteca" element={<Biblioteca />} />
                <Route path="/missoes" element={<Missoes />} />
                <Route path="/bookclub" element={<BookClub />} />
                <Route path="/mentoria" element={<Mentoria />} />
                <Route path="/enem" element={<Enem />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/noticias" element={<Noticias />} />
                <Route path="/ler/:bookId/:chapterId" element={<ChapterReading />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
