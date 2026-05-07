import Layout from "@/components/layout/Layout";
import AchievementsSection from "@/components/AchievementsSection";
import { Trophy } from "lucide-react";

const Conquistas = () => {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-6 lg:py-10 animate-fade-in">
        <header className="mb-6">
          <p className="text-xs text-accent font-bold uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5" />
            Suas conquistas
          </p>
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-1">
            Medalhas, marcos e badges
          </h1>
          <p className="text-muted-foreground text-sm">
            Cada hábito construído vira uma conquista. Continue lendo para desbloquear novas.
          </p>
        </header>

        <AchievementsSection />
      </div>
    </Layout>
  );
};

export default Conquistas;
