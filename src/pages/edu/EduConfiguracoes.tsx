import { useState } from "react";
import EduLayout from "./EduLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/hooks/useProfile";
import { Settings, User, School, Mail, Bell, Palette } from "lucide-react";
import { toast } from "sonner";

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <Card className="bg-[hsl(230_50%_10%/0.55)] border-white/[0.06] backdrop-blur-xl">
    <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Icon className="h-4 w-4 text-accent" />{title}</CardTitle></CardHeader>
    <CardContent className="space-y-3">{children}</CardContent>
  </Card>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label><div className="mt-1">{children}</div></div>
);

const EduConfiguracoes = () => {
  const { profile } = useProfile();
  const [name, setName] = useState(profile?.full_name ?? "");
  const [school, setSchool] = useState("");
  const [city, setCity] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [signature, setSignature] = useState("Atenciosamente,\nProfessor(a)");
  const [autoSend, setAutoSend] = useState(false);
  const [notify, setNotify] = useState({ student: true, weekly: true, mention: false });
  const [compact, setCompact] = useState(false);

  const save = () => toast.success("Configurações salvas");

  return (
    <EduLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Settings className="h-6 w-6 text-accent" />Configurações EDU</h1>
          <p className="text-sm text-muted-foreground">Personalize sua experiência no painel do professor.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Section icon={User} title="Perfil do professor">
            <Field label="Nome completo"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Email institucional"><Input type="email" defaultValue={profile?.email ?? ""} /></Field>
          </Section>

          <Section icon={School} title="Dados da escola">
            <Field label="Nome da escola"><Input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Ex.: Colégio Aurora" /></Field>
            <Field label="Cidade / Estado"><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex.: São Paulo, SP" /></Field>
          </Section>

          <Section icon={Mail} title="Envio de relatórios">
            <Field label="Email remetente padrão"><Input type="email" value={reportEmail} onChange={(e) => setReportEmail(e.target.value)} placeholder="relatorios@suaescola.com" /></Field>
            <Field label="Assinatura nos relatórios"><Textarea value={signature} onChange={(e) => setSignature(e.target.value)} rows={3} /></Field>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
              <div>
                <p className="text-sm font-semibold text-foreground">Envio automático semanal</p>
                <p className="text-[11px] text-muted-foreground">Envia relatórios todas as sextas-feiras.</p>
              </div>
              <Switch checked={autoSend} onCheckedChange={setAutoSend} />
            </div>
          </Section>

          <Section icon={Bell} title="Notificações">
            {[
              { key: "student", label: "Alertas de alunos inativos" },
              { key: "weekly",  label: "Resumo semanal de progresso" },
              { key: "mention", label: "Menções em discussões" },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                <p className="text-sm text-foreground">{n.label}</p>
                <Switch checked={(notify as any)[n.key]} onCheckedChange={(v) => setNotify({ ...notify, [n.key]: v })} />
              </div>
            ))}
          </Section>

          <Section icon={Palette} title="Preferências visuais">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
              <div>
                <p className="text-sm font-semibold text-foreground">Modo compacto</p>
                <p className="text-[11px] text-muted-foreground">Mostra mais informação por tela.</p>
              </div>
              <Switch checked={compact} onCheckedChange={setCompact} />
            </div>
          </Section>
        </div>

        <div className="flex justify-end">
          <Button onClick={save} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">Salvar configurações</Button>
        </div>
      </div>
    </EduLayout>
  );
};

export default EduConfiguracoes;
