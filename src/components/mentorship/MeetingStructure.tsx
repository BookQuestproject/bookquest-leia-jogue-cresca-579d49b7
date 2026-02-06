import { CheckCircle } from "lucide-react";

const meetingSteps = [
  {
    title: "Check-in rápido",
    description: "Revisão da semana e desafios enfrentados",
  },
  {
    title: "Análise da leitura",
    description: "O que foi lido e aprendizado principal",
  },
  {
    title: "Ajuste de rotina",
    description: "Identificar o que funcionou e o que precisa mudar",
  },
  {
    title: "Meta da próxima semana",
    description: "Definir compromisso claro e alcançável",
  },
  {
    title: "Orientação prática",
    description: "Dicas personalizadas para manter constância",
  },
];

export const MeetingStructure = () => {
  return (
    <div className="space-y-3">
      {meetingSteps.map((step, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
            <CheckCircle className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-sm">{step.title}</h4>
            <p className="text-xs text-muted-foreground">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
