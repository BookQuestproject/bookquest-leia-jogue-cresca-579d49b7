import { Settings, User, Bell, Moon, Globe, Shield, LogOut, ChevronRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const Configuracoes = () => {
  return (
    <Layout>
      <div className="py-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Personalize sua experiência no BookQuest
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Account */}
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Conta
              </h2>
            </div>
            <div className="divide-y divide-border">
              <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                <div>
                  <p className="font-medium">Nome de exibição</p>
                  <p className="text-sm text-muted-foreground">Você</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">usuario@email.com</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                <div>
                  <p className="font-medium">Alterar senha</p>
                  <p className="text-sm text-muted-foreground">••••••••</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notificações
              </h2>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Lembrete de leitura</p>
                  <p className="text-sm text-muted-foreground">Receba lembretes diários</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Novas missões</p>
                  <p className="text-sm text-muted-foreground">Aviso de novas missões disponíveis</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Comunidade</p>
                  <p className="text-sm text-muted-foreground">Respostas e menções</p>
                </div>
                <Switch />
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold flex items-center gap-2">
                <Moon className="w-5 h-5 text-primary" />
                Aparência
              </h2>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Tema escuro</p>
                  <p className="text-sm text-muted-foreground">Sempre ativado</p>
                </div>
                <Switch defaultChecked disabled />
              </div>
            </div>
          </section>

          {/* Language */}
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Idioma
              </h2>
            </div>
            <div className="p-4">
              <button className="w-full flex items-center justify-between hover:bg-secondary/50 p-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇧🇷</span>
                  <span className="font-medium">Português (Brasil)</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </section>

          {/* Privacy */}
          <section className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacidade
              </h2>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Perfil público</p>
                  <p className="text-sm text-muted-foreground">Outros podem ver seu ranking</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Mostrar na comunidade</p>
                  <p className="text-sm text-muted-foreground">Aparecer em listas públicas</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </section>

          {/* Logout */}
          <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive">
            <LogOut className="w-5 h-5" />
            Sair da conta
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Configuracoes;
