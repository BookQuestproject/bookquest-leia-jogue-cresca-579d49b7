import { useState, useMemo, memo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { BookOpen, Lock, CheckCircle, Crown, Play, ArrowLeft, HelpCircle, Bookmark, Plus, Clock, MapPin, Award, X } from "lucide-react";
import { useActiveTrail } from "@/hooks/useActiveTrail";
import { useMyTrails } from "@/hooks/useMyTrails";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChapterProgress } from "@/hooks/useChapterProgress";
import { usePageBookmark } from "@/hooks/usePageBookmark";
import BookmarkMarker from "@/components/BookmarkMarker";
import CompletedChapterModal from "@/components/CompletedChapterModal";

interface Chapter {
  id: number;
  title: string;
  status: "completed" | "current" | "locked";
  icon: string;
  currentPage?: number;
  totalPages?: number;
  question?: {
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
}

interface BookTrail {
  id: string;
  title: string;
  author: string;
  cover: string;
  coverImage?: string;
  totalChapters: number;
  chapters: Chapter[];
  isPremium: boolean;
  genre: string;
  themeColor: string;
}

// Generate chapters automatically from page count
const generateChapters = (totalPages: number, chaptersCount?: number): Chapter[] => {
  const numChapters = chaptersCount || Math.max(5, Math.min(25, Math.ceil(totalPages / 20)));
  const pagesPerChapter = Math.ceil(totalPages / numChapters);
  const icons = ["📖", "📝", "🔍", "💡", "🌟", "📚", "🎯", "🏆", "🔑", "🌙", "⚡", "🎭", "🗺️", "💎", "🌊", "🔥", "🎪", "🏰", "⭐", "🎨", "🌈", "🪶", "🧩", "🎶", "🌿"];
  return Array.from({ length: numChapters }, (_, i) => ({
    id: i + 1,
    title: `Capítulo ${i + 1}`,
    status: (i === 0 ? "current" : "locked") as "completed" | "current" | "locked",
    icon: icons[i % icons.length],
    totalPages: i === numChapters - 1 ? totalPages - pagesPerChapter * i : pagesPerChapter,
  }));
};

const bookTrails: BookTrail[] = [
  {
    id: "harry-potter-1",
    title: "Harry Potter e a Pedra Filosofal",
    author: "J.K. Rowling",
    cover: "🏰",
    coverImage: "https://m.media-amazon.com/images/I/81ibfYk4qmL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 17,
    isPremium: false,
    genre: "Fantasia",
    themeColor: "350 45% 32%",
    chapters: [
      { id: 1, title: "O Menino que Sobreviveu", status: "current", icon: "🏠", currentPage: 12, totalPages: 24,
        question: { text: "Por que os Dursley tinham tanto medo de que os vizinhos descobrissem sobre os Potter?", options: ["Porque os Potter eram criminosos procurados", "Porque não queriam ser associados a algo 'anormal'", "Porque deviam dinheiro aos Potter", "Porque os Potter eram celebridades famosas"], correctAnswer: 1, explanation: "Os Dursley valorizavam acima de tudo a 'normalidade' e temiam qualquer associação com o mundo mágico." }
      },
      { id: 2, title: "O Vidro que Sumiu", status: "locked", icon: "🐍", totalPages: 18 },
      { id: 3, title: "As Cartas de Ninguém", status: "locked", icon: "✉️", totalPages: 22 },
      { id: 4, title: "O Guardião das Chaves", status: "locked", icon: "🗝️", totalPages: 20 },
      { id: 5, title: "O Beco Diagonal", status: "locked", icon: "🏪", totalPages: 28 },
      { id: 6, title: "A Viagem da Plataforma", status: "locked", icon: "🚂", totalPages: 18 },
      { id: 7, title: "O Chapéu Seletor", status: "locked", icon: "🎩", totalPages: 16 },
      { id: 8, title: "O Mestre das Poções", status: "locked", icon: "⚗️", totalPages: 20 },
      { id: 9, title: "O Duelo à Meia-Noite", status: "locked", icon: "⚔️", totalPages: 22 },
      { id: 10, title: "O Espelho de Ojesed", status: "locked", icon: "🪞", totalPages: 24 },
    ]
  },
  {
    id: "percy-jackson-1",
    title: "Percy Jackson e o Ladrão de Raios",
    author: "Rick Riordan",
    cover: "⚡",
    coverImage: "https://m.media-amazon.com/images/I/81a4VFOlxFL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 22,
    isPremium: false,
    genre: "Mitologia",
    themeColor: "210 55% 30%",
    chapters: [
      { id: 1, title: "Eu Vaporizo Minha Professora", status: "completed", icon: "⚡", currentPage: 15, totalPages: 15 },
      { id: 2, title: "Três Velhas Tricotando", status: "current", icon: "🧶", currentPage: 8, totalPages: 18 },
      { id: 3, title: "Grover Perde as Calças", status: "locked", icon: "🐐", totalPages: 20 },
    ]
  },
  {
    id: "dom-casmurro",
    title: "Dom Casmurro",
    author: "Machado de Assis",
    cover: "📜",
    coverImage: "https://m.media-amazon.com/images/I/61dKS9CIBYL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 15,
    isPremium: false,
    genre: "Romance Brasileiro",
    themeColor: "35 40% 28%",
    chapters: [
      { id: 1, title: "Do título", status: "current", icon: "📜", currentPage: 4, totalPages: 8 },
      { id: 2, title: "Do livro", status: "locked", icon: "📖", totalPages: 10 },
      { id: 3, title: "A denúncia", status: "locked", icon: "🔔", totalPages: 12 },
    ]
  },
  {
    id: "o-pequeno-principe",
    title: "O Pequeno Príncipe",
    author: "Antoine de Saint-Exupéry",
    cover: "⭐",
    coverImage: "https://m.media-amazon.com/images/I/71OZY035QKL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Fábula",
    themeColor: "40 65% 45%",
    chapters: [
      { id: 1, title: "O Desenho", status: "completed", icon: "🎨", currentPage: 6, totalPages: 6 },
      { id: 2, title: "O Encontro", status: "current", icon: "⭐", currentPage: 3, totalPages: 10 },
      { id: 3, title: "O Asteroide B-612", status: "locked", icon: "🪐", totalPages: 8 },
    ]
  },
  {
    id: "senhor-dos-aneis",
    title: "O Senhor dos Anéis",
    author: "J.R.R. Tolkien",
    cover: "💍",
    coverImage: "https://m.media-amazon.com/images/I/71jLBXtWJWL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 22,
    isPremium: false,
    genre: "Fantasia",
    themeColor: "25 50% 25%",
    chapters: [
      { id: 1, title: "Uma festa muito esperada", status: "current", icon: "🎉", totalPages: 30, question: { text: "Por que Bilbo decide deixar o Condado?", options: ["Ele foi expulso pelos hobbits", "Ele queria uma última aventura e sentia o peso do Anel", "Gandalf o obrigou a partir", "Ele precisava devolver o Anel a Sauron"], correctAnswer: 1, explanation: "Bilbo sentia que o Anel estava consumindo-o e desejava partir para uma última jornada, deixando tudo para Frodo." } },
      { id: 2, title: "A sombra do passado", status: "locked", icon: "🌑", totalPages: 28 },
      { id: 3, title: "Três é demais", status: "locked", icon: "🚶", totalPages: 24 },
    ]
  },
  {
    id: "orgulho-preconceito",
    title: "Orgulho e Preconceito",
    author: "Jane Austen",
    cover: "💌",
    coverImage: "https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 15,
    isPremium: false,
    genre: "Romance",
    themeColor: "340 40% 40%",
    chapters: [
      { id: 1, title: "O baile em Meryton", status: "current", icon: "💃", totalPages: 20, question: { text: "Qual foi a primeira impressão de Elizabeth sobre Mr. Darcy no baile?", options: ["Ela o achou charmoso e simpático", "Ela o achou orgulhoso e desagradável", "Ela não notou sua presença", "Ela ficou encantada imediatamente"], correctAnswer: 1, explanation: "Elizabeth ouviu Darcy recusar dançar com ela, dizendo que ela não era bonita o suficiente, formando uma impressão negativa." } },
      { id: 2, title: "A visita a Netherfield", status: "locked", icon: "🏠", totalPages: 22 },
      { id: 3, title: "O pedido de Mr. Collins", status: "locked", icon: "💍", totalPages: 18 },
    ]
  },
  {
    id: "1984",
    title: "1984",
    author: "George Orwell",
    cover: "👁️",
    coverImage: "https://m.media-amazon.com/images/I/61ZewDE3beL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Ficção Científica",
    themeColor: "0 0% 25%",
    chapters: [
      { id: 1, title: "O Grande Irmão", status: "current", icon: "👁️", totalPages: 28, question: { text: "O que significa o slogan 'Guerra é Paz, Liberdade é Escravidão, Ignorância é Força'?", options: ["É um hino patriótico de Oceânia", "São contradições propositais usadas pelo Partido para controlar o pensamento", "São frases motivacionais para os trabalhadores", "É uma piada interna do governo"], correctAnswer: 1, explanation: "Os slogans representam o 'duplipensar' — a capacidade de aceitar duas ideias contraditórias ao mesmo tempo, essencial para o controle do Partido." } },
      { id: 2, title: "O diário proibido", status: "locked", icon: "📓", totalPages: 24 },
      { id: 3, title: "A Polícia do Pensamento", status: "locked", icon: "🚔", totalPages: 26 },
    ]
  },
  {
    id: "e-nao-sobrou-nenhum",
    title: "E Não Sobrou Nenhum",
    author: "Agatha Christie",
    cover: "🔪",
    coverImage: "https://m.media-amazon.com/images/I/91O4YwMiNOL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 14,
    isPremium: false,
    genre: "Mistério",
    themeColor: "0 45% 30%",
    chapters: [
      { id: 1, title: "O convite misterioso", status: "current", icon: "✉️", totalPages: 20, question: { text: "O que os dez convidados tinham em comum ao chegar à Ilha do Soldado?", options: ["Todos eram amigos de infância", "Nenhum conhecia pessoalmente o anfitrião que os convidou", "Todos eram detetives famosos", "Todos trabalhavam no mesmo lugar"], correctAnswer: 1, explanation: "Nenhum dos convidados conhecia pessoalmente Mr. Owen, o misterioso anfitrião, cada um recebeu um convite sob circunstâncias diferentes." } },
      { id: 2, title: "A acusação", status: "locked", icon: "🔊", totalPages: 18 },
      { id: 3, title: "A primeira morte", status: "locked", icon: "💀", totalPages: 22 },
    ]
  },
  {
    id: "culpa-das-estrelas",
    title: "A Culpa é das Estrelas",
    author: "John Green",
    cover: "🌟",
    coverImage: "https://m.media-amazon.com/images/I/71sBKhB9q3L._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Romance",
    themeColor: "200 50% 40%",
    chapters: [
      { id: 1, title: "O grupo de apoio", status: "current", icon: "💙", totalPages: 24, question: { text: "Como Hazel descreve sua relação com o grupo de apoio no início?", options: ["Ela adora ir e se sente acolhida", "Ela vai por obrigação da mãe e acha deprimente", "Ela é a líder do grupo", "Ela nunca participou antes"], correctAnswer: 1, explanation: "Hazel frequenta o grupo por insistência da mãe e inicialmente o vê como algo entediante e deprimente, até conhecer Augustus." } },
      { id: 2, title: "Augustus Waters", status: "locked", icon: "🚬", totalPages: 22 },
      { id: 3, title: "Uma Aflição Imperial", status: "locked", icon: "📖", totalPages: 26 },
    ]
  },
  {
    id: "jogos-vorazes",
    title: "Jogos Vorazes",
    author: "Suzanne Collins",
    cover: "🏹",
    coverImage: "https://m.media-amazon.com/images/I/71un2hI4mcL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 15,
    isPremium: false,
    genre: "Aventura",
    themeColor: "30 60% 35%",
    chapters: [
      { id: 1, title: "O dia da Colheita", status: "current", icon: "🌾", totalPages: 26, question: { text: "Por que Katniss se voluntariou como tributo?", options: ["Ela queria fama e glória", "Para salvar sua irmã Prim, que foi sorteada", "Porque era obrigatório para os mais velhos", "Ela foi forçada pelo governo"], correctAnswer: 1, explanation: "Quando Primrose Everdeen foi sorteada, Katniss se ofereceu como voluntária para proteger sua irmã mais nova." } },
      { id: 2, title: "A despedida", status: "locked", icon: "👋", totalPages: 22 },
      { id: 3, title: "O trem para a Capital", status: "locked", icon: "🚂", totalPages: 28 },
    ]
  },
  {
    id: "o-hobbit",
    title: "O Hobbit",
    author: "J.R.R. Tolkien",
    cover: "🐉",
    coverImage: "https://m.media-amazon.com/images/I/91b0C2YNSrL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Fantasia",
    themeColor: "120 30% 30%",
    chapters: [
      { id: 1, title: "Uma festa inesperada", status: "current", icon: "🎉", totalPages: 28, question: { text: "O que Gandalf marcou na porta de Bilbo?", options: ["Um aviso de perigo", "Um sinal rúnico significando 'ladrão disponível'", "O nome de Bilbo em élfico", "Um mapa do tesouro"], correctAnswer: 1, explanation: "Gandalf riscou um sinal na porta de Bilbo indicando aos anões que ali morava um 'ladrão' disponível para a aventura." } },
      { id: 2, title: "Carneiro assado", status: "locked", icon: "🍖", totalPages: 22 },
      { id: 3, title: "Um breve descanso", status: "locked", icon: "🏔️", totalPages: 20 },
    ]
  },
  {
    id: "sapiens",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    cover: "🧠",
    coverImage: "https://m.media-amazon.com/images/I/713jIoMO3UL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 15,
    isPremium: false,
    genre: "Não-Ficção",
    themeColor: "180 30% 30%",
    chapters: [
      { id: 1, title: "Um animal insignificante", status: "current", icon: "🐒", totalPages: 30, question: { text: "Segundo Harari, o que diferenciou o Homo sapiens das outras espécies humanas?", options: ["A força física superior", "A capacidade de criar ficções e cooperar em grande escala", "A habilidade de usar ferramentas", "A vida em cavernas"], correctAnswer: 1, explanation: "Harari argumenta que a 'Revolução Cognitiva' deu aos Sapiens a capacidade única de criar mitos, permitindo cooperação entre grandes grupos de desconhecidos." } },
      { id: 2, title: "A Árvore do Conhecimento", status: "locked", icon: "🌳", totalPages: 28 },
      { id: 3, title: "Um dia na vida de Adão e Eva", status: "locked", icon: "🏕️", totalPages: 26 },
    ]
  },
  {
    id: "cronicas-narnia",
    title: "As Crônicas de Nárnia",
    author: "C.S. Lewis",
    cover: "🦁",
    coverImage: "https://m.media-amazon.com/images/I/81QcFlMtWBL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 20,
    isPremium: false,
    genre: "Fantasia",
    themeColor: "30 45% 35%",
    chapters: [
      { id: 1, title: "Lúcia olha dentro do guarda-roupa", status: "current", icon: "🚪", totalPages: 18, question: { text: "O que Lúcia encontrou ao entrar no guarda-roupa?", options: ["Uma sala secreta cheia de tesouros", "Um mundo coberto de neve — Nárnia", "Outro quarto da casa", "Um túnel escuro e perigoso"], correctAnswer: 1, explanation: "Lúcia atravessou os casacos do guarda-roupa e descobriu o mundo mágico de Nárnia, coberto por um inverno eterno." } },
      { id: 2, title: "O que Lúcia encontrou lá", status: "locked", icon: "🐐", totalPages: 20 },
      { id: 3, title: "Edmundo e o guarda-roupa", status: "locked", icon: "🍬", totalPages: 18 },
    ]
  },
  {
    id: "nome-do-vento",
    title: "O Nome do Vento",
    author: "Patrick Rothfuss",
    cover: "🌬️",
    coverImage: "https://m.media-amazon.com/images/I/91b8oNwaV1L._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 18,
    isPremium: false,
    genre: "Fantasia",
    themeColor: "210 40% 35%",
    chapters: [
      { id: 1, title: "Um silêncio triplo", status: "current", icon: "🤫", totalPages: 16, question: { text: "O que o 'silêncio triplo' no início do livro sugere sobre Kvothe?", options: ["Que ele é surdo", "Que ele vive uma vida pacífica e sem história", "Que ele é um homem escondendo um passado extraordinário", "Que a taverna está fechada"], correctAnswer: 2, explanation: "O silêncio triplo sugere que Kote (Kvothe) é um homem que carrega o peso de um passado lendário, agora escondido como um simples taberneiro." } },
      { id: 2, title: "Uma beleza a ser destruída", status: "locked", icon: "🕯️", totalPages: 20 },
      { id: 3, title: "Madeira e palavra", status: "locked", icon: "📜", totalPages: 22 },
    ]
  },
  {
    id: "garota-no-trem",
    title: "A Garota no Trem",
    author: "Paula Hawkins",
    cover: "🚂",
    coverImage: "https://m.media-amazon.com/images/I/81YkqyaFVEL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Mistério",
    themeColor: "220 35% 30%",
    chapters: [
      { id: 1, title: "Rachel – A observadora", status: "current", icon: "👀", totalPages: 28, question: { text: "O que Rachel fazia todos os dias durante a viagem de trem?", options: ["Lia livros para passar o tempo", "Observava um casal 'perfeito' em uma casa ao lado dos trilhos", "Dormia durante todo o trajeto", "Fotografava a paisagem"], correctAnswer: 1, explanation: "Rachel observava obsessivamente um casal que morava em uma casa visível dos trilhos, criando fantasias sobre suas vidas perfeitas." } },
      { id: 2, title: "Megan – O segredo", status: "locked", icon: "🤐", totalPages: 24 },
      { id: 3, title: "Anna – A outra mulher", status: "locked", icon: "💔", totalPages: 26 },
    ]
  },
  {
    id: "gone-girl",
    title: "Gone Girl",
    author: "Gillian Flynn",
    cover: "🔍",
    coverImage: "https://m.media-amazon.com/images/I/81mMoGJDBFL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 14,
    isPremium: false,
    genre: "Mistério",
    themeColor: "350 30% 28%",
    chapters: [
      { id: 1, title: "O garoto conhece a garota", status: "current", icon: "💑", totalPages: 22, question: { text: "O que acontece no quinto aniversário de casamento de Nick e Amy?", options: ["Eles fazem uma viagem romântica", "Amy desaparece misteriosamente", "Eles fazem uma festa surpresa", "Nick pede o divórcio"], correctAnswer: 1, explanation: "No quinto aniversário de casamento, Amy desaparece e sinais de luta são encontrados em casa, tornando Nick o principal suspeito." } },
      { id: 2, title: "O diário de Amy", status: "locked", icon: "📔", totalPages: 24 },
      { id: 3, title: "As aparências enganam", status: "locked", icon: "🎭", totalPages: 26 },
    ]
  },
  {
    id: "codigo-da-vinci",
    title: "O Código Da Vinci",
    author: "Dan Brown",
    cover: "🗝️",
    coverImage: "https://m.media-amazon.com/images/I/815WORuYMML._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 16,
    isPremium: false,
    genre: "Mistério",
    themeColor: "45 40% 30%",
    chapters: [
      { id: 1, title: "O assassinato no Louvre", status: "current", icon: "🖼️", totalPages: 20, question: { text: "O que o curador Jacques Saunière fez antes de morrer?", options: ["Ligou para a polícia", "Posicionou seu corpo como o Homem Vitruviano e deixou pistas codificadas", "Escondeu a Mona Lisa", "Escreveu um testamento"], correctAnswer: 1, explanation: "Saunière usou seus últimos momentos para arranjar seu corpo como o Homem Vitruviano de Da Vinci e deixar mensagens cifradas para Robert Langdon." } },
      { id: 2, title: "A cifra de Saunière", status: "locked", icon: "🔢", totalPages: 18 },
      { id: 3, title: "Sophie Neveu", status: "locked", icon: "👩", totalPages: 22 },
    ]
  },
  {
    id: "sherlock-holmes",
    title: "Sherlock Holmes - Obra Completa",
    author: "Arthur Conan Doyle",
    cover: "🕵️",
    coverImage: "https://m.media-amazon.com/images/I/91aBOomjHjL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 25,
    isPremium: true,
    genre: "Mistério",
    themeColor: "200 25% 28%",
    chapters: [
      { id: 1, title: "Um Estudo em Vermelho", status: "current", icon: "🔴", totalPages: 30, question: { text: "Como Watson e Holmes se conheceram?", options: ["Eram vizinhos de infância", "Foram apresentados por um colega porque ambos precisavam dividir um apartamento", "Holmes o contratou como assistente", "Se encontraram em uma cena de crime"], correctAnswer: 1, explanation: "Watson, recém-voltado da guerra, precisava de um lugar para morar e foi apresentado a Holmes por Stamford, pois Holmes também buscava alguém para dividir o aluguel do 221B Baker Street." } },
      { id: 2, title: "A ciência da dedução", status: "locked", icon: "🔬", totalPages: 24 },
      { id: 3, title: "O mistério de Lauriston Gardens", status: "locked", icon: "🏚️", totalPages: 28 },
    ]
  },
  {
    id: "como-eu-era-antes",
    title: "Como Eu Era Antes de Você",
    author: "Jojo Moyes",
    cover: "💕",
    coverImage: "https://m.media-amazon.com/images/I/81NeVMPLLIL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Romance",
    themeColor: "330 45% 45%",
    chapters: [
      { id: 1, title: "Louisa perde o emprego", status: "current", icon: "☕", totalPages: 24, question: { text: "Por que Louisa Clark aceita o emprego de cuidadora de Will Traynor?", options: ["Ela sempre sonhou em ser enfermeira", "Ela estava desempregada e precisava do dinheiro", "Will era seu amigo de infância", "Ela foi obrigada pela família dele"], correctAnswer: 1, explanation: "Louisa havia perdido seu emprego no café e aceitou o trabalho com Will por necessidade financeira, sem saber exatamente o que esperar." } },
      { id: 2, title: "Will Traynor", status: "locked", icon: "♿", totalPages: 22 },
      { id: 3, title: "Rotina e resistência", status: "locked", icon: "🔄", totalPages: 26 },
    ]
  },
  {
    id: "poder-do-habito",
    title: "O Poder do Hábito",
    author: "Charles Duhigg",
    cover: "🔄",
    coverImage: "https://m.media-amazon.com/images/I/71WCGwxhp3L._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Não-Ficção",
    themeColor: "260 35% 35%",
    chapters: [
      { id: 1, title: "O loop do hábito", status: "current", icon: "🔁", totalPages: 34, question: { text: "Quais são os três componentes do 'loop do hábito'?", options: ["Motivação, ação e recompensa", "Deixa (gatilho), rotina e recompensa", "Planejamento, execução e reflexão", "Desejo, tentativa e fracasso"], correctAnswer: 1, explanation: "O loop do hábito consiste em uma deixa (gatilho que inicia o comportamento), uma rotina (o comportamento em si) e uma recompensa (o benefício que reforça o hábito)." } },
      { id: 2, title: "O cérebro ansioso", status: "locked", icon: "🧠", totalPages: 30 },
      { id: 3, title: "A regra de ouro da mudança", status: "locked", icon: "🏆", totalPages: 32 },
    ]
  },
  {
    id: "mindset",
    title: "Mindset",
    author: "Carol S. Dweck",
    cover: "🧩",
    coverImage: "https://m.media-amazon.com/images/I/71sL0hJOj3L._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 10,
    isPremium: false,
    genre: "Não-Ficção",
    themeColor: "170 35% 35%",
    chapters: [
      { id: 1, title: "Os dois mindsets", status: "current", icon: "🧠", totalPages: 32, question: { text: "Qual é a diferença entre mindset fixo e mindset de crescimento?", options: ["Fixo é pessimista e crescimento é otimista", "Fixo acredita que habilidades são inatas; crescimento acredita que podem ser desenvolvidas", "Fixo é para adultos e crescimento é para crianças", "Não há diferença real entre os dois"], correctAnswer: 1, explanation: "O mindset fixo acredita que inteligência e talento são qualidades inatas e imutáveis, enquanto o mindset de crescimento acredita que podem ser desenvolvidos com esforço e aprendizado." } },
      { id: 2, title: "Por dentro dos mindsets", status: "locked", icon: "🔍", totalPages: 28 },
      { id: 3, title: "A verdade sobre habilidade", status: "locked", icon: "💡", totalPages: 30 },
    ]
  },
  {
    id: "maze-runner",
    title: "Maze Runner - Correr ou Morrer",
    author: "James Dashner",
    cover: "🌀",
    coverImage: "https://m.media-amazon.com/images/I/81ym3QUd3KL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 15,
    isPremium: false,
    genre: "Aventura",
    themeColor: "150 30% 28%",
    chapters: [
      { id: 1, title: "A Caixa", status: "current", icon: "📦", totalPages: 22, question: { text: "O que Thomas lembrava quando chegou à Clareira?", options: ["Toda a sua vida antes da Clareira", "Apenas seu nome — nada mais", "O rosto de sua família", "Como ele chegou ali"], correctAnswer: 1, explanation: "Thomas acordou na Caixa sem memórias, sabendo apenas seu primeiro nome. Todas as outras lembranças haviam sido apagadas." } },
      { id: 2, title: "A Clareira", status: "locked", icon: "🏕️", totalPages: 24 },
      { id: 3, title: "As regras dos Clareianos", status: "locked", icon: "📋", totalPages: 20 },
    ]
  },
  {
    id: "divergente",
    title: "Divergente",
    author: "Veronica Roth",
    cover: "🔥",
    coverImage: "https://m.media-amazon.com/images/I/81s8PEVbqjL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 15,
    isPremium: false,
    genre: "Aventura",
    themeColor: "15 55% 35%",
    chapters: [
      { id: 1, title: "O teste de aptidão", status: "current", icon: "💉", totalPages: 24, question: { text: "Por que o resultado do teste de Tris foi considerado perigoso?", options: ["Ela não teve resultado nenhum", "Ela teve aptidão para múltiplas facções — ela é Divergente", "Ela foi aprovada para a facção errada", "O teste deu erro técnico"], correctAnswer: 1, explanation: "Tris mostrou aptidão para mais de uma facção, o que a classificou como 'Divergente' — algo considerado perigoso pelo sistema de controle." } },
      { id: 2, title: "O dia da Escolha", status: "locked", icon: "🩸", totalPages: 22 },
      { id: 3, title: "A iniciação na Audácia", status: "locked", icon: "🏋️", totalPages: 26 },
    ]
  },
  {
    id: "aventuras-de-pi",
    title: "As Aventuras de Pi",
    author: "Yann Martel",
    cover: "🐯",
    coverImage: "https://m.media-amazon.com/images/I/71VBl0lz13L._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Aventura",
    themeColor: "200 45% 40%",
    chapters: [
      { id: 1, title: "O zoológico de Pondicherry", status: "current", icon: "🦁", totalPages: 26, question: { text: "Por que Pi recebeu esse nome incomum?", options: ["Era uma tradição familiar", "Seu nome vem de uma piscina famosa em Paris — Piscine Molitor", "Ele escolheu o nome quando criança", "Foi um erro no registro de nascimento"], correctAnswer: 1, explanation: "Pi se chama Piscine Molitor Patel, nome dado em homenagem a uma piscina em Paris. Ele adotou o apelido 'Pi' para evitar ser chamado de 'mijo' na escola." } },
      { id: 2, title: "As três religiões de Pi", status: "locked", icon: "🙏", totalPages: 22 },
      { id: 3, title: "O naufrágio", status: "locked", icon: "🚢", totalPages: 28 },
    ]
  },
  {
    id: "ilha-do-tesouro",
    title: "A Ilha do Tesouro",
    author: "Robert Louis Stevenson",
    cover: "🏴‍☠️",
    coverImage: "https://m.media-amazon.com/images/I/91PoLpjPHvL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Aventura",
    themeColor: "25 45% 30%",
    chapters: [
      { id: 1, title: "O velho marinheiro", status: "current", icon: "🧭", totalPages: 22, question: { text: "O que Billy Bones trouxe consigo para a estalagem do pai de Jim?", options: ["Um papagaio falante", "Um velho baú de marinheiro com um mapa do tesouro dentro", "Uma espada encantada", "Um barco miniatura"], correctAnswer: 1, explanation: "Billy Bones chegou à estalagem carregando um grande baú de marinheiro que continha, entre outras coisas, o mapa da Ilha do Tesouro." } },
      { id: 2, title: "O Cão Negro", status: "locked", icon: "🐕", totalPages: 18 },
      { id: 3, title: "A marca negra", status: "locked", icon: "⚫", totalPages: 20 },
    ]
  },
  {
    id: "20000-leguas",
    title: "20.000 Léguas Submarinas",
    author: "Júlio Verne",
    cover: "🌊",
    coverImage: "https://m.media-amazon.com/images/I/81CgD1YtGhL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 15,
    isPremium: false,
    genre: "Aventura",
    themeColor: "195 50% 30%",
    chapters: [
      { id: 1, title: "O monstro marinho", status: "current", icon: "🐙", totalPages: 24, question: { text: "O que as pessoas acreditavam ser o 'monstro' que atacava navios?", options: ["Um kraken gigante", "Uma criatura marinha desconhecida de proporções enormes", "Um navio pirata disfarçado", "Uma baleia mutante"], correctAnswer: 1, explanation: "Relatos de diversos navios descreviam uma criatura luminosa e enorme nos oceanos, que na verdade era o submarino Nautilus do Capitão Nemo." } },
      { id: 2, title: "A expedição", status: "locked", icon: "⚓", totalPages: 22 },
      { id: 3, title: "O Nautilus", status: "locked", icon: "🚢", totalPages: 26 },
    ]
  },
  {
    id: "rapido-devagar",
    title: "Rápido e Devagar",
    author: "Daniel Kahneman",
    cover: "⚖️",
    coverImage: "https://m.media-amazon.com/images/I/71f6HcZ0jTL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 15,
    isPremium: false,
    genre: "Não-Ficção",
    themeColor: "220 30% 35%",
    chapters: [
      { id: 1, title: "Os dois sistemas", status: "current", icon: "⚡", totalPages: 28, question: { text: "Qual a diferença entre o Sistema 1 e o Sistema 2 do pensamento?", options: ["Sistema 1 é lógico e Sistema 2 é emocional", "Sistema 1 é rápido e intuitivo; Sistema 2 é lento e deliberado", "Sistema 1 é usado por crianças e Sistema 2 por adultos", "Não há diferença prática entre eles"], correctAnswer: 1, explanation: "O Sistema 1 opera de forma automática e rápida, com pouco esforço. O Sistema 2 aloca atenção para atividades mentais trabalhosas e complexas." } },
      { id: 2, title: "Atenção e esforço", status: "locked", icon: "🎯", totalPages: 26 },
      { id: 3, title: "O controlador preguiçoso", status: "locked", icon: "😴", totalPages: 30 },
    ]
  },
  {
    id: "breve-historia-tempo",
    title: "Uma Breve História do Tempo",
    author: "Stephen Hawking",
    cover: "🌌",
    coverImage: "https://m.media-amazon.com/images/I/81pX3R2R9cL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 10,
    isPremium: false,
    genre: "Não-Ficção",
    themeColor: "240 30% 25%",
    chapters: [
      { id: 1, title: "Nossa imagem do universo", status: "current", icon: "🌍", totalPages: 26, question: { text: "Qual é a famosa anedota que Hawking usa para abrir o livro?", options: ["A maçã de Newton", "A história da senhora que disse que o mundo fica em cima de uma tartaruga", "O sonho de Einstein", "A queda de Galileu da Torre de Pisa"], correctAnswer: 1, explanation: "Hawking abre o livro com a história de uma senhora que, após uma palestra, afirmou que o mundo fica sobre as costas de uma tartaruga, e 'são tartarugas até o fim'." } },
      { id: 2, title: "Espaço e tempo", status: "locked", icon: "⏰", totalPages: 28 },
      { id: 3, title: "O universo em expansão", status: "locked", icon: "💫", totalPages: 24 },
    ]
  },
  {
    id: "me-chame-pelo-seu-nome",
    title: "Me Chame Pelo Seu Nome",
    author: "André Aciman",
    cover: "🍑",
    coverImage: "https://m.media-amazon.com/images/I/71pq5FYaPvL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 10,
    isPremium: false,
    genre: "Romance",
    themeColor: "30 50% 45%",
    chapters: [
      { id: 1, title: "A chegada de Oliver", status: "current", icon: "☀️", totalPages: 30, question: { text: "Qual foi a primeira impressão de Elio sobre Oliver?", options: ["Ele o adorou imediatamente", "Ele sentiu uma mistura de fascínio e irritação com sua confiança", "Ele o ignorou completamente", "Eles se tornaram melhores amigos na hora"], correctAnswer: 1, explanation: "Elio ficou intrigado e levemente irritado com a autoconfiança e o jeito despreocupado de Oliver, especialmente seu hábito de dizer 'Later!'." } },
      { id: 2, title: "O verão italiano", status: "locked", icon: "🌻", totalPages: 28 },
      { id: 3, title: "A muralha do silêncio", status: "locked", icon: "🤐", totalPages: 26 },
    ]
  },
  {
    id: "anna-karenina",
    title: "Anna Karenina",
    author: "Liev Tolstói",
    cover: "🚂",
    coverImage: "https://m.media-amazon.com/images/I/71FVhDEFU-L._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 20,
    isPremium: true,
    genre: "Romance",
    themeColor: "350 35% 30%",
    chapters: [
      { id: 1, title: "Todas as famílias felizes", status: "current", icon: "👪", totalPages: 22, question: { text: "Qual é a famosa frase de abertura de Anna Karenina?", options: ["Era o melhor dos tempos, era o pior dos tempos", "Todas as famílias felizes se parecem; cada família infeliz é infeliz à sua maneira", "Chame-me Ismael", "Em algum lugar da Mancha"], correctAnswer: 1, explanation: "A frase de abertura é uma das mais famosas da literatura: 'Todas as famílias felizes se parecem, cada família infeliz é infeliz à sua maneira.'" } },
      { id: 2, title: "A crise dos Oblonsky", status: "locked", icon: "💔", totalPages: 24 },
      { id: 3, title: "A chegada de Anna", status: "locked", icon: "🚂", totalPages: 20 },
    ]
  },
  {
    id: "morro-ventos-uivantes",
    title: "O Morro dos Ventos Uivantes",
    author: "Emily Brontë",
    cover: "🌪️",
    coverImage: "https://m.media-amazon.com/images/I/81G0FvPt3SL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 14,
    isPremium: false,
    genre: "Romance",
    themeColor: "270 25% 30%",
    chapters: [
      { id: 1, title: "A visita a Morro dos Ventos", status: "current", icon: "🏚️", totalPages: 24, question: { text: "Qual foi a primeira impressão de Lockwood ao visitar o Morro dos Ventos Uivantes?", options: ["Era um lugar acolhedor e alegre", "Era um lugar hostil e sombrio, com moradores rudes", "Era uma mansão luxuosa", "Estava abandonado e vazio"], correctAnswer: 1, explanation: "Lockwood encontrou um ambiente hostil e sombrio, com Heathcliff sendo rude e os cães ameaçadores, criando uma atmosfera de desconforto." } },
      { id: 2, title: "A tempestade", status: "locked", icon: "⛈️", totalPages: 22 },
      { id: 3, title: "A história de Nelly", status: "locked", icon: "📖", totalPages: 28 },
    ]
  },
  {
    id: "silencio-inocentes",
    title: "O Silêncio dos Inocentes",
    author: "Thomas Harris",
    cover: "🦋",
    coverImage: "https://m.media-amazon.com/images/I/81hn+-RKtaL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Mistério",
    themeColor: "0 30% 25%",
    chapters: [
      { id: 1, title: "A estagiária do FBI", status: "current", icon: "🔍", totalPages: 24, question: { text: "Por que Clarice Starling foi enviada para entrevistar Hannibal Lecter?", options: ["Ela era a agente mais experiente", "Jack Crawford queria usar seu perfil psicológico para extrair informações de Lecter", "Lecter pediu especificamente por ela", "Foi um erro administrativo"], correctAnswer: 1, explanation: "Crawford enviou Clarice, ainda estagiária, porque acreditava que seu perfil — jovem, inteligente e vulnerável — poderia despertar o interesse de Lecter e fazê-lo cooperar." } },
      { id: 2, title: "O encontro com Lecter", status: "locked", icon: "🦷", totalPages: 26 },
      { id: 3, title: "Quid pro quo", status: "locked", icon: "🤝", totalPages: 22 },
    ]
  },
  {
    id: "gene-egoista",
    title: "O Gene Egoísta",
    author: "Richard Dawkins",
    cover: "🧬",
    coverImage: "https://m.media-amazon.com/images/I/71mhPCxz6vL._AC_UF1000,1000_QL80_.jpg",
    totalChapters: 12,
    isPremium: false,
    genre: "Não-Ficção",
    themeColor: "140 35% 30%",
    chapters: [
      { id: 1, title: "Por que as pessoas existem?", status: "current", icon: "❓", totalPages: 28, question: { text: "Qual é a ideia central de Dawkins sobre a evolução?", options: ["Os organismos evoluem para o bem da espécie", "Os genes são as unidades fundamentais da seleção natural, e os organismos são suas 'máquinas de sobrevivência'", "A evolução é guiada por um propósito consciente", "Apenas os mais fortes sobrevivem"], correctAnswer: 1, explanation: "Dawkins argumenta que a seleção natural opera no nível dos genes, não dos organismos. Nós somos 'máquinas de sobrevivência' construídas pelos genes para garantir sua própria replicação." } },
      { id: 2, title: "Os replicadores", status: "locked", icon: "🔄", totalPages: 26 },
      { id: 3, title: "Espirais imortais", status: "locked", icon: "🧬", totalPages: 30 },
    ]
  },
];

// Export for use in Biblioteca
export { bookTrails };

const normaliseTitle = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const Trilhas = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { activeTrail, setActiveTrail } = useActiveTrail();
  const { isInMyTrails, removeTrail } = useMyTrails();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [completedChapterForModal, setCompletedChapterForModal] = useState<Chapter | null>(null);
  const isPremium = false;

