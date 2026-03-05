import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Library, Search, Filter, Plus, Star, BookOpen, Check, Clock, AlertCircle, Zap, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBookshelf, type ShelfCategory } from "@/hooks/useBookshelf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useBookSuggestions } from "@/hooks/useBookSuggestions";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  genre: string;
  pages: number;
  rating: number;
  popularity: number;
  description: string;
  detailedDescription: string;
}

const allBooks: Book[] = [
  { id: 1, title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", cover: "https://m.media-amazon.com/images/I/81ibfYk4qmL._AC_UF1000,1000_QL80_.jpg", genre: "Fantasia", pages: 264, rating: 4.8, popularity: 95, description: "Um jovem descobre que é um bruxo e entra para a escola de magia de Hogwarts.", detailedDescription: "Harry Potter é um garoto órfão que vive infeliz com seus tios, os Dursley. No dia de seu aniversário de onze anos, ele descobre que é um bruxo e foi aceito na Escola de Magia e Bruxaria de Hogwarts. Lá, Harry faz amizades verdadeiras com Rony Weasley e Hermione Granger, aprende feitiços e poções, joga Quadribol e descobre segredos sombrios sobre o passado de seus pais. Aos poucos, ele percebe que uma força maligna — o temido Lord Voldemort — está em busca da lendária Pedra Filosofal, capaz de conceder vida eterna. Com coragem e lealdade, Harry precisa enfrentar perigos que vão muito além do que um aluno do primeiro ano deveria enfrentar." },
  { id: 2, title: "O Senhor dos Anéis", author: "J.R.R. Tolkien", cover: "https://m.media-amazon.com/images/I/71jLBXtWJWL._AC_UF1000,1000_QL80_.jpg", genre: "Fantasia", pages: 1200, rating: 4.9, popularity: 92, description: "Uma jornada épica para destruir o Um Anel e derrotar o Senhor das Trevas.", detailedDescription: "Em um mundo chamado Terra-média, o jovem hobbit Frodo Bolseiro herda um anel misterioso de seu tio Bilbo. Logo descobre que se trata do Um Anel, forjado pelo Senhor das Trevas Sauron para dominar todos os povos livres. Com a ajuda da Sociedade do Anel — formada por hobbits, elfos, anões, homens e um mago — Frodo embarca em uma jornada perigosa até a Montanha da Perdição, o único lugar onde o anel pode ser destruído. Ao longo do caminho, alianças são testadas, batalhas épicas são travadas e o destino de toda a Terra-média depende da coragem e da amizade de um pequeno hobbit que carrega o maior fardo do mundo." },
  { id: 3, title: "Orgulho e Preconceito", author: "Jane Austen", cover: "https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UF1000,1000_QL80_.jpg", genre: "Romance", pages: 432, rating: 4.7, popularity: 88, description: "A história de Elizabeth Bennet e Mr. Darcy na Inglaterra do século XIX.", detailedDescription: "Na Inglaterra rural do início do século XIX, a família Bennet — composta por cinco irmãs e pais com personalidades opostas — enfrenta a pressão social do casamento. Quando o rico e reservado Mr. Darcy chega à vizinhança, Elizabeth Bennet, a segunda filha mais velha, forma uma primeira impressão negativa dele por sua aparente arrogância. Ao mesmo tempo, Darcy luta contra sua atração por Elizabeth, que ele considera socialmente inferior. Através de mal-entendidos, revelações surpreendentes e crescimento pessoal, ambos precisam superar seus orgulhos e preconceitos para descobrir que o verdadeiro amor exige vulnerabilidade e humildade." },
  { id: 4, title: "1984", author: "George Orwell", cover: "https://m.media-amazon.com/images/I/61ZewDE3beL._AC_UF1000,1000_QL80_.jpg", genre: "Ficção Científica", pages: 328, rating: 4.6, popularity: 90, description: "Uma distopia sobre vigilância e controle governamental totalitário.", detailedDescription: "Em um futuro sombrio, o mundo está dividido em três superestados em guerra permanente. Winston Smith vive na Oceânia, governada pelo Partido e seu líder onipresente, o Grande Irmão, que vigia cada cidadão através de teletelas. Winston trabalha no Ministério da Verdade, onde sua função é reescrever a história para que ela se alinhe à narrativa do Partido. Insatisfeito com a opressão e a manipulação da realidade, ele começa a questionar o sistema e inicia um caso proibido com Julia, uma colega rebelde. Juntos, eles buscam a resistência, mas descobrem que em um estado totalitário, até os pensamentos mais íntimos podem ser controlados." },
  { id: 5, title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", cover: "https://m.media-amazon.com/images/I/71OZY035QKL._AC_UF1000,1000_QL80_.jpg", genre: "Clássico", pages: 96, rating: 4.9, popularity: 97, description: "As reflexões de um pequeno príncipe sobre amor, amizade e natureza humana.", detailedDescription: "Um aviador, perdido no deserto do Saara após uma pane em seu avião, encontra um pequeno e misterioso menino que diz vir de um asteroide minúsculo chamado B-612. O Pequeno Príncipe conta ao aviador sobre sua rosa, única e vaidosa, que ele deixou para trás em seu planeta, e sobre sua viagem por diversos asteroides, onde conheceu personagens excêntricos como um rei sem súditos, um vaidoso, um bêbado e um homem de negócios. Na Terra, ele encontra uma raposa que lhe ensina a lição mais importante: 'Tu te tornas eternamente responsável por aquilo que cativas.' A história é uma parábola poética sobre o essencial invisível aos olhos, o valor das relações humanas e a pureza do olhar infantil." },
  { id: 6, title: "E Não Sobrou Nenhum", author: "Agatha Christie", cover: "/images/covers/e-nao-sobrou-nenhum.jpg", genre: "Mistério", pages: 272, rating: 4.7, popularity: 85, description: "Dez pessoas são convidadas para uma ilha isolada e começam a morrer uma a uma.", detailedDescription: "Dez estranhos são convidados para a Ilha do Soldado por um anfitrião misterioso que nenhum deles conhece. Após chegarem, descobrem que não há ninguém esperando por eles — apenas uma gravação acusando cada um de ter cometido um assassinato impune. Logo, os convidados começam a morrer um a um, seguindo os versos de uma cantiga infantil macabra. Presos na ilha, sem comunicação com o continente, a paranoia e o medo tomam conta do grupo. Cada um se torna suspeito e potencial vítima ao mesmo tempo. Com uma trama engenhosa e um desfecho surpreendente, este é considerado o romance policial mais vendido de todos os tempos." },
  { id: 7, title: "A Culpa é das Estrelas", author: "John Green", cover: "/images/covers/a-culpa-e-das-estrelas.jpg", genre: "Romance", pages: 288, rating: 4.5, popularity: 82, description: "Dois adolescentes com câncer se conhecem e vivem uma história de amor.", detailedDescription: "Hazel Grace Lancaster, dezesseis anos, é obrigada pela mãe a frequentar um grupo de apoio para jovens com câncer. É lá que ela conhece Augustus Waters, um rapaz charmoso, inteligente e em remissão de osteossarcoma. Os dois se conectam imediatamente através do humor ácido, das referências literárias e da recusa em se verem como vítimas. Quando Augustus usa seu desejo da Fundação Gênio para levá-la a Amsterdã para conhecer o autor de seu livro favorito, a viagem se transforma em uma jornada de descobertas, decepções e um amor avassalador. O romance aborda a mortalidade, o sentido da vida e a intensidade de amar sabendo que o tempo é limitado." },
  { id: 8, title: "Dom Casmurro", author: "Machado de Assis", cover: "/images/covers/dom-casmurro.jpg", genre: "Clássico", pages: 256, rating: 4.4, popularity: 78, description: "A história de Bentinho e Capitu, com o famoso enigma da traição.", detailedDescription: "Bentinho Santiago, agora um homem maduro e solitário apelidado de Dom Casmurro, reconstrói em livro a história de sua vida para tentar 'atar as duas pontas' — conectar o jovem que foi ao homem que se tornou. Ele narra sua infância no Rio de Janeiro imperial, o amor juvenil por Capitu, a vizinha de 'olhos de ressaca', e a resistência de sua mãe, que havia prometido fazê-lo padre. Após vencer esse obstáculo e se casar com Capitu, Bentinho é consumido pelo ciúme quando percebe semelhanças entre seu filho Ezequiel e seu melhor amigo Escobar. O grande enigma da literatura brasileira permanece: Capitu traiu ou não traiu? O leitor é juiz de um narrador que pode não ser confiável." },
  { id: 9, title: "Jogos Vorazes", author: "Suzanne Collins", cover: "https://m.media-amazon.com/images/I/71un2hI4mcL._AC_UF1000,1000_QL80_.jpg", genre: "Aventura", pages: 400, rating: 4.5, popularity: 88, description: "Em uma distopia, jovens lutam até a morte em um reality show brutal.", detailedDescription: "Em Panem, uma nação construída sobre as ruínas da América do Norte, a Capital mantém o controle sobre doze distritos empobrecidos através dos Jogos Vorazes — uma competição anual televisionada onde 24 jovens são forçados a lutar até a morte em uma arena. Quando a irmã mais nova de Katniss Everdeen é sorteada como tributo do Distrito 12, Katniss se voluntaria para tomar seu lugar. Na arena, ela precisa usar suas habilidades de caça e sobrevivência, formar alianças estratégicas e lidar com sentimentos inesperados por Peeta Mellark, o outro tributo de seu distrito. O que começa como uma luta pela sobrevivência se transforma em um ato de rebeldia que pode mudar o destino de toda a nação." },
  { id: 10, title: "O Hobbit", author: "J.R.R. Tolkien", cover: "https://m.media-amazon.com/images/I/91b0C2YNSrL._AC_UF1000,1000_QL80_.jpg", genre: "Fantasia", pages: 320, rating: 4.8, popularity: 91, description: "Bilbo Bolseiro parte em uma aventura com anões para recuperar um tesouro.", detailedDescription: "Bilbo Bolseiro é um hobbit tranquilo que vive confortavelmente em sua toca no Condado, sem nenhum interesse em aventuras. Tudo muda quando o mago Gandalf aparece à sua porta com treze anões liderados por Thorin Escudo-de-Carvalho, convocando-o para uma missão: recuperar o tesouro do Reino Sob a Montanha, roubado pelo terrível dragão Smaug. Relutante no início, Bilbo descobre ao longo da jornada uma coragem que ele mesmo desconhecia. Enfrenta trolls, orcs, aranhas gigantes e o sinistro Gollum — de quem obtém um anel mágico que torna seu portador invisível. Esta aventura não apenas transforma Bilbo, mas prepara o cenário para os eventos épicos de O Senhor dos Anéis." },
  { id: 11, title: "Percy Jackson e o Ladrão de Raios", author: "Rick Riordan", cover: "/images/covers/percy-jackson.jpg", genre: "Fantasia", pages: 400, rating: 4.6, popularity: 86, description: "Um adolescente descobre que é filho de um deus grego.", detailedDescription: "Percy Jackson tem doze anos e problemas demais: dislexia, TDAH e um histórico de expulsões escolares. Quando sua professora de matemática se transforma em um monstro mitológico e tenta matá-lo, Percy descobre que é um semideus — filho de Poseidon, o deus dos mares. Enviado ao Acampamento Meio-Sangue, um refúgio para jovens como ele, Percy descobre que o raio-mestre de Zeus foi roubado e ele é o principal suspeito. Com apenas dez dias para encontrar o raio e evitar uma guerra entre os deuses do Olimpo, Percy parte em uma missão pela América com seus amigos Annabeth e Grover, enfrentando monstros da mitologia grega, traições e revelações sobre sua própria identidade." },
  { id: 12, title: "Sapiens", author: "Yuval Noah Harari", cover: "https://m.media-amazon.com/images/I/71N3-FFSDxL._AC_UF1000,1000_QL80_.jpg", genre: "Não-Ficção", pages: 464, rating: 4.7, popularity: 84, description: "Uma breve história da humanidade desde os primeiros humanos.", detailedDescription: "Há cerca de 100 mil anos, pelo menos seis espécies de humanos habitavam a Terra. Hoje, somos apenas nós: Homo sapiens. Como nossa espécie conseguiu dominar o planeta? Yuval Noah Harari conduz o leitor por uma jornada fascinante desde a Revolução Cognitiva — quando os sapiens desenvolveram a capacidade de criar ficções e mitos compartilhados — passando pela Revolução Agrícola, que transformou caçadores-coletores em agricultores sedentários, até a Revolução Científica, que nos deu poder sem precedentes sobre a natureza. O livro desafia visões estabelecidas sobre religião, capitalismo, direitos humanos e felicidade, argumentando que muitas das estruturas que consideramos naturais são, na verdade, ficções coletivas que sustentam a cooperação em larga escala." },
];

const genres = ["Todos", "Fantasia", "Romance", "Mistério", "Clássico", "Ficção Científica", "Aventura", "Não-Ficção"];
const sortOptions = ["Popularidade", "Avaliação", "Título A-Z", "Autor A-Z"];

const Biblioteca = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isFromEstante = searchParams.get("from") === "estante";
  const estanteCategory = searchParams.get("category") || "lendo";
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectedBook, setInspectedBook] = useState<Book | null>(null);
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [sortBy, setSortBy] = useState("Popularidade");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", author: "", reason: "", externalLink: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { addBook } = useBookshelf();
  const { suggestions, createSuggestion } = useBookSuggestions();

  // Fetch approved suggestions from the database (visible to all authenticated users)
  const [approvedBooks, setApprovedBooks] = useState<Book[]>([]);
  
  useEffect(() => {
    const fetchApproved = async () => {
      const { data, error } = await supabase
        .from('book_suggestions')
        .select('*')
        .eq('status', 'approved');
      
      if (!error && data) {
        const mapped: Book[] = data.map((s, idx) => {
          // Parse chapters_list JSON for extra metadata
          let meta: any = {};
          if (s.chapters_list && typeof s.chapters_list === 'string') {
            try { meta = JSON.parse(s.chapters_list); } catch {}
          } else if (s.chapters_list && typeof s.chapters_list === 'object') {
            meta = s.chapters_list;
          }
          
          return {
            id: 1000 + idx, // offset to avoid collision with static IDs
            title: meta.correct_title || s.title,
            author: meta.correct_author || s.author || "Autor desconhecido",
            cover: meta.cover_url || `https://placehold.co/200x300/1e293b/e2e8f0?text=${encodeURIComponent(s.title.slice(0, 20))}`,
            genre: meta.genre || "Outros",
            pages: meta.pages || 200,
            rating: meta.rating || 4.0,
            popularity: 70,
            description: meta.description || s.book_summary || "",
            detailedDescription: meta.detailed_description || s.narrative_context || s.book_summary || "",
          };
        });
        
        // Deduplicate against static catalog
        const normalise = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const filtered = mapped.filter(m => 
          !allBooks.some(b => normalise(b.title) === normalise(m.title))
        );
        
        setApprovedBooks(filtered);
      }
    };
    
    fetchApproved();
  }, [suggestions]); // refetch when user creates a new suggestion

  const combinedBooks = useMemo(() => [...allBooks, ...approvedBooks], [approvedBooks]);

  const filteredBooks = combinedBooks
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === "Todos" || book.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Avaliação":
          return b.rating - a.rating;
        case "Título A-Z":
          return a.title.localeCompare(b.title);
        case "Autor A-Z":
          return a.author.localeCompare(b.author);
        default:
          return b.popularity - a.popularity;
      }
    });

  const handleAddToShelf = (book: Book, category: string) => {
    addBook(
      { id: book.id, title: book.title, author: book.author, cover: book.cover },
      category as ShelfCategory
    );
    toast.success(`"${book.title}" adicionado à sua estante!`, {
      description: `O livro foi adicionado em '${category}'`,
    });
    if (isFromEstante) {
      navigate(`/estante?category=${category}`);
    }
  };

  const handleInspect = (book: Book) => {
    setInspectedBook(book);
  };

  // Check if a book already exists in the library catalog
  const findDuplicateInLibrary = (title: string, author: string) => {
    const normalise = (s: string) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const t = normalise(title);
    const a = normalise(author);
    return combinedBooks.find(
      (b) => normalise(b.title) === t || (t.length > 4 && normalise(b.title).includes(t) && normalise(b.author).includes(a))
    );
  };

  const duplicateBook = newBook.title.trim().length > 2 ? findDuplicateInLibrary(newBook.title, newBook.author) : null;

  const [verificationResult, setVerificationResult] = useState<{ exists: boolean; book?: any } | null>(null);

  const handleSuggestBook = async () => {
    if (!newBook.title.trim()) {
      toast.error("Preencha o título do livro");
      return;
    }

    if (duplicateBook) {
      toast.error(`"${duplicateBook.title}" já está disponível na biblioteca!`);
      return;
    }

    setIsSubmitting(true);
    setVerificationResult(null);
    const suggestionId = await createSuggestion(
      newBook.title,
      newBook.author,
      newBook.reason,
      newBook.externalLink
    );
    
    if (suggestionId) {
      toast.success("Sugestão registrada! Analisando o livro com IA...", {
        icon: <Sparkles className="w-4 h-4 text-accent" />,
      });

      try {
        const { data, error } = await supabase.functions.invoke('verify-book', {
          body: {
            title: newBook.title,
            author: newBook.author || undefined,
            external_link: newBook.externalLink || undefined,
            suggestion_id: suggestionId,
          },
        });

        if (!error && data?.success && data.book?.exists) {
          setVerificationResult({ exists: true, book: data.book });
          toast.success("Livro verificado com sucesso!", {
            description: `"${data.book.correct_title}" foi analisado e está aguardando aprovação.`,
            icon: <Check className="w-4 h-4 text-green-500" />,
            duration: 5000,
          });
          toast(`+15 XP 🎉`, {
            description: "Recompensa por sugerir um livro válido!",
            icon: <Zap className="w-4 h-4 text-accent" />,
            duration: 4000,
          });
        } else if (!error && data?.success && data.book?.is_spam) {
          toast.error("Conteúdo detectado como spam ou impróprio", {
            description: data.book?.reason || "A sugestão foi rejeitada automaticamente.",
            duration: 5000,
          });
        } else if (!error && data?.success && !data.book?.exists) {
          toast.error("Não conseguimos verificar este livro", {
            description: data.book?.reason || "Verifique o título e tente novamente.",
            duration: 5000,
          });
        } else {
          toast.info("Sugestão enviada! A verificação será feita manualmente.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        toast.info("Sugestão enviada! A verificação será feita manualmente.");
      }

      setNewBook({ title: "", author: "", reason: "", externalLink: "" });
      setShowAddModal(false);
    }
    setIsSubmitting(false);
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return { text: "⏳ Pendente", className: "bg-warning/20 text-warning" };
      case "approved":
        return { text: "✅ Aprovado", className: "bg-success/20 text-success" };
      case "rejected":
        return { text: "❌ Rejeitado", className: "bg-destructive/20 text-destructive" };
      default:
        return { text: status, className: "bg-muted text-muted-foreground" };
    }
  };

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 animate-fade-in" data-tutorial="biblioteca-header">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Library className="w-8 h-8 text-primary" />
              Biblioteca
            </h1>
            <p className="text-muted-foreground">
              Explore nossa coleção de livros e adicione à sua estante
            </p>
          </div>
          <Button variant="hero" className="gap-2" onClick={() => setShowAddModal(true)} data-tutorial="biblioteca-suggest">
            <Plus className="w-5 h-5" />
            Sugerir Livro
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8" data-tutorial="biblioteca-search">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou autor..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Gênero" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>{genre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Genre Pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto py-1 -my-1" data-tutorial="biblioteca-genres">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedGenre === genre
                  ? "bg-accent text-accent-foreground ring-2 ring-accent"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>



        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          {filteredBooks.length} livros encontrados
        </p>

        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-tutorial="biblioteca-grid">
          {filteredBooks.map((book, index) => (
            <div 
              key={book.id} 
              className="glass-card rounded-2xl overflow-hidden card-hover animate-fade-in group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex gap-4 p-4">
                <div className="w-20 h-28 rounded-xl flex-shrink-0 overflow-hidden shadow-md">
                  <img 
                    src={book.cover} 
                    alt={`Capa de ${book.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {book.genre}
                  </span>
                  <h3 className="font-bold mt-1 truncate">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="text-sm font-bold">{book.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{book.pages}p</span>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {book.description}
                </p>
                <div className="flex gap-2">
                  {isFromEstante ? (
                    <Button 
                      variant="hero" 
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToShelf(book, estanteCategory)}
                    >
                      Selecionar
                    </Button>
                  ) : (
                    <Button 
                      variant="hero" 
                      size="sm"
                      className="flex-1"
                      onClick={() => handleInspect(book)}
                    >
                      Inspecionar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Book Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Sugerir Novo Livro
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Análise inteligente com IA</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Nossa IA irá verificar automaticamente o livro, corrigir erros de digitação,
                      extrair sinopse, capa, gênero e mais. Após análise, o livro será enviado para aprovação.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Título do livro <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Ex: O Nome do Vento"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Autor <span className="text-muted-foreground text-xs">(opcional — a IA pode identificar)</span>
                </label>
                <Input
                  placeholder="Ex: Patrick Rothfuss"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Link de referência <span className="text-muted-foreground text-xs">(opcional)</span>
                </label>
                <Input
                  placeholder="https://amazon.com.br/... ou link da editora"
                  value={newBook.externalLink}
                  onChange={(e) => setNewBook({ ...newBook, externalLink: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">Amazon, Skoob, editora, etc.</p>
              </div>

              {duplicateBook && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-destructive">Este livro já existe na biblioteca!</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>"{duplicateBook.title}"</strong> de {duplicateBook.author} já está disponível.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Por que recomendar? <span className="text-muted-foreground text-xs">(opcional)</span>
                </label>
                <Textarea
                  placeholder="Conte-nos por que você gosta deste livro..."
                  value={newBook.reason}
                  onChange={(e) => setNewBook({ ...newBook, reason: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  variant="hero" 
                  className="flex-1 gap-2" 
                  onClick={handleSuggestBook}
                  disabled={isSubmitting || !user || !!duplicateBook}
                >
                  <Sparkles className="w-4 h-4" />
                  {isSubmitting ? "Analisando com IA..." : "Enviar e Analisar"}
                </Button>
              </div>
              
              {!user && (
                <p className="text-xs text-center text-muted-foreground">
                  Você precisa estar logado para sugerir um livro
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Inspect Book Modal */}
        <Dialog open={!!inspectedBook} onOpenChange={(open) => !open && setInspectedBook(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            {inspectedBook && (
              <>
                <DialogHeader>
                  <DialogTitle>{inspectedBook.title}</DialogTitle>
                </DialogHeader>
                <div className="flex gap-6 py-4">
                  <div className="w-32 h-44 rounded-xl flex-shrink-0 overflow-hidden shadow-md">
                    <img
                      src={inspectedBook.cover}
                      alt={`Capa de ${inspectedBook.title}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm text-muted-foreground">{inspectedBook.author}</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="text-sm font-bold">{inspectedBook.rating}</span>
                      <span className="text-xs text-muted-foreground">• {inspectedBook.pages} páginas</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{inspectedBook.genre}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{inspectedBook.detailedDescription}</p>
                  </div>
                </div>
                <div className="space-y-3 pt-2 border-t border-border">
                  <p className="text-sm font-medium">Adicionar à estante:</p>
                  <div className="flex flex-wrap gap-2">
                    {["lendo", "quero-ler", "lido", "favoritos", "reelendo", "abandonado"].map((cat) => {
                      const labels: Record<string, string> = {
                        "lendo": "Lendo",
                        "quero-ler": "Quero Ler",
                        "lido": "Lido",
                        "favoritos": "Favoritos",
                        "reelendo": "Reelendo",
                        "abandonado": "Abandonado",
                      };
                      return (
                        <Button
                          key={cat}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleAddToShelf(inspectedBook, cat);
                            setInspectedBook(null);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {labels[cat]}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Biblioteca;
