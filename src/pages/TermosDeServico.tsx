import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logoCrown from "@/assets/logo-crown-transparent.png";

const TermosDeServico = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-6 px-6 border-b border-border/30">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <img src={logoCrown} alt="BookQuest" className="w-8 h-8 object-contain" />
            <span className="font-serif font-semibold text-lg">BookQuest</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-serif font-bold mb-8">Termos de Serviço</h1>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>Última atualização: 11 de março de 2026</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Aceitação dos termos</h2>
            <p>
              Ao acessar e utilizar a plataforma BookQuest, você concorda com estes Termos de Serviço. Caso não concorde com algum dos termos, solicitamos que não utilize a plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Descrição do serviço</h2>
            <p>
              O BookQuest é uma plataforma educacional de leitura gamificada que oferece trilhas literárias, missões, quizzes, rankings e funcionalidades de comunidade para incentivar e acompanhar o hábito de leitura.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Cadastro e conta</h2>
            <p>
              Para utilizar a plataforma, é necessário criar uma conta com informações verdadeiras e atualizadas. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Uso adequado</h2>
            <p>
              Você se compromete a utilizar a plataforma de forma ética e legal. É proibido: publicar conteúdo ofensivo, difamatório ou ilegal; tentar manipular rankings ou sistemas de gamificação; utilizar bots ou scripts automatizados; violar direitos de propriedade intelectual de terceiros.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Conteúdo do usuário</h2>
            <p>
              Ao publicar conteúdo na plataforma (resenhas, comentários, discussões), você concede ao BookQuest uma licença não exclusiva para exibir esse conteúdo dentro da plataforma. Você mantém a titularidade sobre o conteúdo que produz.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Plano Premium</h2>
            <p>
              O BookQuest oferece funcionalidades premium mediante assinatura paga. Os valores, benefícios e condições de cancelamento são informados na página de assinatura. O cancelamento pode ser solicitado a qualquer momento, sem cobrança de multa.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Propriedade intelectual</h2>
            <p>
              Todo o conteúdo da plataforma BookQuest, incluindo marca, design, código e funcionalidades, é protegido por direitos de propriedade intelectual. É proibida a reprodução, distribuição ou modificação sem autorização prévia.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Limitação de responsabilidade</h2>
            <p>
              O BookQuest não se responsabiliza por danos indiretos, incidentais ou consequenciais decorrentes do uso da plataforma. Nos empenhamos em manter a plataforma disponível e funcional, mas não garantimos disponibilidade ininterrupta.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Alterações nos termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes Termos de Serviço a qualquer momento. As alterações serão comunicadas através da plataforma. O uso continuado após as alterações implica na aceitação dos novos termos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">10. Contato</h2>
            <p>
              Em caso de dúvidas sobre estes Termos de Serviço, entre em contato conosco pelo e-mail: contato@bookquest.com.br.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermosDeServico;