  // Quiz recommendations
  const quizRecommendations: string[] = (() => {
    try {
      const stored = localStorage.getItem("bookquest-quiz-recommendations");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  })();
  const isQuizRecommended = (title: string) => quizRecommendations.some(r => normaliseTitle(r) === normaliseTitle(title));

  // Filter trails: only show user-selected + quiz-recommended, with quiz first
  const filteredTrails = useMemo(() => {
    const userSelected = bookTrails.filter(b => isInMyTrails(b.title));
    const quizOnly = bookTrails.filter(b => isQuizRecommended(b.title) && !isInMyTrails(b.title));
    return [...quizOnly, ...userSelected];
  }, [isInMyTrails, quizRecommendations]);

  

  const handleSelectTrail = (book: BookTrail) => {
    setActiveTrail({
      bookId: book.id,
      title: book.title,
      author: book.author,
      cover: book.cover,
      genre: book.genre,
      themeColor: book.themeColor,
      totalChapters: book.totalChapters,
      chapters: book.chapters,
    });
    toast.success(`"${book.title}" definida como sua trilha atual!`);
    navigate("/home");
  };

  // Hook must be called unconditionally at the top level
  const { isChapterCompleted, getReadingTime, refetch } = useChapterProgress(bookId || "");
  const { getPageBookmark, setPageBookmark } = usePageBookmark(bookId || "");

  // Book detail view
  if (bookId) {
    const book = bookTrails.find(b => b.id === bookId);
    
    if (!book) {
      return (
        <Layout>
          <div className="py-8 text-center">
            <h1 className="text-2xl font-serif font-semibold mb-4">Livro não encontrado</h1>
            <Link to="/trilhas">
              <Button variant="outline">Voltar às trilhas</Button>
            </Link>
          </div>
        </Layout>
      );
    }

    const themeColor = book.themeColor;
    const completedChapters = book.chapters.filter(c => c.status === "completed").length;
    const progress = (completedChapters / book.totalChapters) * 100;
    const currentChapter = book.chapters.find(c => c.status === "current");

    const formatReadingTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      if (minutes > 0) return `${minutes}min`;
      return `${seconds}s`;
    };

    const handleChapterClick = (chapter: Chapter, chapterIndex: number) => {
      const previousChapter = chapterIndex > 0 ? book.chapters[chapterIndex - 1] : null;
      const isPreviousCompleted = previousChapter 
        ? (previousChapter.status === "completed" || isChapterCompleted(previousChapter.id))
        : true;
      const isUnlocked = chapterIndex === 0 || isPreviousCompleted;
      
      if (!isUnlocked) return;
      
      const isCompletedFromDB = isChapterCompleted(chapter.id);
      
      if (isCompletedFromDB || chapter.status === "completed") {
        setCompletedChapterForModal(chapter);
        setShowCompletedModal(true);
      } else {
        navigate(`/ler/${bookId}/${chapter.id}`);
      }
    };

    const handleRereadChapter = () => {
      if (completedChapterForModal && bookId) {
        navigate(`/ler/${bookId}/${completedChapterForModal.id}`);
      }
    };

    const handleAnswerSubmit = () => {
      if (selectedAnswer !== null) {
        setShowResult(true);
      }
    };

    return (
      <Layout isPremium={isPremium}>
        <div className="max-w-4xl mx-auto py-8 section-bg-challenges">
          <Link to="/trilhas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Voltar às trilhas
          </Link>

          <header 
            className="rounded-xl p-6 mb-8 animate-fade-in"
            style={{
              background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 8 + '%')}))`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                  <BookOpen className="w-4 h-4" />
                  Livro atual
                </div>
                <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-white mb-1">
                  {book.title}
                </h1>
                <p className="text-white/70">
                  Capítulo {currentChapter?.id || 1} de {book.totalChapters}
                </p>
              </div>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Ver Trilha
              </Button>
            </div>
          </header>

          {currentChapter && (
            <div className="flex justify-center mb-8">
              <Button 
                size="lg"
                onClick={() => handleChapterClick(currentChapter, book.chapters.findIndex(c => c.id === currentChapter.id))}
                className="gap-2 px-8"
                style={{ 
                  background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                }}
              >
                <Play className="w-5 h-5" />
                Continuar Leitura
              </Button>
            </div>
          )}

          <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {book.chapters.map((chapter, index) => {
              const previousChapter = index > 0 ? book.chapters[index - 1] : null;
              const isPreviousCompleted = previousChapter 
                ? (previousChapter.status === "completed" || isChapterCompleted(previousChapter.id))
                : true;
              
              const isCompletedFromDB = isChapterCompleted(chapter.id);
              const isCompleted = chapter.status === "completed" || isCompletedFromDB;
              const isUnlocked = index === 0 || isPreviousCompleted;
              const isLocked = !isUnlocked;
              const isCurrent = isUnlocked && !isCompleted;
              const isOpenBook = isUnlocked;
              const readingTime = getReadingTime(chapter.id);

              return (
                <TooltipProvider key={chapter.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleChapterClick(chapter, index)}
                        disabled={isLocked}
                        className={`
                          relative w-full rounded-lg overflow-hidden transition-all duration-300 text-left
                          ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}
                        `}
                        style={{
                          background: isOpenBook 
                            ? `linear-gradient(145deg, hsl(43 30% 94%), hsl(35 25% 88%))`
                            : `linear-gradient(145deg, hsl(${themeColor} / 0.12), hsl(${themeColor} / 0.06))`,
                          border: isCurrent 
                            ? `2px solid hsl(${themeColor})` 
                            : `1px solid hsl(${themeColor} / ${isOpenBook ? '0.35' : '0.2'})`,
                          minHeight: '100px',
                          boxShadow: isCurrent 
                            ? `0 8px 32px hsl(${themeColor} / 0.25)`
                            : isOpenBook
                            ? `0 4px 16px hsl(${themeColor} / 0.1)`
                            : 'none',
                        }}
                      >
                        {isOpenBook && (
                          <div 
                            className="absolute inset-0 opacity-20"
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                            }}
                          />
                        )}

                        {isOpenBook && (
                          <div 
                            className="absolute left-0 top-0 bottom-0 w-3"
                            style={{
                              background: `linear-gradient(90deg, hsl(${themeColor} / 0.25), transparent)`,
                            }}
                          />
                        )}

                        <div className="relative p-4 flex items-center gap-4">
                          <div 
                            className="w-20 h-24 rounded flex-shrink-0 flex items-center justify-center overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, hsl(${themeColor} / ${isOpenBook ? '0.2' : '0.15'}), hsl(${themeColor} / 0.08))`,
                              border: `1px solid hsl(${themeColor} / 0.25)`,
                            }}
                          >
                            <span className={`text-3xl ${isLocked ? 'opacity-50' : ''}`}>{chapter.icon}</span>
                          </div>

                          <div className="flex-1">
                            <p 
                              className="text-xs font-medium mb-1"
                              style={{ color: `hsl(${themeColor})`, opacity: isLocked ? 0.6 : 1 }}
                            >
                              Capítulo {chapter.id}
                            </p>
                            <p className={`font-serif text-sm font-semibold line-clamp-2 mb-1 ${isLocked ? 'text-foreground/60' : 'text-foreground'}`}>
                              {chapter.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Capítulo {chapter.id} de {book.totalChapters}
                            </p>
                            {isCompleted && readingTime > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-green-600 font-medium">
                                  Lido em {formatReadingTime(readingTime)}
                                </span>
                              </div>
                            )}
                          </div>

                          {isLocked ? (
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                background: `hsl(${themeColor} / 0.1)`,
                                border: `1px solid hsl(${themeColor} / 0.2)`,
                              }}
                            >
                              <Lock className="w-4 h-4 text-muted-foreground/50" />
                            </div>
                          ) : (
                            <BookmarkMarker
                              themeColor={themeColor}
                              currentPage={getPageBookmark(chapter.id) ?? chapter.currentPage}
                              totalPages={chapter.totalPages}
                              isCompleted={isCompleted}
                              onPageUpdate={(page) => setPageBookmark(chapter.id, page)}
                            />
                          )}
                        </div>

                        {isCurrent && (
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-1"
                            style={{
                              background: `linear-gradient(90deg, hsl(${themeColor}), hsl(${themeColor} / 0.6))`,
                            }}
                          />
                        )}
                      </button>
                    </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4 rotate-180" />
              Próximo
            </p>
          </div>

          <Dialog open={showQuestion} onOpenChange={setShowQuestion}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-serif">
                  <HelpCircle className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                  Pergunta do Capítulo {selectedChapter?.id}
                </DialogTitle>
              </DialogHeader>

              {selectedChapter?.question && (
                <div className="space-y-6 py-4">
                  <p className="text-lg">{selectedChapter.question.text}</p>
                  
                  <div className="space-y-2">
                    {selectedChapter.question.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => !showResult && setSelectedAnswer(index)}
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded border transition-all ${
                          showResult
                            ? index === selectedChapter.question!.correctAnswer
                              ? "bg-emerald/10 border-emerald"
                              : selectedAnswer === index
                              ? "bg-destructive/10 border-destructive"
                              : "bg-muted/30 border-border"
                            : selectedAnswer === index
                            ? "border-secondary bg-secondary/10"
                            : "bg-muted/30 border-border hover:border-secondary/50"
                        }`}
                        style={selectedAnswer === index && !showResult ? {
                          borderColor: `hsl(${themeColor})`,
                          backgroundColor: `hsl(${themeColor} / 0.1)`,
                        } : {}}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {showResult && (
                    <div className={`p-4 rounded ${
                      selectedAnswer === selectedChapter.question.correctAnswer
                        ? "bg-emerald/10 border border-emerald/30"
                        : "bg-destructive/10 border border-destructive/30"
                    }`}>
                      <p className="font-semibold mb-2">
                        {selectedAnswer === selectedChapter.question.correctAnswer
                          ? "✓ Correto! +10 pts"
                          : "✗ Incorreto"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedChapter.question.explanation}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {!showResult ? (
                      <Button 
                        className="w-full"
                        onClick={handleAnswerSubmit}
                        disabled={selectedAnswer === null}
                        style={{ 
                          background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                        }}
                      >
                        Confirmar Resposta
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => setShowQuestion(false)}
                        style={{ 
                          background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                        }}
                      >
                        Continuar
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {completedChapterForModal && (
            <CompletedChapterModal
              isOpen={showCompletedModal}
              onClose={() => {
                setShowCompletedModal(false);
                setCompletedChapterForModal(null);
                refetch();
              }}
              chapter={completedChapterForModal}
              bookId={bookId}
              themeColor={themeColor}
              onReread={handleRereadChapter}
            />
          )}
        </div>
      </Layout>
    );
  }

  // Books listing view
  return (
    <Layout isPremium={isPremium}>
      <div className="max-w-5xl mx-auto py-8 section-bg-challenges">
        {/* Header */}
        <header className="mb-10 animate-fade-in" data-tutorial="trilhas-header">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Biblioteca de Jornadas</p>
          <h1 className="text-3xl lg:text-4xl font-serif font-semibold mb-2">Trilhas Literárias</h1>
          <p className="text-muted-foreground max-w-xl">
            {filteredTrails.length > 0 
              ? "Suas trilhas personalizadas. Adicione mais livros pela Biblioteca."
              : "Você ainda não tem trilhas. Faça o quiz ou adicione livros pela Biblioteca."}
          </p>
        </header>

        {/* Empty state */}
        {filteredTrails.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-semibold mb-2">Nenhuma trilha ainda</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Faça o quiz literário para receber recomendações ou acesse a Biblioteca e adicione livros às suas trilhas.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/quiz-onboarding">
                <Button variant="default" className="gap-2">
                  <Play className="w-4 h-4" />
                  Fazer o Quiz
                </Button>
              </Link>
              <Link to="/biblioteca">
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Ir à Biblioteca
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-tutorial="trilhas-grid">
          {filteredTrails.map((book, index) => {
            const completedChapters = book.chapters.filter(c => c.status === "completed").length;
            const progress = (completedChapters / book.totalChapters) * 100;
            const currentChapter = book.chapters.find(c => c.status === "current");
            const themeColor = book.themeColor;
            const isCurrentTrail = activeTrail?.bookId === book.id;
            const isQuiz = isQuizRecommended(book.title);

            return (
              <Link
                key={book.id}
                to={book.isPremium && !isPremium ? "#" : `/trilhas/${book.id}`}
                className={`editorial-card overflow-hidden card-hover animate-fade-in ${
                  book.isPremium && !isPremium ? "opacity-80 cursor-not-allowed" : ""
                }`}
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                  borderColor: progress > 0 ? `hsl(${themeColor} / 0.3)` : undefined,
                }}
                onClick={e => book.isPremium && !isPremium && e.preventDefault()}
              >
                {/* Cover */}
                <div 
                  className="h-44 flex items-center justify-center relative overflow-hidden"
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${themeColor} / 0.15), hsl(${themeColor} / 0.05))`,
                  }}
                >
                  {book.coverImage ? (
                    <img 
                      src={book.coverImage} 
                      alt={book.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.querySelector('.emoji-fallback')?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={`text-5xl emoji-fallback ${book.coverImage ? 'hidden absolute' : ''}`}>{book.cover}</span>
                  
                  {/* Quiz recommendation badge */}
                  {isQuiz && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded bg-accent/90 text-xs font-semibold text-accent-foreground">
                      <Award className="w-3 h-3" />
                      Recomendado
                    </div>
                  )}

                  {book.isPremium && !isPremium && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded bg-card/90 text-xs font-medium">
                      <Crown className="w-3 h-3 text-accent" />
                      Premium
                    </div>
                  )}
                  
                  {progress > 0 && (
                    <div 
                      className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: `hsl(${themeColor} / 0.9)`,
                        color: 'white',
                      }}
                    >
                      <CheckCircle className="w-3 h-3" />
                      {completedChapters}/{book.totalChapters}
                    </div>
                  )}

                  {/* Remove from trails button */}
                  {!isQuiz && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeTrail(book.title);
                        toast.success(`"${book.title}" removido das trilhas`);
                      }}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-card/80 flex items-center justify-center hover:bg-destructive/80 transition-colors"
                      title="Remover da trilha"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-white" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <p 
                    className="text-xs uppercase tracking-wider font-medium mb-1"
                    style={{ color: `hsl(${themeColor})` }}
                  >
                    {book.genre}
                  </p>
                  <h3 className="font-serif text-lg font-semibold mb-1">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{book.author}</p>
                  
                  {currentChapter && (
                    <p 
                      className="text-xs mb-3 flex items-center gap-1"
                      style={{ color: `hsl(${themeColor})` }}
                    >
                      <Bookmark className="w-3 h-3" />
                      {currentChapter.title}
                    </p>
                  )}
                  
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-bar h-1.5">
                      <div 
                        className="progress-bar-fill"
                        style={{ 
                          width: `${progress}%`,
                          background: `hsl(${themeColor})`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Start Trail Button */}
                  {!book.isPremium || isPremium ? (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectTrail(book);
                      }}
                      className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isCurrentTrail
                          ? "bg-accent/10 text-accent cursor-default"
                          : "text-white hover:opacity-90"
                      }`}
                      style={!isCurrentTrail ? {
                        background: `linear-gradient(135deg, hsl(${themeColor}), hsl(${themeColor.replace(/\d+%$/, (m) => parseInt(m) + 10 + '%')}))`,
                      } : {}}
                      disabled={isCurrentTrail}
                    >
                      {isCurrentTrail ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Trilha Atual
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Começar Trilha
                        </>
                      )}
                    </button>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Trilhas;
