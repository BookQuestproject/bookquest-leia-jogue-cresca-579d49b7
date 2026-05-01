import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, CheckCircle, Clock, BookOpen, Timer, HelpCircle, Sparkles, AlertCircle, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PostChapterReflection from "@/components/PostChapterReflection";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ChapterContributionDialog } from "@/components/ChapterContributionDialog";
import FinishReadingDialog from "@/components/reading/FinishReadingDialog";
import VocabularyButton from "@/components/reading/VocabularyButton";
import FocusReadingMode from "@/components/reading/FocusReadingMode";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// This would ideally come from a shared data source
const bookData: Record<string, {
  title: string;
  themeColor: string;
  chapters: Array<{
    id: number;
    title: string;
    icon: string;
    totalPages: number;
    question?: {
      text: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    };
  }>;
}> = {
  "harry-potter-1": {
    title: "Harry Potter e a Pedra Filosofal",
    themeColor: "350 45% 32%",
    chapters: [
      {
        id: 1,
        title: "O Menino que Sobreviveu",
        icon: "🏠",
        totalPages: 24,
        question: {
          text: "Por que os Dursley tinham tanto medo de que os vizinhos descobrissem sobre os Potter?",
          options: [
            "Porque os Potter eram criminosos procurados",
            "Porque não queriam ser associados a algo 'anormal'",
            "Porque deviam dinheiro aos Potter",
            "Porque os Potter eram celebridades famosas"
          ],
          correctAnswer: 1,
          explanation: "Os Dursley valorizavam acima de tudo a 'normalidade' e temiam qualquer associação com o mundo mágico."
        }
      },
      { id: 2, title: "O Vidro que Sumiu", icon: "🐍", totalPages: 18, question: {
        text: "O que aconteceu no zoológico que deixou os Dursley furiosos?",
        options: ["Harry comprou um sorvete", "O vidro do terrário da cobra desapareceu", "Harry falou com outros visitantes sobre magia", "Dudley caiu em uma poça"],
        correctAnswer: 1,
        explanation: "Harry involuntariamente fez o vidro do terrário desaparecer, permitindo que a cobra escapasse."
      }},
      { id: 3, title: "As Cartas de Ninguém", icon: "✉️", totalPages: 22, question: {
        text: "Por que o tio Válter tentou impedir Harry de receber as cartas?",
        options: ["As cartas continham ameaças", "Ele sabia que eram de Hogwarts e queria esconder a verdade", "As cartas eram cobranças de dívidas", "Ele achava que eram propagandas"],
        correctAnswer: 1,
        explanation: "Válter sabia que as cartas vinham de Hogwarts e queria impedir Harry de descobrir sobre o mundo bruxo."
      }},
      { id: 4, title: "O Guardião das Chaves", icon: "🗝️", totalPages: 20, question: {
        text: "Quem é o 'Guardião das Chaves' que aparece para Harry?",
        options: ["Dumbledore", "Hagrid", "Snape", "McGonagall"],
        correctAnswer: 1,
        explanation: "Hagrid é o Guardião das Chaves e Terrenos de Hogwarts, e foi ele quem revelou a Harry que ele era um bruxo."
      }},
      { id: 5, title: "O Beco Diagonal", icon: "🏪", totalPages: 28, question: {
        text: "Qual foi a primeira coisa que Harry comprou no Beco Diagonal?",
        options: ["Sua varinha", "Seu uniforme", "Seus livros", "Ele primeiro foi ao Gringotes trocar dinheiro"],
        correctAnswer: 3,
        explanation: "Antes de comprar qualquer material, Harry e Hagrid foram ao banco Gringotes para acessar o cofre dos Potter."
      }},
      { id: 6, title: "A Viagem da Plataforma", icon: "🚂", totalPages: 18, question: {
        text: "Quem ajudou Harry a encontrar a Plataforma 9¾?",
        options: ["Hagrid deixou instruções escritas", "A família Weasley", "Um funcionário do trem", "Ele encontrou sozinho"],
        correctAnswer: 1,
        explanation: "A Sra. Weasley e seus filhos ajudaram Harry a atravessar a barreira para a Plataforma 9¾."
      }},
      { id: 7, title: "O Chapéu Seletor", icon: "🎩", totalPages: 16, question: {
        text: "O que o Chapéu Seletor considerou antes de colocar Harry na Grifinória?",
        options: ["Colocá-lo na Corvinal", "Colocá-lo na Sonserina", "Colocá-lo na Lufa-Lufa", "Não selecioná-lo"],
        correctAnswer: 1,
        explanation: "O Chapéu considerou colocar Harry na Sonserina, mas Harry pediu para não ir para lá."
      }},
      { id: 8, title: "O Mestre das Poções", icon: "⚗️", totalPages: 20, question: {
        text: "Por que Snape parecia não gostar de Harry desde o início?",
        options: ["Harry errou uma poção", "Harry lembrava seu pai, com quem Snape tinha rivalidade", "Harry chegou atrasado na aula", "Harry desrespeitou Snape"],
        correctAnswer: 1,
        explanation: "Snape tinha uma antiga rivalidade com Tiago Potter, pai de Harry, e transferiu esses sentimentos para o filho."
      }},
      { id: 9, title: "O Duelo à Meia-Noite", icon: "⚔️", totalPages: 22, question: {
        text: "Quem desafiou Harry para um duelo à meia-noite?",
        options: ["Rony Weasley", "Neville Longbottom", "Draco Malfoy", "Fred Weasley"],
        correctAnswer: 2,
        explanation: "Draco Malfoy desafiou Harry para um duelo, mas na verdade era uma armadilha para que ele fosse pego fora da cama."
      }},
      { id: 10, title: "O Espelho de Ojesed", icon: "🪞", totalPages: 24, question: {
        text: "O que Harry viu quando olhou no Espelho de Ojesed?",
        options: ["Ele mesmo como capitão de Quadribol", "Sua família, incluindo seus pais", "Dumbledore sorrindo", "O mundo trouxa"],
        correctAnswer: 1,
        explanation: "O Espelho de Ojesed mostra o desejo mais profundo do coração. Harry viu seus pais e sua família ao redor dele."
      }},
    ]
  },
  "percy-jackson-1": {
    title: "Percy Jackson e o Ladrão de Raios",
    themeColor: "210 55% 30%",
    chapters: [
      { id: 1, title: "Eu Vaporizo Minha Professora", icon: "⚡", totalPages: 15, question: {
        text: "O que aconteceu com a Sra. Dodds durante a excursão ao museu?",
        options: ["Ela desmaiou", "Ela se transformou em uma Fúria e atacou Percy", "Ela foi demitida", "Ela desapareceu misteriosamente"],
        correctAnswer: 1,
        explanation: "A Sra. Dodds era na verdade uma Fúria disfarçada e atacou Percy no museu, sendo vaporizada por ele."
      }},
      { id: 2, title: "Três Velhas Tricotando", icon: "🧶", totalPages: 18, question: {
        text: "O que as três velhas tricotando representavam na mitologia?",
        options: ["As Musas", "As Moiras (Parcas), que controlam o destino", "As Harpias", "As Ninfas"],
        correctAnswer: 1,
        explanation: "As três velhas eram as Moiras, que na mitologia grega tecem, medem e cortam o fio da vida de cada pessoa."
      }},
      { id: 3, title: "Grover Perde as Calças", icon: "🐐", totalPages: 20, question: {
        text: "Qual segredo de Grover foi revelado neste capítulo?",
        options: ["Ele era um espião", "Ele era um sátiro com pernas de bode", "Ele podia voar", "Ele era filho de um deus"],
        correctAnswer: 1,
        explanation: "Percy descobriu que Grover era um sátiro — metade humano, metade bode — enviado para protegê-lo."
      }},
    ]
  },
  "dom-casmurro": {
    title: "Dom Casmurro",
    themeColor: "35 40% 28%",
    chapters: [
      { id: 1, title: "Do título", icon: "📜", totalPages: 8, question: {
        text: "Por que o narrador se autodenomina 'Dom Casmurro'?",
        options: ["Era seu nome de batismo", "Foi um apelido dado por um poeta por ele ser fechado e calado", "Era um título de nobreza", "Ele escolheu esse nome por diversão"],
        correctAnswer: 1,
        explanation: "O apelido 'Dom Casmurro' foi dado por um jovem poeta porque Bentinho cochilou durante seus versos no trem."
      }},
      { id: 2, title: "Do livro", icon: "📖", totalPages: 10, question: {
        text: "Qual era a intenção do narrador ao escrever o livro?",
        options: ["Ficar famoso como escritor", "Atar as duas pontas da vida e restaurar a adolescência na velhice", "Denunciar injustiças sociais", "Contar a história de seus pais"],
        correctAnswer: 1,
        explanation: "Bentinho queria reconstruir a casa de Matacavalos e, com ela, reviver as memórias de sua juventude."
      }},
      { id: 3, title: "A denúncia", icon: "🔔", totalPages: 12, question: {
        text: "O que José Dias denunciou a D. Glória?",
        options: ["Que Bentinho estava doente", "Que Bentinho e Capitu estavam sempre juntos e namorando", "Que Bentinho queria fugir de casa", "Que Capitu roubava livros"],
        correctAnswer: 1,
        explanation: "José Dias alertou D. Glória sobre a proximidade entre Bentinho e Capitu, sugerindo que estavam namorando."
      }},
    ]
  },
  "o-pequeno-principe": {
    title: "O Pequeno Príncipe",
    themeColor: "40 65% 45%",
    chapters: [
      { id: 1, title: "O Desenho", icon: "🎨", totalPages: 6, question: { text: "O que os adultos viam no desenho do narrador quando criança?", options: ["Uma jiboia engolindo um elefante", "Um chapéu", "Uma montanha", "Um barco"], correctAnswer: 1, explanation: "Os adultos viam apenas um chapéu, sem perceber que era uma jiboia que engoliu um elefante, mostrando a falta de imaginação dos crescidos." } },
      { id: 2, title: "O Encontro", icon: "⭐", totalPages: 10, question: { text: "Onde o narrador encontrou o Pequeno Príncipe pela primeira vez?", options: ["Em uma floresta encantada", "No deserto do Saara, após uma pane no avião", "Em uma cidade grande", "Em um navio no oceano"], correctAnswer: 1, explanation: "O aviador encontrou o Pequeno Príncipe no deserto do Saara, onde havia feito um pouso forçado." } },
      { id: 3, title: "O Asteroide B-612", icon: "🪐", totalPages: 8, question: { text: "Por que o Pequeno Príncipe precisava cuidar dos baobás em seu asteroide?", options: ["Para ter sombra", "Porque se crescessem, destruiriam o pequeno planeta", "Para colher frutas", "Para decorar o asteroide"], correctAnswer: 1, explanation: "Os baobás, se não arrancados quando pequenos, cresceriam tanto que suas raízes destruiriam o minúsculo asteroide." } },
    ]
  },
  "senhor-dos-aneis": {
    title: "O Senhor dos Anéis",
    themeColor: "25 50% 25%",
    chapters: [
      { id: 1, title: "Uma festa muito esperada", icon: "🎉", totalPages: 30, question: { text: "Por que Bilbo decide deixar o Condado?", options: ["Ele foi expulso pelos hobbits", "Ele queria uma última aventura e sentia o peso do Anel", "Gandalf o obrigou a partir", "Ele precisava devolver o Anel a Sauron"], correctAnswer: 1, explanation: "Bilbo sentia que o Anel estava consumindo-o e desejava partir para uma última jornada, deixando tudo para Frodo." } },
      { id: 2, title: "A sombra do passado", icon: "🌑", totalPages: 28, question: { text: "O que Gandalf revela a Frodo sobre o anel?", options: ["Que é apenas um anel mágico comum", "Que é o Um Anel de Sauron, capaz de controlar todos os outros", "Que pertence aos elfos", "Que deve ser entregue aos anões"], correctAnswer: 1, explanation: "Gandalf revela que o anel de Bilbo é na verdade o Um Anel, forjado por Sauron para dominar todos os povos da Terra-média." } },
      { id: 3, title: "Três é demais", icon: "🚶", totalPages: 24, question: { text: "Quem acompanha Frodo quando ele decide deixar o Condado?", options: ["Gandalf e Aragorn", "Sam e Pippin", "Merry e Legolas", "Bilbo e Gimli"], correctAnswer: 1, explanation: "Sam, o jardineiro fiel de Frodo, e Pippin o acompanham em sua jornada inicial para fora do Condado." } },
    ]
  },
  "orgulho-preconceito": {
    title: "Orgulho e Preconceito",
    themeColor: "340 40% 40%",
    chapters: [
      { id: 1, title: "O baile em Meryton", icon: "💃", totalPages: 20, question: { text: "Qual foi a primeira impressão de Elizabeth sobre Mr. Darcy no baile?", options: ["Ela o achou charmoso e simpático", "Ela o achou orgulhoso e desagradável", "Ela não notou sua presença", "Ela ficou encantada imediatamente"], correctAnswer: 1, explanation: "Elizabeth ouviu Darcy recusar dançar com ela, dizendo que ela não era bonita o suficiente, formando uma impressão negativa." } },
      { id: 2, title: "A visita a Netherfield", icon: "🏠", totalPages: 22, question: { text: "Por que Jane ficou doente em Netherfield?", options: ["Ela comeu algo estragado", "Ela pegou chuva no caminho a cavalo, por insistência da mãe", "Ela estava fingindo para ficar perto de Bingley", "O clima frio a deixou resfriada"], correctAnswer: 1, explanation: "Mrs. Bennet insistiu que Jane fosse a cavalo em vez de carruagem, esperando que a chuva a fizesse ficar em Netherfield — e funcionou." } },
      { id: 3, title: "O pedido de Mr. Collins", icon: "💍", totalPages: 18, question: { text: "Como Elizabeth reagiu ao pedido de casamento de Mr. Collins?", options: ["Aceitou imediatamente", "Recusou firmemente, apesar da pressão da mãe", "Pediu tempo para pensar", "Disse que já estava comprometida"], correctAnswer: 1, explanation: "Elizabeth recusou Collins de forma clara, mesmo com sua mãe insistindo que ela aceitasse por razões financeiras." } },
    ]
  },
  "1984": {
    title: "1984",
    themeColor: "0 0% 25%",
    chapters: [
      { id: 1, title: "O Grande Irmão", icon: "👁️", totalPages: 28, question: { text: "O que significa o slogan 'Guerra é Paz, Liberdade é Escravidão, Ignorância é Força'?", options: ["É um hino patriótico de Oceânia", "São contradições propositais usadas pelo Partido para controlar o pensamento", "São frases motivacionais para os trabalhadores", "É uma piada interna do governo"], correctAnswer: 1, explanation: "Os slogans representam o 'duplipensar' — a capacidade de aceitar duas ideias contraditórias ao mesmo tempo, essencial para o controle do Partido." } },
      { id: 2, title: "O diário proibido", icon: "📓", totalPages: 24, question: { text: "Por que Winston começa a escrever um diário?", options: ["Para registrar o clima", "Como um ato de rebelião pessoal contra o Partido", "Porque era uma tarefa obrigatória", "Para escrever poesia"], correctAnswer: 1, explanation: "Escrever um diário é um ato de 'crimental' (crime de pensamento) — Winston o faz como uma forma silenciosa de resistência ao controle total do Partido." } },
      { id: 3, title: "A Polícia do Pensamento", icon: "🚔", totalPages: 26, question: { text: "O que é a 'Polícia do Pensamento'?", options: ["Uma força policial comum", "Um órgão que monitora e pune cidadãos por pensamentos contrários ao Partido", "Um grupo de psicólogos do governo", "Uma unidade de proteção ao Grande Irmão"], correctAnswer: 1, explanation: "A Polícia do Pensamento usa vigilância constante, incluindo teletelas, para detectar e punir qualquer pensamento desleal ao Partido." } },
    ]
  },
  "e-nao-sobrou-nenhum": {
    title: "E Não Sobrou Nenhum",
    themeColor: "0 45% 30%",
    chapters: [
      { id: 1, title: "O convite misterioso", icon: "✉️", totalPages: 20, question: { text: "O que os dez convidados tinham em comum ao chegar à Ilha do Soldado?", options: ["Todos eram amigos de infância", "Nenhum conhecia pessoalmente o anfitrião que os convidou", "Todos eram detetives famosos", "Todos trabalhavam no mesmo lugar"], correctAnswer: 1, explanation: "Nenhum dos convidados conhecia pessoalmente Mr. Owen, o misterioso anfitrião, cada um recebeu um convite sob circunstâncias diferentes." } },
      { id: 2, title: "A acusação", icon: "🔊", totalPages: 18, question: { text: "O que aconteceu durante o jantar na primeira noite?", options: ["Os convidados brindaram ao anfitrião", "Uma gravação acusou cada convidado de ser responsável por uma morte", "Houve um apagão e alguém gritou", "O anfitrião apareceu e se apresentou"], correctAnswer: 1, explanation: "Uma voz gravada acusou cada um dos dez convidados de ter causado a morte de alguém, chocando todos os presentes." } },
      { id: 3, title: "A primeira morte", icon: "💀", totalPages: 22, question: { text: "Quem foi a primeira vítima na ilha?", options: ["O juiz Wargrave", "Anthony Marston, o jovem imprudente", "A governanta Mrs. Rogers", "O general MacArthur"], correctAnswer: 1, explanation: "Anthony Marston morreu primeiro após beber uma bebida envenenada, cumprindo a primeira estrofe da cantiga dos 'Dez Soldadinhos'." } },
    ]
  },
  "culpa-das-estrelas": {
    title: "A Culpa é das Estrelas",
    themeColor: "200 50% 40%",
    chapters: [
      { id: 1, title: "O grupo de apoio", icon: "💙", totalPages: 24, question: { text: "Como Hazel descreve sua relação com o grupo de apoio no início?", options: ["Ela adora ir e se sente acolhida", "Ela vai por obrigação da mãe e acha deprimente", "Ela é a líder do grupo", "Ela nunca participou antes"], correctAnswer: 1, explanation: "Hazel frequenta o grupo por insistência da mãe e inicialmente o vê como algo entediante e deprimente, até conhecer Augustus." } },
      { id: 2, title: "Augustus Waters", icon: "🚬", totalPages: 22, question: { text: "Qual é o gesto simbólico que Augustus faz com o cigarro?", options: ["Ele fuma para parecer rebelde", "Ele coloca o cigarro na boca mas nunca o acende — é uma metáfora", "Ele oferece cigarros a todos no grupo", "Ele coleciona cigarros como hobby"], correctAnswer: 1, explanation: "Augustus coloca o cigarro entre os lábios sem acender, explicando que é uma metáfora: 'Você coloca a coisa que mata entre os dentes mas não lhe dá o poder de te matar.'" } },
      { id: 3, title: "Uma Aflição Imperial", icon: "📖", totalPages: 26, question: { text: "Por que o livro 'Uma Aflição Imperial' é tão importante para Hazel?", options: ["É o único livro que ela já leu", "Porque retrata honestamente a experiência de viver com câncer", "Porque foi escrito por seu médico", "Porque ganhou o Prêmio Nobel"], correctAnswer: 1, explanation: "Hazel se identifica profundamente com o livro porque ele não romantiza a doença e termina abruptamente, refletindo a realidade imprevisível de viver com câncer." } },
    ]
  },
  "jogos-vorazes": {
    title: "Jogos Vorazes",
    themeColor: "30 60% 35%",
    chapters: [
      { id: 1, title: "O dia da Colheita", icon: "🌾", totalPages: 26, question: { text: "Por que Katniss se voluntariou como tributo?", options: ["Ela queria fama e glória", "Para salvar sua irmã Prim, que foi sorteada", "Porque era obrigatório para os mais velhos", "Ela foi forçada pelo governo"], correctAnswer: 1, explanation: "Quando Primrose Everdeen foi sorteada, Katniss se ofereceu como voluntária para proteger sua irmã mais nova." } },
      { id: 2, title: "A despedida", icon: "👋", totalPages: 22, question: { text: "O que Peeta revelou na entrevista antes dos Jogos?", options: ["Que ele era muito forte", "Que estava apaixonado por Katniss", "Que planejava fugir da arena", "Que conhecia os segredos da Capital"], correctAnswer: 1, explanation: "Peeta declarou publicamente seu amor por Katniss durante a entrevista, criando a narrativa dos 'amantes trágicos' do Distrito 12." } },
      { id: 3, title: "O trem para a Capital", icon: "🚂", totalPages: 28, question: { text: "Quem é Haymitch e qual é seu papel?", options: ["É o presidente dos Jogos", "É o mentor dos tributos do Distrito 12 e ex-vencedor dos Jogos", "É o estilista de Katniss", "É um Pacificador da Capital"], correctAnswer: 1, explanation: "Haymitch Abernathy é o único vencedor vivo dos Jogos Vorazes do Distrito 12 e serve como mentor de Katniss e Peeta." } },
    ]
  },
  "o-hobbit": {
    title: "O Hobbit",
    themeColor: "120 30% 30%",
    chapters: [
      { id: 1, title: "Uma festa inesperada", icon: "🎉", totalPages: 28, question: { text: "O que Gandalf marcou na porta de Bilbo?", options: ["Um aviso de perigo", "Um sinal rúnico significando 'ladrão disponível'", "O nome de Bilbo em élfico", "Um mapa do tesouro"], correctAnswer: 1, explanation: "Gandalf riscou um sinal na porta de Bilbo indicando aos anões que ali morava um 'ladrão' disponível para a aventura." } },
      { id: 2, title: "Carneiro assado", icon: "🍖", totalPages: 22, question: { text: "O que aconteceu quando Bilbo e os anões encontraram os trolls?", options: ["Eles lutaram e venceram facilmente", "Os trolls os capturaram, e Gandalf os salvou fazendo-os discutir até o sol nascer", "Bilbo os enganou sozinho", "Os trolls eram amigáveis"], correctAnswer: 1, explanation: "Gandalf imitou as vozes dos trolls para fazê-los discutir entre si até o amanhecer, quando a luz do sol os transformou em pedra." } },
      { id: 3, title: "Um breve descanso", icon: "🏔️", totalPages: 20, question: { text: "O que Elrond revelou sobre o mapa dos anões em Valfenda?", options: ["Que o mapa era falso", "Que havia letras lunares invisíveis com instruções secretas", "Que o tesouro já havia sido encontrado", "Que Smaug havia morrido"], correctAnswer: 1, explanation: "Elrond descobriu letras lunares no mapa que só podiam ser lidas sob a mesma fase da lua em que foram escritas, revelando instruções para encontrar a porta secreta da Montanha Solitária." } },
    ]
  },
  "sapiens": {
    title: "Sapiens",
    themeColor: "180 30% 30%",
    chapters: [
      { id: 1, title: "Um animal insignificante", icon: "🐒", totalPages: 30, question: { text: "Segundo Harari, o que diferenciou o Homo sapiens das outras espécies humanas?", options: ["A força física superior", "A capacidade de criar ficções e cooperar em grande escala", "A habilidade de usar ferramentas", "A vida em cavernas"], correctAnswer: 1, explanation: "Harari argumenta que a 'Revolução Cognitiva' deu aos Sapiens a capacidade única de criar mitos, permitindo cooperação entre grandes grupos de desconhecidos." } },
      { id: 2, title: "A Árvore do Conhecimento", icon: "🌳", totalPages: 28, question: { text: "O que foi a 'Revolução Cognitiva'?", options: ["A invenção da escrita", "Uma mutação genética que deu aos Sapiens linguagem complexa e pensamento abstrato", "A descoberta do fogo", "A domesticação de animais"], correctAnswer: 1, explanation: "A Revolução Cognitiva, há cerca de 70 mil anos, deu aos Sapiens a capacidade de linguagem ficcional — falar sobre coisas que não existem fisicamente, como deuses, nações e dinheiro." } },
      { id: 3, title: "Um dia na vida de Adão e Eva", icon: "🏕️", totalPages: 26, question: { text: "Como viviam os Sapiens antes da Revolução Agrícola?", options: ["Em grandes cidades organizadas", "Como caçadores-coletores nômades em pequenos grupos", "Em fazendas e plantações", "Em cavernas permanentes sem se mover"], correctAnswer: 1, explanation: "Antes da agricultura, os Sapiens viviam como caçadores-coletores nômades, em grupos de algumas dezenas de pessoas, com dietas variadas e bastante tempo livre." } },
    ]
  },
  "cronicas-narnia": {
    title: "As Crônicas de Nárnia",
    themeColor: "30 45% 35%",
    chapters: [
      { id: 1, title: "Lúcia olha dentro do guarda-roupa", icon: "🚪", totalPages: 18, question: { text: "O que Lúcia encontrou ao entrar no guarda-roupa?", options: ["Uma sala secreta cheia de tesouros", "Um mundo coberto de neve — Nárnia", "Outro quarto da casa", "Um túnel escuro e perigoso"], correctAnswer: 1, explanation: "Lúcia atravessou os casacos do guarda-roupa e descobriu o mundo mágico de Nárnia, coberto por um inverno eterno." } },
      { id: 2, title: "O que Lúcia encontrou lá", icon: "🐐", totalPages: 20, question: { text: "Quem Lúcia encontrou em Nárnia?", options: ["Um dragão feroz", "O fauno Tumnus, que a convidou para tomar chá", "A Feiticeira Branca", "Aslam, o grande leão"], correctAnswer: 1, explanation: "Lúcia conheceu o Sr. Tumnus, um fauno simpático que a convidou para sua caverna para tomar chá e contar histórias." } },
      { id: 3, title: "Edmundo e o guarda-roupa", icon: "🍬", totalPages: 18, question: { text: "O que a Feiticeira Branca ofereceu a Edmundo?", options: ["Ouro e joias", "Manjar turco encantado e a promessa de fazê-lo rei", "Uma espada mágica", "Um mapa de Nárnia"], correctAnswer: 1, explanation: "A Feiticeira Branca seduziu Edmundo com manjar turco enfeitiçado e a promessa de torná-lo rei de Nárnia, em troca de trazer seus irmãos." } },
    ]
  },
  "nome-do-vento": {
    title: "O Nome do Vento",
    themeColor: "210 40% 35%",
    chapters: [
      { id: 1, title: "Um silêncio triplo", icon: "🤫", totalPages: 16, question: { text: "O que o 'silêncio triplo' no início do livro sugere sobre Kvothe?", options: ["Que ele é surdo", "Que ele vive uma vida pacífica e sem história", "Que ele é um homem escondendo um passado extraordinário", "Que a taverna está fechada"], correctAnswer: 2, explanation: "O silêncio triplo sugere que Kote (Kvothe) é um homem que carrega o peso de um passado lendário, agora escondido como um simples taberneiro." } },
      { id: 2, title: "Uma beleza a ser destruída", icon: "🕯️", totalPages: 20, question: { text: "Por que Kvothe decide contar sua história ao Cronista?", options: ["Para ficar famoso", "Para que a verdade seja registrada antes que os mitos a distorçam completamente", "Porque o Cronista o pagou", "Para se vingar de seus inimigos"], correctAnswer: 1, explanation: "Kvothe aceita contar sua história para que o Cronista registre a verdade, já que as lendas sobre ele se tornaram exageradas e imprecisas." } },
      { id: 3, title: "Madeira e palavra", icon: "📜", totalPages: 22, question: { text: "Qual era a profissão da família de Kvothe?", options: ["Eram ferreiros", "Eram artistas itinerantes — a trupe Edema Ruh", "Eram comerciantes ricos", "Eram soldados do rei"], correctAnswer: 1, explanation: "Kvothe cresceu como parte dos Edema Ruh, uma trupe de artistas itinerantes conhecidos por suas performances musicais e teatrais." } },
    ]
  },
  "garota-no-trem": {
    title: "A Garota no Trem",
    themeColor: "220 35% 30%",
    chapters: [
      { id: 1, title: "Rachel – A observadora", icon: "👀", totalPages: 28, question: { text: "O que Rachel fazia todos os dias durante a viagem de trem?", options: ["Lia livros para passar o tempo", "Observava um casal 'perfeito' em uma casa ao lado dos trilhos", "Dormia durante todo o trajeto", "Fotografava a paisagem"], correctAnswer: 1, explanation: "Rachel observava obsessivamente um casal que morava em uma casa visível dos trilhos, criando fantasias sobre suas vidas perfeitas." } },
      { id: 2, title: "Megan – O segredo", icon: "🤐", totalPages: 24, question: { text: "O que torna a narrativa de Megan diferente?", options: ["Ela narra do futuro", "Sua versão dos eventos revela que a vida 'perfeita' que Rachel imaginava era uma mentira", "Ela é uma detetive investigando o caso", "Ela não tem relação com Rachel"], correctAnswer: 1, explanation: "Os capítulos de Megan mostram que por trás da fachada perfeita havia segredos, insatisfação e uma vida completamente diferente do que Rachel imaginava." } },
      { id: 3, title: "Anna – A outra mulher", icon: "💔", totalPages: 26, question: { text: "Qual é a relação de Anna com Rachel?", options: ["São amigas de infância", "Anna é a atual esposa do ex-marido de Rachel", "São colegas de trabalho", "Não se conhecem"], correctAnswer: 1, explanation: "Anna se casou com Tom, o ex-marido de Rachel, e agora vive na casa que Rachel costumava chamar de lar, criando uma dinâmica tensa entre as três mulheres." } },
    ]
  },
  "gone-girl": {
    title: "Gone Girl",
    themeColor: "350 30% 28%",
    chapters: [
      { id: 1, title: "O garoto conhece a garota", icon: "💑", totalPages: 22, question: { text: "O que acontece no quinto aniversário de casamento de Nick e Amy?", options: ["Eles fazem uma viagem romântica", "Amy desaparece misteriosamente", "Eles fazem uma festa surpresa", "Nick pede o divórcio"], correctAnswer: 1, explanation: "No quinto aniversário de casamento, Amy desaparece e sinais de luta são encontrados em casa, tornando Nick o principal suspeito." } },
      { id: 2, title: "O diário de Amy", icon: "📔", totalPages: 24, question: { text: "O que o diário de Amy revela inicialmente?", options: ["Que Amy era muito feliz", "Uma história de amor que se deteriora com medo e desconfiança em relação a Nick", "Que Amy planejava uma viagem", "Que Nick era o marido perfeito"], correctAnswer: 1, explanation: "O diário pinta um quadro de deterioração do casamento, com Amy expressando medo crescente de Nick, criando uma narrativa que o incrimina." } },
      { id: 3, title: "As aparências enganam", icon: "🎭", totalPages: 26, question: { text: "Por que a mídia se volta contra Nick?", options: ["Ele confessou o crime", "Seu comportamento inadequado e sorriso em fotos fazem-no parecer culpado", "A polícia divulgou provas contra ele", "Amy enviou uma carta acusando-o"], correctAnswer: 1, explanation: "Nick é fotografado sorrindo ao lado do cartaz de Amy desaparecida, e seu comportamento aparentemente frio faz a opinião pública e a mídia presumirem sua culpa." } },
    ]
  },
  "codigo-da-vinci": {
    title: "O Código Da Vinci",
    themeColor: "45 40% 30%",
    chapters: [
      { id: 1, title: "O assassinato no Louvre", icon: "🖼️", totalPages: 20, question: { text: "O que o curador Jacques Saunière fez antes de morrer?", options: ["Ligou para a polícia", "Posicionou seu corpo como o Homem Vitruviano e deixou pistas codificadas", "Escondeu a Mona Lisa", "Escreveu um testamento"], correctAnswer: 1, explanation: "Saunière usou seus últimos momentos para arranjar seu corpo como o Homem Vitruviano de Da Vinci e deixar mensagens cifradas para Robert Langdon." } },
      { id: 2, title: "A cifra de Saunière", icon: "🔢", totalPages: 18, question: { text: "O que a sequência numérica deixada por Saunière significava?", options: ["Um número de telefone", "A sequência de Fibonacci reorganizada como uma pista", "Coordenadas GPS do tesouro", "Uma senha de computador"], correctAnswer: 1, explanation: "Os números eram a sequência de Fibonacci fora de ordem, uma pista intencional de Saunière indicando que as mensagens deveriam ser decodificadas." } },
      { id: 3, title: "Sophie Neveu", icon: "👩", totalPages: 22, question: { text: "Qual é a relação de Sophie com o curador assassinado?", options: ["Era sua aluna na universidade", "Era sua neta, mas estavam afastados por um segredo do passado", "Era uma policial designada para o caso", "Não tinham relação alguma"], correctAnswer: 1, explanation: "Sophie era neta de Saunière, mas se afastou dele após testemunhar uma cerimônia secreta que não compreendeu, gerando anos de silêncio entre eles." } },
    ]
  },
  "sherlock-holmes": {
    title: "Sherlock Holmes - Obra Completa",
    themeColor: "200 25% 28%",
    chapters: [
      { id: 1, title: "Um Estudo em Vermelho", icon: "🔴", totalPages: 30, question: { text: "Como Watson e Holmes se conheceram?", options: ["Eram vizinhos de infância", "Foram apresentados por um colega porque ambos precisavam dividir um apartamento", "Holmes o contratou como assistente", "Se encontraram em uma cena de crime"], correctAnswer: 1, explanation: "Watson, recém-voltado da guerra, precisava de um lugar para morar e foi apresentado a Holmes por Stamford, pois Holmes também buscava alguém para dividir o aluguel do 221B Baker Street." } },
      { id: 2, title: "A ciência da dedução", icon: "🔬", totalPages: 24, question: { text: "O que impressiona Watson sobre Holmes logo no início?", options: ["Sua força física", "Sua capacidade de deduzir detalhes pessoais apenas observando alguém", "Sua coleção de livros", "Sua riqueza"], correctAnswer: 1, explanation: "Holmes demonstra sua habilidade extraordinária de dedução ao revelar detalhes sobre a vida de Watson apenas observando-o, impressionando profundamente o doutor." } },
      { id: 3, title: "O mistério de Lauriston Gardens", icon: "🏚️", totalPages: 28, question: { text: "O que Holmes encontrou na cena do crime que a polícia ignorou?", options: ["Uma arma do crime", "A palavra 'RACHE' escrita em sangue na parede", "Impressões digitais no vidro", "Um bilhete com o nome do assassino"], correctAnswer: 1, explanation: "Holmes encontrou a palavra 'RACHE' (vingança em alemão) escrita em sangue, enquanto a polícia pensava que era um nome inacabado." } },
    ]
  },
  "como-eu-era-antes": {
    title: "Como Eu Era Antes de Você",
    themeColor: "330 45% 45%",
    chapters: [
      { id: 1, title: "Louisa perde o emprego", icon: "☕", totalPages: 24, question: { text: "Por que Louisa Clark aceita o emprego de cuidadora de Will Traynor?", options: ["Ela sempre sonhou em ser enfermeira", "Ela estava desempregada e precisava do dinheiro", "Will era seu amigo de infância", "Ela foi obrigada pela família dele"], correctAnswer: 1, explanation: "Louisa havia perdido seu emprego no café e aceitou o trabalho com Will por necessidade financeira, sem saber exatamente o que esperar." } },
      { id: 2, title: "Will Traynor", icon: "♿", totalPages: 22, question: { text: "Como era a vida de Will antes do acidente?", options: ["Ele sempre foi reservado e caseiro", "Era um homem aventureiro, bem-sucedido e cheio de energia", "Era estudante universitário", "Era médico"], correctAnswer: 1, explanation: "Will era um empresário aventureiro que amava esportes radicais, viagens e uma vida intensa antes de ficar tetraplégico após ser atropelado por uma moto." } },
      { id: 3, title: "Rotina e resistência", icon: "🔄", totalPages: 26, question: { text: "Como Will trata Louisa no início?", options: ["Com carinho e gentileza", "Com sarcasmo e frieza, testando seus limites", "Com total indiferença", "Como uma amiga de longa data"], correctAnswer: 1, explanation: "Will inicialmente trata Louisa com sarcasmo e distância, testando-a para ver se ela desistiria como cuidadoras anteriores." } },
    ]
  },
  "poder-do-habito": {
    title: "O Poder do Hábito",
    themeColor: "260 35% 35%",
    chapters: [
      { id: 1, title: "O loop do hábito", icon: "🔁", totalPages: 34, question: { text: "Quais são os três componentes do 'loop do hábito'?", options: ["Motivação, ação e recompensa", "Deixa (gatilho), rotina e recompensa", "Planejamento, execução e reflexão", "Desejo, tentativa e fracasso"], correctAnswer: 1, explanation: "O loop do hábito consiste em uma deixa (gatilho que inicia o comportamento), uma rotina (o comportamento em si) e uma recompensa (o benefício que reforça o hábito)." } },
      { id: 2, title: "O cérebro ansioso", icon: "🧠", totalPages: 30, question: { text: "Qual é o papel dos gânglios basais nos hábitos?", options: ["Eles controlam as emoções", "Eles armazenam padrões de hábitos para que o cérebro economize energia", "Eles são responsáveis pela memória de longo prazo", "Eles controlam o movimento voluntário"], correctAnswer: 1, explanation: "Os gânglios basais transformam comportamentos repetidos em rotinas automáticas, permitindo que o cérebro funcione no 'piloto automático' e economize energia mental." } },
      { id: 3, title: "A regra de ouro da mudança", icon: "🏆", totalPages: 32, question: { text: "Qual é a 'regra de ouro' para mudar um hábito?", options: ["Eliminar completamente o hábito antigo", "Manter a deixa e a recompensa, mas mudar a rotina", "Substituir a recompensa por uma punição", "Ignorar o hábito até ele desaparecer"], correctAnswer: 1, explanation: "A regra de ouro é manter o mesmo gatilho e a mesma recompensa, mas substituir a rotina por um comportamento mais saudável ou desejado." } },
    ]
  },
  "mindset": {
    title: "Mindset",
    themeColor: "170 35% 35%",
    chapters: [
      { id: 1, title: "Os dois mindsets", icon: "🧠", totalPages: 32, question: { text: "Qual é a diferença entre mindset fixo e mindset de crescimento?", options: ["Fixo é pessimista e crescimento é otimista", "Fixo acredita que habilidades são inatas; crescimento acredita que podem ser desenvolvidas", "Fixo é para adultos e crescimento é para crianças", "Não há diferença real entre os dois"], correctAnswer: 1, explanation: "O mindset fixo acredita que inteligência e talento são qualidades inatas e imutáveis, enquanto o mindset de crescimento acredita que podem ser desenvolvidos com esforço e aprendizado." } },
      { id: 2, title: "Por dentro dos mindsets", icon: "🔍", totalPages: 28, question: { text: "Como uma pessoa com mindset fixo reage ao fracasso?", options: ["Vê como oportunidade de aprendizado", "Vê como prova de que não é talentosa o suficiente", "Ignora completamente", "Celebra o fracasso"], correctAnswer: 1, explanation: "No mindset fixo, o fracasso não é visto como uma ação (eu falhei), mas como uma identidade (eu sou um fracasso), gerando medo de tentar coisas novas." } },
      { id: 3, title: "A verdade sobre habilidade", icon: "💡", totalPages: 30, question: { text: "O que a pesquisa de Dweck mostrou sobre elogiar crianças?", options: ["Elogiar sempre é positivo", "Elogiar o esforço é mais eficaz do que elogiar a inteligência", "Nunca se deve elogiar crianças", "O tipo de elogio não faz diferença"], correctAnswer: 1, explanation: "Dweck descobriu que crianças elogiadas por seu esforço tendem a buscar desafios maiores, enquanto as elogiadas por sua inteligência evitam riscos por medo de parecerem menos inteligentes." } },
    ]
  },
  "maze-runner": {
    title: "Maze Runner - Correr ou Morrer",
    themeColor: "150 30% 28%",
    chapters: [
      { id: 1, title: "A Caixa", icon: "📦", totalPages: 22, question: { text: "O que Thomas lembrava quando chegou à Clareira?", options: ["Toda a sua vida antes da Clareira", "Apenas seu nome — nada mais", "O rosto de sua família", "Como ele chegou ali"], correctAnswer: 1, explanation: "Thomas acordou na Caixa sem memórias, sabendo apenas seu primeiro nome. Todas as outras lembranças haviam sido apagadas." } },
      { id: 2, title: "A Clareira", icon: "🏕️", totalPages: 24, question: { text: "O que é a Clareira?", options: ["Uma cidade subterrânea", "Um espaço aberto cercado por enormes muros de um labirinto", "Uma floresta encantada", "Uma prisão do governo"], correctAnswer: 1, explanation: "A Clareira é um espaço aberto no centro de um labirinto gigante, onde dezenas de garotos vivem organizados em uma comunidade autossuficiente." } },
      { id: 3, title: "As regras dos Clareianos", icon: "📋", totalPages: 20, question: { text: "Qual é a regra mais importante da Clareira?", options: ["Nunca falar sobre o labirinto", "Nunca entrar no labirinto a menos que seja um Corredor", "Nunca dormir ao ar livre", "Nunca comer sozinho"], correctAnswer: 1, explanation: "A regra principal é que apenas os Corredores têm permissão para entrar no labirinto, pois os perigos lá dentro — especialmente os Verdejantes — são letais." } },
    ]
  },
  "divergente": {
    title: "Divergente",
    themeColor: "15 55% 35%",
    chapters: [
      { id: 1, title: "O teste de aptidão", icon: "💉", totalPages: 24, question: { text: "Por que o resultado do teste de Tris foi considerado perigoso?", options: ["Ela não teve resultado nenhum", "Ela teve aptidão para múltiplas facções — ela é Divergente", "Ela foi aprovada para a facção errada", "O teste deu erro técnico"], correctAnswer: 1, explanation: "Tris mostrou aptidão para mais de uma facção, o que a classificou como 'Divergente' — algo considerado perigoso pelo sistema de controle." } },
      { id: 2, title: "O dia da Escolha", icon: "🩸", totalPages: 22, question: { text: "Qual facção Tris escolheu no dia da Cerimônia?", options: ["Abnegação, sua facção de origem", "Audácia, deixando sua família para trás", "Erudição, para buscar conhecimento", "Amizade, para viver em paz"], correctAnswer: 1, explanation: "Tris surpreendeu todos ao escolher a Audácia em vez de permanecer na Abnegação, significando que ela deixaria sua família." } },
      { id: 3, title: "A iniciação na Audácia", icon: "🏋️", totalPages: 26, question: { text: "Qual foi o primeiro teste de coragem que os iniciados da Audácia enfrentaram?", options: ["Uma luta entre eles", "Saltar de um trem em movimento e de um prédio alto", "Nadar em águas geladas", "Escalar uma montanha sem equipamento"], correctAnswer: 1, explanation: "Os iniciados tiveram que pular de um trem em movimento e depois saltar de um prédio alto para um buraco escuro, sem saber o que havia embaixo." } },
    ]
  },
  "aventuras-de-pi": {
    title: "As Aventuras de Pi",
    themeColor: "200 45% 40%",
    chapters: [
      { id: 1, title: "O zoológico de Pondicherry", icon: "🦁", totalPages: 26, question: { text: "Por que Pi recebeu esse nome incomum?", options: ["Era uma tradição familiar", "Seu nome vem de uma piscina famosa em Paris — Piscine Molitor", "Ele escolheu o nome quando criança", "Foi um erro no registro de nascimento"], correctAnswer: 1, explanation: "Pi se chama Piscine Molitor Patel, nome dado em homenagem a uma piscina em Paris. Ele adotou o apelido 'Pi' para evitar ser chamado de 'mijo' na escola." } },
      { id: 2, title: "As três religiões de Pi", icon: "🙏", totalPages: 22, question: { text: "O que torna a fé de Pi única?", options: ["Ele é ateu convicto", "Ele pratica hinduísmo, cristianismo e islamismo ao mesmo tempo", "Ele inventou sua própria religião", "Ele não acredita em nada"], correctAnswer: 1, explanation: "Pi abraça simultaneamente três religiões — hinduísmo, cristianismo e islamismo — vendo em cada uma delas uma perspectiva diferente sobre Deus e a vida." } },
      { id: 3, title: "O naufrágio", icon: "🚢", totalPages: 28, question: { text: "Com quem Pi ficou preso no bote salva-vidas?", options: ["Sua família inteira", "Um tigre-de-bengala chamado Richard Parker", "Outros passageiros do navio", "Ninguém — ele estava sozinho"], correctAnswer: 1, explanation: "Após o naufrágio, Pi ficou preso em um bote salva-vidas com Richard Parker, um tigre-de-bengala de 200 kg do zoológico de seu pai." } },
    ]
  },
  "ilha-do-tesouro": {
    title: "A Ilha do Tesouro",
    themeColor: "25 45% 30%",
    chapters: [
      { id: 1, title: "O velho marinheiro", icon: "🧭", totalPages: 22, question: { text: "O que Billy Bones trouxe consigo para a estalagem do pai de Jim?", options: ["Um papagaio falante", "Um velho baú de marinheiro com um mapa do tesouro dentro", "Uma espada encantada", "Um barco miniatura"], correctAnswer: 1, explanation: "Billy Bones chegou à estalagem carregando um grande baú de marinheiro que continha, entre outras coisas, o mapa da Ilha do Tesouro." } },
      { id: 2, title: "O Cão Negro", icon: "🐕", totalPages: 18, question: { text: "Quem era o Cão Negro?", options: ["O cachorro de estimação de Jim", "Um pirata que veio procurar Billy Bones na estalagem", "Um apelido para o navio dos piratas", "Um personagem fictício das histórias de Bones"], correctAnswer: 1, explanation: "Cão Negro era um ex-pirata que apareceu na estalagem procurando Billy Bones, resultando em uma violenta briga entre os dois." } },
      { id: 3, title: "A marca negra", icon: "⚫", totalPages: 20, question: { text: "O que é a 'marca negra' na história?", options: ["Uma mancha no mapa do tesouro", "Um aviso pirata significando que alguém foi condenado à morte", "Um tipo de moeda pirata", "Uma tatuagem de identificação"], correctAnswer: 1, explanation: "A marca negra é um sinal pirata — um pedaço de papel com um lado escurecido — entregue como aviso de que o destinatário está condenado ou será cobrado." } },
    ]
  },
  "20000-leguas": {
    title: "20.000 Léguas Submarinas",
    themeColor: "195 50% 30%",
    chapters: [
      { id: 1, title: "O monstro marinho", icon: "🐙", totalPages: 24, question: { text: "O que as pessoas acreditavam ser o 'monstro' que atacava navios?", options: ["Um kraken gigante", "Uma criatura marinha desconhecida de proporções enormes", "Um navio pirata disfarçado", "Uma baleia mutante"], correctAnswer: 1, explanation: "Relatos de diversos navios descreviam uma criatura luminosa e enorme nos oceanos, que na verdade era o submarino Nautilus do Capitão Nemo." } },
      { id: 2, title: "A expedição", icon: "⚓", totalPages: 22, question: { text: "Quem foi enviado para investigar o monstro?", options: ["A Marinha Real Britânica", "O Professor Aronnax, um naturalista francês, a bordo do Abraham Lincoln", "Um grupo de caçadores de baleias", "Uma equipe de cientistas russos"], correctAnswer: 1, explanation: "O Professor Pierre Aronnax, especialista em vida marinha, foi convidado a participar da expedição a bordo da fragata Abraham Lincoln." } },
      { id: 3, title: "O Nautilus", icon: "🚢", totalPages: 26, question: { text: "O que surpreendeu Aronnax ao descobrir a verdade sobre o 'monstro'?", options: ["Era um animal pré-histórico", "Era um submarino tecnologicamente avançado, muito além de sua época", "Era um fenômeno natural", "Era uma ilusão coletiva"], correctAnswer: 1, explanation: "Aronnax ficou maravilhado ao descobrir que o 'monstro' era o Nautilus, um submarino com tecnologia impossível para a época, comandado pelo enigmático Capitão Nemo." } },
    ]
  },
  "rapido-devagar": {
    title: "Rápido e Devagar",
    themeColor: "220 30% 35%",
    chapters: [
      { id: 1, title: "Os dois sistemas", icon: "⚡", totalPages: 28, question: { text: "Qual a diferença entre o Sistema 1 e o Sistema 2 do pensamento?", options: ["Sistema 1 é lógico e Sistema 2 é emocional", "Sistema 1 é rápido e intuitivo; Sistema 2 é lento e deliberado", "Sistema 1 é usado por crianças e Sistema 2 por adultos", "Não há diferença prática entre eles"], correctAnswer: 1, explanation: "O Sistema 1 opera de forma automática e rápida, com pouco esforço. O Sistema 2 aloca atenção para atividades mentais trabalhosas e complexas." } },
      { id: 2, title: "Atenção e esforço", icon: "🎯", totalPages: 26, question: { text: "Por que o Sistema 2 é 'preguiçoso'?", options: ["Porque não funciona direito", "Porque usar pensamento deliberado exige muito esforço mental, e o cérebro prefere economizar energia", "Porque só funciona quando dormimos", "Porque foi desativado pela evolução"], correctAnswer: 1, explanation: "O Sistema 2 requer esforço mental significativo, então o cérebro tende a confiar no Sistema 1 (automático) sempre que possível para conservar energia cognitiva." } },
      { id: 3, title: "O controlador preguiçoso", icon: "😴", totalPages: 30, question: { text: "O que acontece quando o Sistema 2 está ocupado?", options: ["O cérebro desliga completamente", "O Sistema 1 assume e pode cometer erros de julgamento", "Nada diferente acontece", "O corpo entra em modo de descanso"], correctAnswer: 1, explanation: "Quando o Sistema 2 está sobrecarregado (como ao fazer cálculos difíceis), o Sistema 1 assume decisões, tornando a pessoa mais suscetível a impulsos e erros de julgamento." } },
    ]
  },
  "breve-historia-tempo": {
    title: "Uma Breve História do Tempo",
    themeColor: "240 30% 25%",
    chapters: [
      { id: 1, title: "Nossa imagem do universo", icon: "🌍", totalPages: 26, question: { text: "Qual é a famosa anedota que Hawking usa para abrir o livro?", options: ["A maçã de Newton", "A história da senhora que disse que o mundo fica em cima de uma tartaruga", "O sonho de Einstein", "A queda de Galileu da Torre de Pisa"], correctAnswer: 1, explanation: "Hawking abre o livro com a história de uma senhora que, após uma palestra, afirmou que o mundo fica sobre as costas de uma tartaruga, e 'são tartarugas até o fim'." } },
      { id: 2, title: "Espaço e tempo", icon: "⏰", totalPages: 28, question: { text: "O que Einstein mostrou sobre espaço e tempo?", options: ["Que são conceitos separados e independentes", "Que são entrelaçados em um tecido único — o espaço-tempo", "Que o tempo não existe", "Que o espaço é infinito e imutável"], correctAnswer: 1, explanation: "Einstein demonstrou que espaço e tempo não são independentes, mas formam um continuum chamado espaço-tempo, que pode ser deformado pela gravidade." } },
      { id: 3, title: "O universo em expansão", icon: "💫", totalPages: 24, question: { text: "Como sabemos que o universo está se expandindo?", options: ["Podemos ver o limite do universo", "Porque as galáxias estão se afastando umas das outras — detectado pelo desvio para o vermelho", "Porque novos planetas estão sendo criados", "Foi uma suposição sem evidência"], correctAnswer: 1, explanation: "Edwin Hubble observou que a luz de galáxias distantes tem um desvio para o vermelho (redshift), indicando que estão se afastando de nós — e quanto mais distantes, mais rápido se afastam." } },
    ]
  },
  "me-chame-pelo-seu-nome": {
    title: "Me Chame Pelo Seu Nome",
    themeColor: "30 50% 45%",
    chapters: [
      { id: 1, title: "A chegada de Oliver", icon: "☀️", totalPages: 30, question: { text: "Qual foi a primeira impressão de Elio sobre Oliver?", options: ["Ele o adorou imediatamente", "Ele sentiu uma mistura de fascínio e irritação com sua confiança", "Ele o ignorou completamente", "Eles se tornaram melhores amigos na hora"], correctAnswer: 1, explanation: "Elio ficou intrigado e levemente irritado com a autoconfiança e o jeito despreocupado de Oliver, especialmente seu hábito de dizer 'Later!'." } },
      { id: 2, title: "O verão italiano", icon: "🌻", totalPages: 28, question: { text: "Qual é o cenário do romance entre Elio e Oliver?", options: ["Uma grande cidade americana", "Uma vila no litoral da Itália durante o verão", "Uma universidade em Paris", "Uma pequena cidade na Inglaterra"], correctAnswer: 1, explanation: "A história se passa durante um verão na Riviera Italiana, na casa de veraneio da família de Elio, onde Oliver está como hóspede acadêmico do pai de Elio." } },
      { id: 3, title: "A muralha do silêncio", icon: "🤐", totalPages: 26, question: { text: "Por que Elio e Oliver evitam falar sobre seus sentimentos?", options: ["Eles não se gostam", "Ambos têm medo da rejeição e das consequências de admitir seus sentimentos", "Eles não falam a mesma língua", "As famílias proibiram a amizade"], correctAnswer: 1, explanation: "Ambos sentem uma atração crescente mas temem a vulnerabilidade da confissão, criando uma tensão prolongada de gestos não-ditos e olhares carregados." } },
    ]
  },
  "anna-karenina": {
    title: "Anna Karenina",
    themeColor: "350 35% 30%",
    chapters: [
      { id: 1, title: "Todas as famílias felizes", icon: "👪", totalPages: 22, question: { text: "Qual é a famosa frase de abertura de Anna Karenina?", options: ["Era o melhor dos tempos, era o pior dos tempos", "Todas as famílias felizes se parecem; cada família infeliz é infeliz à sua maneira", "Chame-me Ismael", "Em algum lugar da Mancha"], correctAnswer: 1, explanation: "A frase de abertura é uma das mais famosas da literatura: 'Todas as famílias felizes se parecem, cada família infeliz é infeliz à sua maneira.'" } },
      { id: 2, title: "A crise dos Oblonsky", icon: "💔", totalPages: 24, question: { text: "Por que Anna viaja para Moscou no início do romance?", options: ["Para fazer compras", "Para tentar reconciliar o casamento de seu irmão Oblonsky", "Para fugir de seu marido", "Para visitar amigos"], correctAnswer: 1, explanation: "Anna vai a Moscou para ajudar a salvar o casamento de seu irmão Stiva Oblonsky, que foi pego em uma traição por sua esposa Dolly." } },
      { id: 3, title: "A chegada de Anna", icon: "🚂", totalPages: 20, question: { text: "Onde Anna conhece Vronsky pela primeira vez?", options: ["Em um baile em São Petersburgo", "Na estação de trem em Moscou", "Em uma ópera", "Na casa dos Oblonsky"], correctAnswer: 1, explanation: "Anna e Vronsky se encontram pela primeira vez na estação de trem em Moscou, um encontro marcado por uma atração imediata e pelo presságio sombrio de um acidente ferroviário." } },
    ]
  },
  "morro-ventos-uivantes": {
    title: "O Morro dos Ventos Uivantes",
    themeColor: "270 25% 30%",
    chapters: [
      { id: 1, title: "A visita a Morro dos Ventos", icon: "🏚️", totalPages: 24, question: { text: "Qual foi a primeira impressão de Lockwood ao visitar o Morro dos Ventos Uivantes?", options: ["Era um lugar acolhedor e alegre", "Era um lugar hostil e sombrio, com moradores rudes", "Era uma mansão luxuosa", "Estava abandonado e vazio"], correctAnswer: 1, explanation: "Lockwood encontrou um ambiente hostil e sombrio, com Heathcliff sendo rude e os cães ameaçadores, criando uma atmosfera de desconforto." } },
      { id: 2, title: "A tempestade", icon: "⛈️", totalPages: 22, question: { text: "O que Lockwood experimentou durante a noite que passou no Morro?", options: ["Dormiu tranquilamente", "Teve uma visão aterrorizante do fantasma de Catherine na janela", "Ouviu música vinda do porão", "Foi atacado por um intruso"], correctAnswer: 1, explanation: "Lockwood foi aterrorizado por um sonho (ou visão) no qual o fantasma de Catherine Earnshaw tentava entrar pela janela, implorando para ser deixada entrar." } },
      { id: 3, title: "A história de Nelly", icon: "📖", totalPages: 28, question: { text: "Quem era Nelly Dean?", options: ["A esposa de Heathcliff", "A empregada que conhecia toda a história da família Earnshaw e dos Linton", "Uma vizinha curiosa", "A mãe de Catherine"], correctAnswer: 1, explanation: "Nelly Dean era a empregada da família que serviu como narradora principal, contando a Lockwood toda a trágica história de Heathcliff e Catherine." } },
    ]
  },
  "silencio-inocentes": {
    title: "O Silêncio dos Inocentes",
    themeColor: "0 30% 25%",
    chapters: [
      { id: 1, title: "A estagiária do FBI", icon: "🔍", totalPages: 24, question: { text: "Por que Clarice Starling foi enviada para entrevistar Hannibal Lecter?", options: ["Ela era a agente mais experiente", "Jack Crawford queria usar seu perfil psicológico para extrair informações de Lecter", "Lecter pediu especificamente por ela", "Foi um erro administrativo"], correctAnswer: 1, explanation: "Crawford enviou Clarice, ainda estagiária, porque acreditava que seu perfil — jovem, inteligente e vulnerável — poderia despertar o interesse de Lecter e fazê-lo cooperar." } },
      { id: 2, title: "O encontro com Lecter", icon: "🦷", totalPages: 26, question: { text: "O que Lecter pediu em troca de suas informações?", options: ["Liberdade imediata", "Que Clarice compartilhasse detalhes pessoais de sua vida — quid pro quo", "Dinheiro e privilégios na prisão", "Transferência para outra prisão"], correctAnswer: 1, explanation: "Lecter propôs 'quid pro quo' — ele daria pistas sobre Buffalo Bill se Clarice revelasse memórias e detalhes pessoais dolorosos de sua própria vida." } },
      { id: 3, title: "Quid pro quo", icon: "🤝", totalPages: 22, question: { text: "Qual trauma de infância Clarice revelou a Lecter?", options: ["A morte de seu pet", "A morte de seu pai e o trauma dos cordeiros sendo abatidos na fazenda", "Um acidente de carro", "Bullying na escola"], correctAnswer: 1, explanation: "Clarice revelou que após a morte de seu pai, ela viveu em uma fazenda onde ouviu os gritos dos cordeiros sendo abatidos, um trauma que a assombra — o 'silêncio dos inocentes'." } },
    ]
  },
  "gene-egoista": {
    title: "O Gene Egoísta",
    themeColor: "140 35% 30%",
    chapters: [
      { id: 1, title: "Por que as pessoas existem?", icon: "❓", totalPages: 28, question: { text: "Qual é a ideia central de Dawkins sobre a evolução?", options: ["Os organismos evoluem para o bem da espécie", "Os genes são as unidades fundamentais da seleção natural, e os organismos são suas 'máquinas de sobrevivência'", "A evolução é guiada por um propósito consciente", "Apenas os mais fortes sobrevivem"], correctAnswer: 1, explanation: "Dawkins argumenta que a seleção natural opera no nível dos genes, não dos organismos. Nós somos 'máquinas de sobrevivência' construídas pelos genes para garantir sua própria replicação." } },
      { id: 2, title: "Os replicadores", icon: "🔄", totalPages: 26, question: { text: "O que são 'replicadores' no contexto do livro?", options: ["Robôs que copiam DNA", "Moléculas que surgiram no caldo primordial e tinham a capacidade de se copiar", "Células do sistema imunológico", "Cientistas que replicam experimentos"], correctAnswer: 1, explanation: "Dawkins descreve como as primeiras moléculas auto-replicantes surgiram nos oceanos primitivos, competindo por recursos e dando início ao processo evolutivo que culminaria nos genes modernos." } },
      { id: 3, title: "Espirais imortais", icon: "🧬", totalPages: 30, question: { text: "Por que Dawkins chama os genes de 'imortais'?", options: ["Porque nunca se degradam", "Porque embora organismos morram, os genes são copiados e passados de geração em geração indefinidamente", "Porque existem desde o Big Bang", "Porque são protegidos por uma capa especial"], correctAnswer: 1, explanation: "Enquanto organismos individuais vivem e morrem, os genes são potencialmente imortais — são copiados e transmitidos através de gerações, podendo existir por milhões de anos." } },
    ]
  },
  "melhor-que-nos-filmes": {
    title: "Melhor do que nos Filmes",
    themeColor: "340 50% 45%",
    chapters: [
      { id: 1, title: "O vizinho irritante", icon: "🏠", totalPages: 22, question: { text: "Como é a relação entre Liz e Wes no início da história?", options: ["São melhores amigos de infância", "São vizinhos que se detestam mutuamente", "São colegas de trabalho", "Nunca se encontraram antes"], correctAnswer: 1, explanation: "Liz e Wes são vizinhos que vivem uma rivalidade constante, trocando provocações e irritando um ao outro sempre que possível." } },
      { id: 2, title: "O plano perfeito", icon: "📋", totalPages: 24, question: { text: "Qual é o plano que Liz e Wes fazem juntos?", options: ["Escrever um roteiro de filme", "Fingir um relacionamento para despertar ciúmes em seus respectivos crushes", "Organizar uma festa surpresa", "Participar de um concurso de talentos"], correctAnswer: 1, explanation: "Liz e Wes fazem um pacto para ajudar um ao outro a conquistar seus interesses amorosos, criando situações dignas de comédia romântica." } },
      { id: 3, title: "Fingindo juntos", icon: "🎭", totalPages: 26, question: { text: "O que começa a mudar entre Liz e Wes enquanto fingem?", options: ["Eles passam a se odiar ainda mais", "Sentimentos reais começam a surgir entre eles", "Eles desistem do plano", "Seus crushes ficam com ciúmes"], correctAnswer: 1, explanation: "Conforme passam mais tempo juntos fingindo, Liz e Wes começam a perceber que a conexão entre eles é mais real do que qualquer roteiro de filme." } },
    ]
  },
};

