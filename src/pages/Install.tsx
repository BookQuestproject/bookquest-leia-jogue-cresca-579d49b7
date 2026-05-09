import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Share, PlusSquare, ArrowRight, CheckCircle2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">App instalado!</h1>
          <p className="text-muted-foreground mb-6">
            O BookQuest já está no seu dispositivo. Acesse pela tela inicial para uma experiência completa.
          </p>
          <Link to="/home">
            <Button className="gap-2">
              <ArrowRight className="w-4 h-4" />
              Ir para a Home
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background pt-16 pb-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Instale o BookQuest
            </h1>
            <p className="text-muted-foreground text-lg">
              Adicione à tela inicial para acessar mais rápido e ter uma experiência de app nativo.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Install Button or iOS Instructions */}
      <div className="max-w-md mx-auto px-4 pb-16">
        {deferredPrompt ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              size="xl"
              onClick={handleInstall}
              className="w-full gap-2 text-lg font-bold py-7"
            >
              <PlusSquare className="w-6 h-6" />
              Instalar App
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-3">
              Toque no botão acima e confirme a instalação.
            </p>
          </motion.div>
        ) : isIOS ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              No iPhone / iPad
            </h2>
            <ol className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">1</span>
                <span>Toque no botão <strong>Compartilhar</strong> <Share className="w-4 h-4 inline mx-1" /> na barra do Safari.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">2</span>
                <span>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">3</span>
                <span>Toque em <strong>"Adicionar"</strong> no canto superior direito.</span>
              </li>
            </ol>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              No Android
            </h2>
            <ol className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">1</span>
                <span>Toque no menu <strong>⋮</strong> (três pontos) no canto do navegador.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">2</span>
                <span>Selecione <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar app"</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">3</span>
                <span>Toque em <strong>"Instalar"</strong> ou <strong>"Adicionar"</strong>.</span>
              </li>
            </ol>
          </motion.div>
        )}

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 space-y-3"
        >
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Vantagens do app
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Acesso rápido", desc: "Ícone na tela inicial" },
              { label: "Modo offline", desc: "Funciona sem internet" },
              { label: "Tela cheia", desc: "Sem barra do navegador" },
              { label: "Notificações", desc: "Lembretes de leitura" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-card/50 border border-border rounded-xl p-3"
              >
                <p className="font-semibold text-foreground text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-8 text-center">
          <Link to="/home">
            <Button variant="ghost" className="gap-2 text-muted-foreground">
              Continuar no navegador
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Install;
