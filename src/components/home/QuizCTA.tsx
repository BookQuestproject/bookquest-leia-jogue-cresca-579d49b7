import { Link } from "react-router-dom";
import { ArrowRight, Lock, Star, BookMarked } from "lucide-react";

interface QuizCTAProps {
  quizCompleted: boolean;
  isPremium: boolean;
  /** compact: true = mobile-style tighter layout */
  compact?: boolean;
}

const QuizCTA = ({ quizCompleted, isPremium, compact = false }: QuizCTAProps) => {
  const locked = quizCompleted && !isPremium;
  const to = locked ? "/premium" : "/quiz";

  return (
    <section className="w-full" aria-label="Quiz literário">
      <Link
        to={to}
        className="group relative block w-full rounded-2xl overflow-hidden border border-accent/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/20"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--accent) / 0.10) 100%)",
        }}
      >
        {/* Animated aurora glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60 group-hover:opacity-90 transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 80% 20%, hsl(var(--accent) / 0.22), transparent 60%), radial-gradient(ellipse 50% 80% at 15% 90%, hsl(var(--accent) / 0.12), transparent 60%)",
          }}
          aria-hidden="true"
        />

        <div
          className={`relative z-10 flex items-center gap-4 ${
            compact ? "p-5" : "p-6 lg:p-8"
          }`}
        >
          {/* Icon badge */}
          <div
            className={`flex-shrink-0 rounded-2xl flex items-center justify-center border border-accent/30 ${
              compact ? "w-12 h-12" : "w-14 h-14 lg:w-16 lg:h-16"
            }`}
            style={{
              background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent) / 0.7))",
              boxShadow: "0 8px 24px hsl(var(--accent) / 0.35)",
            }}
          >
            {locked ? (
              <Lock className={compact ? "w-5 h-5" : "w-6 h-6"} style={{ color: "hsl(var(--accent-foreground))" }} />
            ) : (
              <Star className={compact ? "w-5 h-5" : "w-6 h-6"} style={{ color: "hsl(var(--accent-foreground))" }} fill="currentColor" />
            )}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-accent font-bold uppercase tracking-[0.15em] mb-1">
              Quiz Literário
            </p>
            <h3
              className={`font-serif font-bold text-foreground leading-tight ${
                compact ? "text-base" : "text-lg lg:text-xl"
              }`}
            >
              {locked ? "Refazer o quiz e descobrir novos livros" : "Descubra seu gênero e receba recomendações"}
            </h3>
            <p className="text-muted-foreground text-xs lg:text-sm mt-1 flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5 flex-shrink-0" />
              {locked
                ? "Disponível para assinantes Premium — descubra novas histórias."
                : "Ao final, você recebe seu gênero literário e livros recomendados para você."}
            </p>
          </div>

          {/* CTA arrow */}
          <div
            className={`flex-shrink-0 rounded-full flex items-center justify-center bg-accent text-accent-foreground group-hover:scale-110 transition-transform ${
              compact ? "w-9 h-9" : "w-11 h-11"
            }`}
          >
            <ArrowRight className={compact ? "w-4 h-4" : "w-5 h-5"} />
          </div>
        </div>
      </Link>
    </section>
  );
};

export default QuizCTA;
