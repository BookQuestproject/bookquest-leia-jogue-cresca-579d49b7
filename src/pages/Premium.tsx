import { Link } from "react-router-dom";
import { Crown, Check, Star, BookOpen, Users, Sparkles, GraduationCap, MessageSquare, Zap } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const Premium = () => {
  const freeBenefits = [
    "Quiz literário completo",
    "Perfil personalizado",
    "Ranking e competição",
    "Comunidade e fóruns",
    "Missões diárias básicas",
    "Recomendações de livros",
  ];

  const premiumBenefits = [
    "Tudo do plano gratuito",
    "Trilhas ENEM e Vestibulares",
    "Book Club mensal com discussões guiadas",
    "Mentoria literária semanal personalizada",
    "Quiz literário avançado com análises",
    "Missões exclusivas com mais XP",
    "Badge Premium no perfil",
    "Acesso antecipado a novidades",
  ];

  return (
    <Layout>
      <div className="py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold text-sm font-medium mb-4">
            <Crown className="w-4 h-4" />
            <span>BookQuest Premium</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">
            Leve sua leitura ao<br />
            <span className="text-gradient">próximo nível</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Desbloqueie trilhas focadas em vestibulares, mentoria personalizada e muito mais
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Free Plan */}
          <div className="glass-card rounded-3xl p-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Gratuito</h3>
              <p className="text-muted-foreground">Perfeito para começar</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">R$ 0</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            <ul className="space-y-3 mb-8">
              {freeBenefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" size="lg" className="w-full">
              Plano atual
            </Button>
          </div>

          {/* Premium Plan */}
          <div className="glass-card rounded-3xl p-8 border-2 border-gold relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gold text-background text-sm font-bold">
              Mais popular
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                Premium
                <Crown className="w-5 h-5 text-gold" />
              </h3>
              <p className="text-muted-foreground">Para leitores dedicados</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">R$ 19,90</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Inclui: Book Club, Mentoria Literária, Trilhas ENEM/Vestibulares, Estatísticas detalhadas, Paginômetro
            </p>
            <ul className="space-y-3 mb-8">
              {premiumBenefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-gold" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <Button variant="premium" size="lg" className="w-full">
              <Crown className="w-5 h-5" />
              Assinar Premium
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Cancele quando quiser. Sem compromisso.
            </p>
          </div>
        </div>

        {/* Features Detail */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center mb-8">O que você ganha no Premium</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Trilhas ENEM</h3>
              <p className="text-sm text-muted-foreground">
                Leituras obrigatórias organizadas por vestibular, com resumos e análises detalhadas.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-lg font-bold mb-2">Book Club</h3>
              <p className="text-sm text-muted-foreground">
                Leituras coletivas mensais com discussões guiadas e encontros virtuais.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Mentoria Semanal</h3>
              <p className="text-sm text-muted-foreground">
                Rotina de leitura personalizada baseada no seu tempo disponível e objetivos.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-2">Como funciona o pagamento?</h3>
              <p className="text-sm text-muted-foreground">
                O pagamento é mensal e recorrente. Você pode cancelar a qualquer momento sem multas.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-2">Posso testar antes de assinar?</h3>
              <p className="text-sm text-muted-foreground">
                Sim! O plano gratuito já oferece muitos recursos para você experimentar.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-2">Como funciona a mentoria?</h3>
              <p className="text-sm text-muted-foreground">
                Você recebe semanalmente uma rotina personalizada de leitura baseada nos seus objetivos.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-2">O que é o Book Club?</h3>
              <p className="text-sm text-muted-foreground">
                Um clube de leitura com livro mensal, discussões guiadas e comunidade exclusiva.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Premium;
