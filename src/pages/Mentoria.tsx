import { Crown, Lock, Sparkles, Calendar, Clock, BookOpen, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

interface WeeklyPlan {
  day: string;
  task: string;
  duration: string;
  completed: boolean;
}

const weeklyPlan: WeeklyPlan[] = [
  { day: "Segunda", task: "Ler capítulos 1-2 de 'O Nome do Vento'", duration: "30 min", completed: true },
  { day: "Terça", task: "Ler capítulos 3-4 de 'O Nome do Vento'", duration: "30 min", completed: true },
  { day: "Quarta", task: "Revisar anotações + Quiz rápido", duration: "15 min", completed: false },
  { day: "Quinta", task: "Ler capítulos 5-6 de 'O Nome do Vento'", duration: "30 min", completed: false },
  { day: "Sexta", task: "Ler capítulos 7-8 de 'O Nome do Vento'", duration: "30 min", completed: false },
  { day: "Sábado", task: "Discussão na comunidade", duration: "20 min", completed: false },
  { day: "Domingo", task: "Revisão semanal + Planejamento", duration: "15 min", completed: false },
];

const Mentoria = () => {
  const isPremium = false; // Would come from user state

  if (!isPremium) {
    return (
      <Layout>
        <div className="py-8 max-w-2xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-8 lg:p-12 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Mentoria Literária</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Receba uma rotina de leitura personalizada toda semana, baseada no seu tempo disponível 
              e objetivos. Exclusivo para assinantes Premium.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-secondary">
                <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-bold">Rotina Semanal</p>
                <p className="text-xs text-muted-foreground">Planejamento personalizado</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary">
                <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-bold">Metas Claras</p>
                <p className="text-xs text-muted-foreground">Objetivos alcançáveis</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-bold">Progresso</p>
                <p className="text-xs text-muted-foreground">Acompanhamento semanal</p>
              </div>
            </div>

            <Link to="/premium">
              <Button variant="premium" size="lg" className="gap-2">
                <Crown className="w-5 h-5" />
                Assinar Premium - R$ 19,90/mês
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isPremium>
      <div className="py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-bold mb-4">
            <Crown className="w-4 h-4" />
            Premium
          </div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Mentoria Literária
          </h1>
          <p className="text-muted-foreground">
            Sua rotina de leitura personalizada para esta semana
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">30 min</p>
            <p className="text-xs text-muted-foreground">Tempo diário</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-accent">8</p>
            <p className="text-xs text-muted-foreground">Capítulos/semana</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-success">2/7</p>
            <p className="text-xs text-muted-foreground">Dias completados</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-info">29%</p>
            <p className="text-xs text-muted-foreground">Progresso semanal</p>
          </div>
        </div>

        {/* Weekly Plan */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Plano Semanal
          </h2>
          <div className="space-y-3">
            {weeklyPlan.map((item, index) => (
              <div 
                key={index}
                className={`glass-card rounded-xl p-4 animate-fade-in ${
                  item.completed ? "border-primary/50 bg-primary/5" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    item.completed ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}>
                    {item.completed ? "✓" : <BookOpen className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{item.day}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {item.duration}
                      </span>
                    </div>
                    <p className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                      {item.task}
                    </p>
                  </div>
                  {!item.completed && (
                    <Button variant="outline" size="sm">Marcar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Adjust Schedule */}
        <div className="glass-card rounded-2xl p-6 text-center">
          <h3 className="font-bold mb-2">Precisa ajustar seu tempo?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Altere o tempo disponível para receber uma nova rotina personalizada
          </p>
          <Button variant="outline" className="gap-2">
            <Clock className="w-4 h-4" />
            Ajustar Disponibilidade
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Mentoria;
