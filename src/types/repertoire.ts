export interface RepertorioCompleto {
  id: string;
  titulo: string;
  autor: string;
  tipo: 'livro' | 'filme' | 'conceito' | 'evento';
  categoria: 'Literatura' | 'Filosofia' | 'Sociologia' | 'História' | 'Artes';
  
  // 1. Resumo estratégico
  contexto: string;
  problemaSocial: string;
  ideiaCentral: string;
  
  // 2. Temas aplicáveis
  temasAplicaveis: string[];
  
  // 3. Estrutura de uso
  estruturaUso: {
    passo1: string;
    passo2: string;
    passo3: string;
    exemplos: string[];
  };
  
  // 4. Parágrafo pronto
  paragrafoPronto: string;
  
  // 5. Frases inteligentes
  frasesInteligentes: string[];
  
  // 6. Conexões
  conexoes: {
    id: string;
    tipo: 'obra' | 'conceito' | 'evento';
    explicacao: string;
  }[];
  
  // 7. Uso estratégico
  melhorPara: ('introducao' | 'desenvolvimento' | 'comparacao')[];
  tiposArgumento: string[];
  
  // 11. Mini desafio
  miniDesafio: {
    pergunta: string;
    respostaExemplo: string;
  };
}

export type MasteryLevel = 'novo' | 'conhecido' | 'entendido' | 'dominado';

export interface RepertoireMasteryState {
  repertoireId: string;
  level: MasteryLevel;
  sectionsExplored: string[];
  challengesCompleted: string[];
  lastAccessed: string;
}
