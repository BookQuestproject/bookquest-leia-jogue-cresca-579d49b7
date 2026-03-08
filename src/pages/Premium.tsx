import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Check, GraduationCap, Users, Loader2, ExternalLink, Shield, Star, BookOpen, Gem } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useFounderStatus } from "@/hooks/useFounderStatus";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FounderBadge from "@/components/FounderBadge";
import EssenciaIcon from "@/components/EssenciaIcon";

const FOUNDER_MAX = 200;

const Premium = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, checkSubscription } = useProfile();
  const { toast } = useToast();
  const { slotsRemaining, isFounder, loading: founderLoading } = useFounderStatus();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isManageLoading, setIsManageLoading] = useState(false);

  const isSoldOut = slotsRemaining <= 0;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      const plan = params.get("plan");
      if (plan === "founder") {
        // Activate founder benefits
        supabase.functions.invoke("activate-founder").then(() => {
          checkSubscription();
        });
        toast({
          title: "🎉 Bem-vindo, Fundador!",
          description: "Você é um dos primeiros leitores do BookQuest. Seus benefícios exclusivos já estão ativos!",
        });
      } else {
        toast({
          title: "Assinatura realizada!",
          description: "Bem-vindo ao BookQuest Premium! Aproveite todos os benefícios.",
        });
        checkSubscription();
      }
      window.history.replaceState({}, "", "/premium");
    }
    if (params.get("canceled") === "true") {
      toast({
        title: "Pagamento cancelado",
        description: "Você pode assinar quando quiser.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", "/premium");
    }
  }, []);

  const handleSubscribe = async (planType: "monthly" | "annual" | "founder") => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoadingPlan(planType);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planType },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (error: any) {
      const msg = error?.message || "Não foi possível iniciar o pagamento.";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setIsManageLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível abrir o portal.", variant: "destructive" });
    } finally {
      setIsManageLoading(false);
    }
  };

  const premiumBenefits = [
    "Trilhas ENEM e Vestibulares",
    "Book Club mensal com discussões guiadas",
    "Mentoria literária semanal",
    "Quiz literário ilimitado",
    "Missões exclusivas com mais Essência",
    "Badge Premium no perfil",
    "Acesso antecipado a novidades",
  ];

  const founderExclusive = [
    "Tudo do Premium – para sempre",
    "Badge exclusivo de Fundador",
    "Título 'Leitor Fundador'",
    "Itens exclusivos de perfil",
    "Acesso antecipado a todas as novidades",
    "Acesso vitalício – pague uma vez só",
    "Reconhecimento como pioneiro do BookQuest",
  ];

  return (
    <Layout isPremium={isPremium}>
      <div className="py-8 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Crown className="w-4 h-4" />
            <span>BookQuest Premium</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">
            Leve sua leitura ao{" "}
            <span className="premium-aurora-text">próximo nível</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Escolha o plano ideal para sua jornada literária
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-16 items-start">
          {/* Monthly Plan */}
          <div className="glass-card rounded-3xl p-7 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="mb-5">
              <h3 className="text-lg font-bold mb-1">Mensal</h3>
              <p className="text-sm text-muted-foreground">Flexibilidade total</p>
            </div>
            <div className="mb-1">
              <div className="flex items-baseline gap-1">
                <span className="text-lg text-muted-foreground line-through">R$ 29,90</span>
                <span className="text-3xl font-bold">R$ 19,90</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </div>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-accent/15 text-accent text-[11px] font-semibold">
                🔥 Oferta de lançamento
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-5 mt-2">Cancele quando quiser</p>

            <ul className="space-y-2.5 mb-7">
              {premiumBenefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {isPremium && !isFounder ? (
              <Button variant="outline" size="lg" className="w-full gap-2" onClick={handleManageSubscription} disabled={isManageLoading}>
                {isManageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                Gerenciar assinatura
              </Button>
            ) : !isPremium ? (
              <Button variant="outline" size="lg" className="w-full gap-2" onClick={() => handleSubscribe("monthly")} disabled={!!loadingPlan}>
                {loadingPlan === "monthly" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                Assinar Mensal
              </Button>
            ) : (
              <Button variant="outline" size="lg" className="w-full" disabled>
                Premium ativo
              </Button>
            )}
          </div>

          {/* Annual Plan — Popular */}
          <div className="glass-card rounded-3xl p-7 border-2 border-accent relative animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold">
              Mais popular
            </div>
            <div className="mb-5">
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                Anual
                <Star className="w-4 h-4 text-accent" />
              </h3>
              <p className="text-sm text-muted-foreground">Melhor custo-benefício</p>
            </div>
            <div className="mb-1">
              <div className="flex items-baseline gap-1">
                <span className="text-lg text-muted-foreground line-through">R$ 358,80</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-accent">R$ 239,00</span>
                <span className="text-muted-foreground text-sm">/ano</span>
              </div>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-accent/15 text-accent text-[11px] font-semibold">
                Economize R$ 119,80
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-5 mt-2">~R$ 19,92/mês · Cobrado anualmente</p>

            <ul className="space-y-2.5 mb-7">
              {premiumBenefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {isPremium && !isFounder ? (
              <Button variant="outline" size="lg" className="w-full gap-2" onClick={handleManageSubscription} disabled={isManageLoading}>
                {isManageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                Gerenciar assinatura
              </Button>
            ) : !isPremium ? (
              <Button variant="premium" size="lg" className="w-full gap-2" onClick={() => handleSubscribe("annual")} disabled={!!loadingPlan}>
                {loadingPlan === "annual" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                Assinar Anual
              </Button>
            ) : (
              <Button variant="outline" size="lg" className="w-full" disabled>
                Premium ativo
              </Button>
            )}
          </div>

          {/* Founder Plan */}
          <div
            className="rounded-3xl p-7 relative animate-fade-in overflow-hidden"
            style={{
              animationDelay: "0.2s",
              background: "linear-gradient(145deg, hsl(var(--card)), hsl(30 25% 12%))",
              border: "2px solid hsl(40 80% 50% / 0.5)",
              boxShadow: "0 0 40px hsl(40 80% 50% / 0.08), inset 0 1px 0 hsl(40 80% 50% / 0.1)",
            }}
          >
            {/* Glow background */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, hsl(40 80% 50%), transparent 70%)",
              }}
            />

            {/* Badges */}
            <div className="flex items-center gap-2 mb-5 relative">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold" style={{ background: "hsl(40 80% 50% / 0.15)", color: "hsl(40 80% 55%)" }}>
                ⭐ Edição Limitada
              </span>
              {!isSoldOut && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-destructive/15 text-destructive">
                  {slotsRemaining} vagas restantes
                </span>
              )}
            </div>

            <div className="mb-5 relative">
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2" style={{ color: "hsl(40 80% 55%)" }}>
                <Shield className="w-5 h-5" />
                Plano Fundador
              </h3>
              <p className="text-sm text-muted-foreground">Para os primeiros leitores</p>
            </div>

            <div className="mb-1 relative">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold" style={{ color: "hsl(40 80% 55%)" }}>R$ 399,00</span>
              </div>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[11px] font-semibold" style={{ background: "hsl(40 80% 50% / 0.15)", color: "hsl(40 80% 55%)" }}>
                Pagamento único · Acesso vitalício
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-5 mt-2">Limitado a {FOUNDER_MAX} usuários</p>

            {/* Vacancy progress */}
            <div className="mb-5 relative">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                <span>{FOUNDER_MAX - slotsRemaining} de {FOUNDER_MAX} vagas preenchidas</span>
                <span className="font-bold" style={{ color: "hsl(40 80% 55%)" }}>{Math.round(((FOUNDER_MAX - slotsRemaining) / FOUNDER_MAX) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(40 80% 50% / 0.1)" }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${((FOUNDER_MAX - slotsRemaining) / FOUNDER_MAX) * 100}%`,
                    background: "linear-gradient(90deg, hsl(40 80% 50%), hsl(30 70% 45%))",
                  }}
                />
              </div>
            </div>

            <ul className="space-y-2.5 mb-7 relative">
              {founderExclusive.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "hsl(40 80% 55%)" }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {isFounder ? (
              <div className="relative">
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl" style={{ background: "hsl(40 80% 50% / 0.1)" }}>
                  <FounderBadge size="md" />
                  <span className="text-sm font-bold" style={{ color: "hsl(40 80% 55%)" }}>Você é um Fundador!</span>
                </div>
              </div>
            ) : isSoldOut ? (
              <Button variant="outline" size="lg" className="w-full" disabled>
                Esgotado
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full gap-2 text-background font-bold relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, hsl(40 80% 50%), hsl(30 70% 40%))",
                }}
                onClick={() => handleSubscribe("founder")}
                disabled={!!loadingPlan}
              >
                {loadingPlan === "founder" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                Garantir minha vaga
              </Button>
            )}
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
                <BookOpen className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Mentoria Semanal</h3>
              <p className="text-sm text-muted-foreground">
                Rotina de leitura personalizada baseada no seu tempo disponível e objetivos.
              </p>
            </div>
          </div>
        </div>

        {/* Founder Exclusive Section */}
        <div className="mt-16 rounded-3xl p-8 relative overflow-hidden" style={{
          background: "linear-gradient(145deg, hsl(30 25% 8%), hsl(30 20% 12%))",
          border: "1px solid hsl(40 80% 50% / 0.2)",
        }}>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 30% 50%, hsl(40 80% 50%), transparent 60%)" }}
          />
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <FounderBadge size="lg" showLabel={false} />
              <div>
                <h2 className="text-xl font-bold" style={{ color: "hsl(40 80% 55%)" }}>Exclusivo para Fundadores</h2>
                <p className="text-sm text-muted-foreground">Benefícios que ninguém mais terá</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-xl p-5" style={{ background: "hsl(40 80% 50% / 0.05)", border: "1px solid hsl(40 80% 50% / 0.1)" }}>
                <Shield className="w-8 h-8 mb-3" style={{ color: "hsl(40 80% 55%)" }} />
                <h4 className="font-bold mb-1">Badge de Fundador</h4>
                <p className="text-xs text-muted-foreground">Exibido no seu perfil e ao lado do nome no ranking. Um símbolo permanente de pioneirismo.</p>
              </div>
              <div className="rounded-xl p-5" style={{ background: "hsl(40 80% 50% / 0.05)", border: "1px solid hsl(40 80% 50% / 0.1)" }}>
                <Crown className="w-8 h-8 mb-3" style={{ color: "hsl(40 80% 55%)" }} />
                <h4 className="font-bold mb-1">Título Exclusivo</h4>
                <p className="text-xs text-muted-foreground">"Leitor Fundador" — um título especial que aparece no seu perfil e ao lado do seu nome.</p>
              </div>
              <div className="rounded-xl p-5" style={{ background: "hsl(40 80% 50% / 0.05)", border: "1px solid hsl(40 80% 50% / 0.1)" }}>
                <Gem className="w-8 h-8 mb-3" style={{ color: "hsl(40 80% 55%)" }} />
                <h4 className="font-bold mb-1">Itens Exclusivos</h4>
                <p className="text-xs text-muted-foreground">Molduras, temas e avatares especiais que só fundadores podem usar.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-2">Qual a diferença entre Anual e Mensal?</h3>
              <p className="text-sm text-muted-foreground">
                Os benefícios são idênticos. O plano anual oferece um desconto significativo de R$ 119,80 comparado ao mensal.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-2">O que é o Plano Fundador?</h3>
              <p className="text-sm text-muted-foreground">
                Um plano exclusivo e limitado a 200 vagas. Pagamento único de R$ 399 com acesso vitalício ao Premium + benefícios exclusivos que nunca mais estarão disponíveis.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-2">Posso cancelar o plano mensal/anual?</h3>
              <p className="text-sm text-muted-foreground">
                Sim! Cancele a qualquer momento sem multas. O acesso continua até o final do período pago.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold mb-2">Os benefícios de Fundador são permanentes?</h3>
              <p className="text-sm text-muted-foreground">
                Sim! O badge, título e itens exclusivos são para sempre. Você será reconhecido como um dos primeiros leitores do BookQuest.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Premium;