import ReadingCountdown from "@/components/ReadingCountdown";

type ReadingState = "intro" | "countdown" | "reading" | "reflection" | "completed";

const ChapterReading = () => {
  const { bookId, chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, loading: progressLoading, saveProgress, markAsCompleted, clearProgress } = useReadingProgress(bookId, chapterId);
  const { addEssencia, streak, updateStreak } = useUserStats();
  const [readingState, setReadingState] = useState<ReadingState>("intro");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const [isTimerError, setIsTimerError] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [contribOpen, setContribOpen] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [dynamicBook, setDynamicBook] = useState<typeof bookData[string] | null>(null);
  const [dynamicLoading, setDynamicLoading] = useState(false);

  const staticBook = bookId ? bookData[bookId] : null;

  // Fallback: load chapters from book_suggestions for community-suggested books
  useEffect(() => {
    if (!bookId || staticBook) return;
    let cancelled = false;
    setDynamicLoading(true);

    const normalise = (s: string) =>
      s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const slug = bookId.replace(/^suggestion-/, "");

    (async () => {
      const { data } = await supabase
        .from("book_suggestions")
        .select("title, author, cover_url, genre, chapters_list, ai_verification_data")
        .eq("status", "approved");

      if (cancelled || !data) {
        setDynamicLoading(false);
        return;
      }

      const match = data.find((s: any) => {
        const sSlug = normalise(s.title).replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        return sSlug === slug || normalise(s.title) === normalise(bookId);
      });

      if (!match) {
        setDynamicLoading(false);
        return;
      }

      let chaptersData: any[] = [];
      let meta: any = {};
      try {
        const raw = typeof match.chapters_list === "string" ? JSON.parse(match.chapters_list) : match.chapters_list;
        if (raw?.chapters) chaptersData = raw.chapters;
        meta = raw || {};
      } catch {}
      if (chaptersData.length === 0) {
        try {
          const aiData = typeof match.ai_verification_data === "string" ? JSON.parse(match.ai_verification_data) : match.ai_verification_data;
          if (aiData?.chapters) chaptersData = aiData.chapters;
        } catch {}
      }

      const totalPages = meta.pages || 200;
      const icons = ["📖", "📝", "🔍", "💡", "🌟", "📚", "🎯", "🏆", "🔑", "🌙", "⚡", "🎭", "🗺️", "💎", "🌊"];
      const numChapters = chaptersData.length > 0 ? chaptersData.length : Math.max(8, Math.min(20, Math.ceil(totalPages / 25)));
      const pagesPer = Math.max(1, Math.ceil(totalPages / numChapters));

      const chapters = Array.from({ length: numChapters }, (_, i) => {
        const ch = chaptersData[i];
        const title = typeof ch === "string" ? ch : (ch?.title || `Capítulo ${i + 1}`);
        return {
          id: i + 1,
          title,
          icon: icons[i % icons.length],
          totalPages: pagesPer,
        };
      });

      setDynamicBook({
        title: meta.correct_title || match.title,
        themeColor: "200 40% 35%",
        chapters,
      });
      setDynamicLoading(false);
    })();

    return () => { cancelled = true; };
  }, [bookId, staticBook]);

  const book = staticBook || dynamicBook;
  const chapter = book?.chapters.find(c => c.id === Number(chapterId));
  const themeColor = book?.themeColor || "350 45% 32%";

  // Block browser back button during reflection
  useEffect(() => {
    if (readingState !== "reflection") return;

    // Push a dummy state so pressing back triggers popstate instead of leaving
    window.history.pushState({ reflectionGuard: true }, "");

    const handlePopState = () => {
      // Re-push state to keep the user on the page and show confirmation
      window.history.pushState({ reflectionGuard: true }, "");
      setShowExitConfirm(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [readingState]);

  // Restore progress when loaded
  useEffect(() => {
    if (!progressLoading && progress && !hasRestoredProgress && !progress.is_completed) {
      setElapsedTime(progress.elapsed_time);
      setIsPaused(true);
      setReadingState("reading");
      setHasRestoredProgress(true);
    }
  }, [progress, progressLoading, hasRestoredProgress]);

  // Timer logic
  useEffect(() => {
    if (readingState === "reading" && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [readingState, isPaused]);

  // Auto-save when paused
  useEffect(() => {
    if (readingState === "reading" && isPaused && user && elapsedTime > 0) {
      saveProgress(elapsedTime, true, false);
    }
  }, [isPaused, readingState, elapsedTime, user, saveProgress]);

  // Save progress when leaving the page (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (readingState === "reading" && user && elapsedTime > 0) {
        // Use sendBeacon for reliable save on page unload
        const data = JSON.stringify({
          user_id: user.id,
          book_id: bookId,
          chapter_id: chapterId,
          elapsed_time: elapsedTime,
          is_paused: true,
          is_completed: false,
        });
        
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/reading_progress?on_conflict=user_id,book_id,chapter_id`,
          new Blob([data], { type: 'application/json' })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [readingState, user, elapsedTime, bookId, chapterId]);

  // Save progress when navigating away (component unmount)
  useEffect(() => {
    return () => {
      if (readingState === "reading" && user && elapsedTime > 0) {
        saveProgress(elapsedTime, true, false);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeReadable = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}min ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}min ${secs}s`;
    }
    return `${secs}s`;
  };

  const handleStartReading = () => {
    if (hasRestoredProgress) {
      // Resuming - skip countdown
      setReadingState("reading");
      setIsPaused(false);
    } else {
      setReadingState("countdown");
    }
  };

  const handleCountdownComplete = () => {
    setElapsedTime(0);
    setReadingState("reading");
    setIsPaused(false);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  // Minimum reading time: 30 seconds to prevent accidental/invalid completions
  const MIN_READING_TIME = 30;

  const handleChapterComplete = async () => {
    // Validate minimum reading time
    if (elapsedTime < MIN_READING_TIME) {
      // Trigger shake animation and red background
      setIsTimerError(true);
      setTimeout(() => setIsTimerError(false), 600);
      return;
    }
    // Open dialog asking if they finished or only read a bit
    setShowFinishDialog(true);
  };

  const handleFinishedFully = async () => {
    setShowFinishDialog(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (user) {
      await markAsCompleted(elapsedTime);
    }
    setReadingState("reflection");
  };

  const handleReadAPartial = async () => {
    setShowFinishDialog(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (user && bookId && chapterId) {
      // Salva sessão parcial sem avançar capítulo
      await supabase.from("reading_progress").upsert(
        {
          user_id: user.id,
          book_id: bookId,
          chapter_id: chapterId,
          elapsed_time: elapsedTime,
          is_paused: true,
          is_completed: false,
          session_type: "partial",
          is_partial: true,
        } as any,
        { onConflict: "user_id,book_id,chapter_id" }
      );
      await addEssencia(5);
      toast.success("+5 ✦ pela sessão parcial", {
        description: "Tempo registrado. Continue depois para completar o capítulo.",
      });
    }
    setReadingState("intro");
    setElapsedTime(0);
    setHasRestoredProgress(false);
  };

  const handleReflectionComplete = async (xp: number) => {
    setEarnedXp(xp);
    setReadingState("completed");

    // Award Essência: base 10 (chapter) + reflection XP
    const totalReward = 10 + xp;
    await addEssencia(totalReward);

    // Update streak (increment by 1)
    await updateStreak(streak + 1);

    toast.success(`+${totalReward} Essência ganha!`, {
      description: "Capítulo concluído com sucesso.",
    });
  };

  const handleBackToTrail = () => {
    if (readingState === "reflection") {
      setShowExitConfirm(true);
      return;
    }
    navigate(`/trilhas/${bookId}`);
  };

  const handleConfirmExit = async () => {
    // Revert completion — clear progress so chapter is NOT marked as done
    if (user) {
      await clearProgress();
    }
    setShowExitConfirm(false);
    navigate(`/trilhas/${bookId}`);
  };

  if (dynamicLoading && !staticBook) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-8 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
            <div className="h-6 bg-muted rounded w-48 mx-auto" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!book || !chapter) {
    return (
      <Layout>
        <div className="py-8 text-center">
          <h1 className="text-2xl font-serif font-semibold mb-4">Capítulo não encontrado</h1>
          <Link to="/trilhas">
            <Button variant="outline">Voltar às trilhas</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Show loading while checking for saved progress
  if (progressLoading && user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-8 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
            <div className="h-6 bg-muted rounded w-48 mx-auto" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        {/* Back Button */}
        <button 
          onClick={handleBackToTrail}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para {book.title}
        </button>

        {/* Exit Confirmation Dialog */}
        <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <AlertDialogTitle>Sair da reflexão?</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-sm leading-relaxed">
                Se você sair agora, <strong>todo o seu progresso neste capítulo será perdido</strong> e ele <strong>não será concluído</strong>. Você precisará ler novamente para desbloqueá-lo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continuar respondendo</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmExit}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sair e perder progresso
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Intro State - Explain how it works */}
        {readingState === "intro" && (
          <div className="animate-fade-in space-y-8">
            {/* Header Card */}
            <div 
              className="rounded-xl p-6 text-center"
              style={{
                background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
              }}
            >
              <span className="text-5xl mb-4 block">{chapter.icon}</span>
              <p className="text-white/70 text-sm mb-1">Capítulo {chapter.id}</p>
              <h1 className="text-2xl font-serif font-semibold text-white mb-2">
                {chapter.title}
              </h1>
              <p className="text-white/60 text-sm">{chapter.totalPages} páginas</p>
            </div>

            {/* Banner: contribuir com títulos quando placeholder genérico */}
            {book && /^Capítulo \d+$/i.test(chapter.title) && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-start gap-3 animate-fade-in">
                <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Tem o livro em mãos?</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Os títulos exibidos são genéricos. Ajude a comunidade enviando os reais e ganhe
                    <strong> +50 ✦ Essência</strong> + badge <strong>Curador</strong>.
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setContribOpen(true)}>
                    Contribuir com capítulos reais
                  </Button>
                </div>
              </div>
            )}

            {/* How it works */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                Como funciona a trilha
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `hsl(${themeColor} / 0.15)` }}
                  >
                    <Timer className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Acompanhamos sua leitura</h3>
                    <p className="text-sm text-muted-foreground">
                      Um cronômetro vai registrar o tempo que você leva para ler o capítulo. 
                      Assim você pode acompanhar seu progresso e ritmo de leitura.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `hsl(${themeColor} / 0.15)` }}
                  >
                    <Pause className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Pause quando precisar</h3>
                    <p className="text-sm text-muted-foreground">
                      Precisa fazer uma pausa? Sem problemas! Você pode pausar o cronômetro 
                      e continuar depois, sem perder seu progresso.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `hsl(${themeColor} / 0.15)` }}
                  >
                    <HelpCircle className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Quiz ao final</h3>
                    <p className="text-sm text-muted-foreground">
                      Após concluir a leitura, responda perguntas sobre o capítulo para 
                      testar sua compreensão e ganhar pontos!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <Button 
              size="xl" 
              className="w-full gap-3"
              onClick={handleStartReading}
              style={{ 
                background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
              }}
            >
              <Play className="w-6 h-6" />
              Iniciar Leitura
            </Button>
          </div>
        )}

        {/* Countdown State */}
        {readingState === "countdown" && (
          <ReadingCountdown
            onComplete={handleCountdownComplete}
            themeColor={themeColor}
            chapterTitle={chapter.title}
          />
        )}

        {/* Reading State - Focus Mode (immersive zen) */}
        {readingState === "reading" && (
          <FocusReadingMode
            elapsedTime={elapsedTime}
            isPaused={isPaused}
            onPauseResume={handlePauseResume}
            onFinish={handleChapterComplete}
            onExit={() => {
              if (user && elapsedTime > 0) {
                saveProgress(elapsedTime);
              }
              setReadingState("intro");
            }}
            isTimerError={isTimerError}
            vocabularySlot={
              <VocabularyButton bookId={bookId} bookTitle={book.title} />
            }
          />
        )}

        {/* Reflection State - AI-powered post-chapter questions */}
        {readingState === "reflection" && (
          <PostChapterReflection
            bookTitle={book.title}
            chapterTitle={chapter.title}
            chapterId={chapter.id}
            totalChapters={book.chapters.length}
            themeColor={themeColor}
            readingTime={elapsedTime}
            onComplete={handleReflectionComplete}
          />
        )}

        {/* Completed State */}
        {readingState === "completed" && (
          <div className="animate-fade-in text-center space-y-8">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
              style={{ background: `hsl(${themeColor} / 0.15)` }}
            >
              <CheckCircle className="w-12 h-12" style={{ color: `hsl(${themeColor})` }} />
            </div>

            <div>
              <h2 className="text-2xl font-serif font-semibold mb-2">Capítulo Concluído!</h2>
              <p className="text-muted-foreground">
                Você completou "{chapter.title}"
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border inline-block">
              <div className="flex items-center gap-6 justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold" style={{ color: `hsl(${themeColor})` }}>
                    +{earnedXp}
                  </p>
                  <p className="text-xs text-muted-foreground">Essência ganha</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <div className="flex items-center gap-1.5 justify-center mb-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">tempo de leitura</p>
                  </div>
                  <p className="text-3xl font-bold" style={{ color: `hsl(${themeColor})` }}>
                    {formatTimeReadable(elapsedTime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                size="lg"
                onClick={handleBackToTrail}
                style={{ 
                  background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                }}
              >
                Voltar para Trilha
              </Button>
            </div>
          </div>
        )}
      </div>

      {book && (
        <ChapterContributionDialog
          open={contribOpen}
          onOpenChange={setContribOpen}
          bookId={bookId || ""}
          bookTitle={book.title}
          initialChapterCount={book.chapters?.length || 10}
        />
      )}

      <FinishReadingDialog
        open={showFinishDialog}
        onOpenChange={setShowFinishDialog}
        onFinishedFully={handleFinishedFully}
        onPartial={handleReadAPartial}
        themeColor={themeColor}
      />
    </Layout>
  );
};

export default ChapterReading;
