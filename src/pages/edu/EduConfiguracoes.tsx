import { useState, useEffect } from "react";
import EduLayout from "./EduLayout";
import { useTeacherSettings } from "@/hooks/useTeacherSettings";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings, User, School, Mail, Bell, Loader2 } from "lucide-react";

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <Card className="bg-card border-border">
    <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Icon className="h-4 w-4 text-accent" />{title}</CardTitle></CardHeader>
    <CardContent className="space-y-3">{children}</CardContent>
  </Card>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label><div className="mt-1">{children}</div></div>
);

const EduConfiguracoes = () => {
  const { profile } = useProfile();
  const { settings, loading, save } = useTeacherSettings();
  const [school, setSchool] = useState("");
  const [signature, setSignature] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [autoSend, setAutoSend] = useState(false);
  const [notify, setNotify] = useState({ student_inactive: true, weekly_summary: true, mentions: false });

  useEffect(() => {
    if (settings) {
      setSchool(settings.school_name ?? "");
      setSignature(settings.signature ?? "");
      setSenderEmail(settings.email_settings?.sender_email ?? "");
      setAutoSend(!!settings.email_settings?.auto_send_weekly);
      setNotify({
        student_inactive: settings.notification_prefs?.student_inactive ?? true,
        weekly_summary: settings.notification_prefs?.weekly_summary ?? true,
        mentions: settings.notification_prefs?.mentions ?? false,
      });
    }
  }, [settings]);

  const handleSave = () =>
    save({
      school_name: school || null,
      signature: signature || null,
      email_settings: { sender_email: senderEmail, auto_send_weekly: autoSend },
      notification_prefs: notify,
    });

  if (loading) {
    return <EduLayout><div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></EduLayout>;
  }

  return (
    <EduLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Settings className="h-6 w-6 text-accent" />Configurações EDU</h1>
          <p className="text-sm text-muted-foreground">Personalize sua experiência no painel do professor.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Section icon={User} title="Perfil do professor">
            <Field label="Nome completo"><Input defaultValue={profile?.full_name ?? ""} disabled /></Field>
            <Field label="E-mail"><Input defaultValue={profile?.email ?? ""} disabled /></Field>
            <p className="text-[11px] text-muted-foreground">Edite estes dados em "Perfil" no menu principal.</p>
          </Section>

          <Section icon={School} title="Dados da escola">
            <Field label="Nome da escola"><Input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Ex.: Colégio Aurora" /></Field>
            <p className="text-[11px] text-muted-foreground">Aparecerá no cabeçalho dos relatórios em PDF.</p>
          </Section>

          <Section icon={Mail} title="Envio de relatórios">
            <Field label="E-mail remetente"><Input type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="relatorios@suaescola.com" /></Field>
            <Field label="Assinatura nos relatórios"><Textarea value={signature} onChange={(e) => setSignature(e.target.value)} rows={3} /></Field>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
              <div>
                <p className="text-sm font-semibold text-foreground">Envio automático semanal</p>
                <p className="text-[11px] text-muted-foreground">Envia relatórios todas as sextas-feiras (em breve).</p>
              </div>
              <Switch checked={autoSend} onCheckedChange={setAutoSend} />
            </div>
          </Section>

          <Section icon={Bell} title="Notificações">
            {[
              { key: "student_inactive" as const, label: "Alertas de alunos inativos" },
              { key: "weekly_summary"   as const, label: "Resumo semanal de progresso" },
              { key: "mentions"         as const, label: "Menções em discussões" },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                <p className="text-sm text-foreground">{n.label}</p>
                <Switch checked={notify[n.key]} onCheckedChange={(v) => setNotify({ ...notify, [n.key]: v })} />
              </div>
            ))}
          </Section>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">Salvar configurações</Button>
        </div>
      </div>
    </EduLayout>
  );
};

export default EduConfiguracoes;
