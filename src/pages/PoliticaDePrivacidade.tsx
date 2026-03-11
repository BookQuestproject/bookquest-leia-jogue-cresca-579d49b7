import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logoCrown from "@/assets/logo-crown-transparent.png";

const PoliticaDePrivacidade = () => {
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
        <h1 className="text-3xl font-serif font-bold mb-8">Política de Privacidade</h1>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>Última atualização: 11 de março de 2026</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Informações que coletamos</h2>
            <p>
              Ao utilizar a plataforma BookQuest, coletamos as seguintes informações pessoais: nome completo, endereço de e-mail, dados de perfil literário (preferências de leitura, gêneros favoritos), progresso de leitura, dados de desempenho em quizzes e missões, e informações de interação com a comunidade.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Como utilizamos suas informações</h2>
            <p>
              Utilizamos suas informações para: personalizar sua experiência na plataforma, fornecer recomendações de leitura relevantes, calcular rankings e progresso, enviar notificações sobre missões e conquistas, melhorar nossos serviços e funcionalidades, e comunicar atualizações importantes sobre a plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Compartilhamento de dados</h2>
            <p>
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins de marketing. Podemos compartilhar dados com prestadores de serviços que nos auxiliam na operação da plataforma, sempre sob acordos de confidencialidade.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Segurança dos dados</h2>
            <p>
              Adotamos medidas técnicas e organizacionais adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Utilizamos criptografia e protocolos de segurança padrão da indústria.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Seus direitos</h2>
            <p>
              Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento. Para exercer esses direitos, entre em contato conosco através do e-mail contato@bookquest.com.br. Atenderemos sua solicitação no prazo previsto pela legislação aplicável.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Cookies</h2>
            <p>
              Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência de navegação, lembrar suas preferências e analisar o uso da plataforma. Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações significativas através da plataforma ou por e-mail. O uso continuado da plataforma após as alterações constitui aceitação da política atualizada.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Contato</h2>
            <p>
              Em caso de dúvidas sobre esta Política de Privacidade, entre em contato conosco pelo e-mail: contato@bookquest.com.br.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PoliticaDePrivacidade;
