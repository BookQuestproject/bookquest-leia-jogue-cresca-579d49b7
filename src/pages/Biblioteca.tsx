import { useState } from "react";
import { Library, Search, Filter, Plus, Star, BookOpen, Check, Clock, AlertCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
}

interface SuggestedBook {
  title: string;
  author: string;
  status: "pendente" | "validando" | "aprovado" | "rejeitado";
  submittedAt: Date;
}

const allBooks: Book[] = [
  { id: 1, title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", cover: "https://m.media-amazon.com/images/I/81ibfYk4qmL._AC_UF1000,1000_QL80_.jpg", genre: "Fantasia", pages: 264, rating: 4.8, popularity: 95, description: "Um jovem descobre que é um bruxo e entra para a escola de magia de Hogwarts." },
  { id: 2, title: "O Senhor dos Anéis", author: "J.R.R. Tolkien", cover: "https://m.media-amazon.com/images/I/81j7E0oFdRL._AC_UF1000,1000_QL80_.jpg", genre: "Fantasia", pages: 1200, rating: 4.9, popularity: 92, description: "Uma jornada épica para destruir o Um Anel e derrotar o Senhor das Trevas." },
  { id: 3, title: "Orgulho e Preconceito", author: "Jane Austen", cover: "https://m.media-amazon.com/images/I/71Q1tPupKjL._AC_UF1000,1000_QL80_.jpg", genre: "Romance", pages: 432, rating: 4.7, popularity: 88, description: "A história de Elizabeth Bennet e Mr. Darcy na Inglaterra do século XIX." },
  { id: 4, title: "1984", author: "George Orwell", cover: "https://m.media-amazon.com/images/I/819js3EQwbL._AC_UF1000,1000_QL80_.jpg", genre: "Ficção Científica", pages: 328, rating: 4.6, popularity: 90, description: "Uma distopia sobre vigilância e controle governamental totalitário." },
  { id: 5, title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", cover: "https://m.media-amazon.com/images/I/71OZY035QKL._AC_UF1000,1000_QL80_.jpg", genre: "Clássico", pages: 96, rating: 4.9, popularity: 97, description: "As reflexões de um pequeno príncipe sobre amor, amizade e natureza humana." },
  { id: 6, title: "E Não Sobrou Nenhum", author: "Agatha Christie", cover: "https://m.media-amazon.com/images/I/91rZGpDkoFL._AC_UF1000,1000_QL80_.jpg", genre: "Mistério", pages: 272, rating: 4.7, popularity: 85, description: "Dez pessoas são convidadas para uma ilha isolada e começam a morrer uma a uma." },
  { id: 7, title: "A Culpa é das Estrelas", author: "John Green", cover: "https://m.media-amazon.com/images/I/71VtYjKByoL._AC_UF1000,1000_QL80_.jpg", genre: "Romance", pages: 288, rating: 4.5, popularity: 82, description: "Dois adolescentes com câncer se conhecem e vivem uma história de amor." },
  { id: 8, title: "Dom Casmurro", author: "Machado de Assis", cover: "https://m.media-amazon.com/images/I/61wezcT0yJL._AC_UF1000,1000_QL80_.jpg", genre: "Clássico", pages: 256, rating: 4.4, popularity: 78, description: "A história de Bentinho e Capitu, com o famoso enigma da traição." },
  { id: 9, title: "Jogos Vorazes", author: "Suzanne Collins", cover: "https://m.media-amazon.com/images/I/71un2hI4mcL._AC_UF1000,1000_QL80_.jpg", genre: "Aventura", pages: 400, rating: 4.5, popularity: 88, description: "Em uma distopia, jovens lutam até a morte em um reality show brutal." },
  { id: 10, title: "O Hobbit", author: "J.R.R. Tolkien", cover: "https://m.media-amazon.com/images/I/91b0C2YNSrL._AC_UF1000,1000_QL80_.jpg", genre: "Fantasia", pages: 320, rating: 4.8, popularity: 91, description: "Bilbo Bolseiro parte em uma aventura com anões para recuperar um tesouro." },
  { id: 11, title: "Percy Jackson e o Ladrão de Raios", author: "Rick Riordan", cover: "https://m.media-amazon.com/images/I/91WH7-RsiOL._AC_UF1000,1000_QL80_.jpg", genre: "Fantasia", pages: 400, rating: 4.6, popularity: 86, description: "Um adolescente descobre que é filho de um deus grego." },
  { id: 12, title: "Sapiens", author: "Yuval Noah Harari", cover: "https://m.media-amazon.com/images/I/71N3-FFSDxL._AC_UF1000,1000_QL80_.jpg", genre: "Não-Ficção", pages: 464, rating: 4.7, popularity: 84, description: "Uma breve história da humanidade desde os primeiros humanos." },
];

const genres = ["Todos", "Fantasia", "Romance", "Mistério", "Clássico", "Ficção Científica", "Aventura", "Não-Ficção"];
const sortOptions = ["Popularidade", "Avaliação", "Título A-Z", "Autor A-Z"];

const Biblioteca = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [sortBy, setSortBy] = useState("Popularidade");
  const [showAddModal, setShowAddModal] = useState(false);
  const [suggestedBooks, setSuggestedBooks] = useState<SuggestedBook[]>([]);
  const [newBook, setNewBook] = useState({ title: "", author: "" });

  const filteredBooks = allBooks
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
    toast.success(`"${book.title}" adicionado à sua estante!`, {
      description: `O livro foi adicionado em '${category}'`,
    });
  };

  const handleSuggestBook = () => {
    if (!newBook.title.trim() || !newBook.author.trim()) {
      toast.error("Preencha título e autor do livro");
      return;
    }

    const suggestion: SuggestedBook = {
      title: newBook.title,
      author: newBook.author,
      status: "pendente",
      submittedAt: new Date(),
    };

    setSuggestedBooks([...suggestedBooks, suggestion]);
    setNewBook({ title: "", author: "" });
    
    toast.success("Livro enviado para validação!", {
      description: "Verificaremos se o livro existe e está correto."
    });

    // Simulate validation after 3 seconds
    setTimeout(() => {
      setSuggestedBooks(prev => 
        prev.map(s => 
          s.title === suggestion.title && s.author === suggestion.author
            ? { ...s, status: "validando" }
            : s
        )
      );
    }, 1500);

    setTimeout(() => {
      const isValid = Math.random() > 0.3;
      setSuggestedBooks(prev => 
        prev.map(s => 
          s.title === suggestion.title && s.author === suggestion.author
            ? { ...s, status: isValid ? "aprovado" : "rejeitado" }
            : s
        )
      );
      
      if (isValid) {
        toast.success(`"${suggestion.title}" foi aprovado e adicionado!`);
      } else {
        toast.error(`"${suggestion.title}" não foi encontrado em nossa base de dados.`);
      }
    }, 4000);

    setShowAddModal(false);
  };

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Library className="w-8 h-8 text-primary" />
              Biblioteca
            </h1>
            <p className="text-muted-foreground">
              Explore nossa coleção de livros e adicione à sua estante
            </p>
          </div>
          <Button variant="hero" className="gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="w-5 h-5" />
            Sugerir Livro
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
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
        <div className="flex gap-2 mb-6 overflow-x-auto py-1 -my-1">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedGenre === genre
                  ? "bg-secondary text-secondary-foreground ring-2 ring-secondary"
                  : "bg-muted text-primary hover:bg-muted/80"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Pending Suggestions */}
        {suggestedBooks.filter(s => s.status !== "aprovado").length > 0 && (
          <div className="glass-card rounded-2xl p-4 mb-6">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Suas sugestões
            </h3>
            <div className="space-y-2">
              {suggestedBooks.filter(s => s.status !== "aprovado").map((book, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{book.title}</p>
                    <p className="text-xs text-muted-foreground">{book.author}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    book.status === "pendente" ? "bg-yellow-500/20 text-yellow-500" :
                    book.status === "validando" ? "bg-blue-500/20 text-blue-500" :
                    book.status === "aprovado" ? "bg-green-500/20 text-green-500" :
                    "bg-red-500/20 text-red-500"
                  }`}>
                    {book.status === "pendente" && "⏳ Pendente"}
                    {book.status === "validando" && "🔍 Validando..."}
                    {book.status === "aprovado" && "✅ Aprovado"}
                    {book.status === "rejeitado" && "❌ Não encontrado"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          {filteredBooks.length} livros encontrados
        </p>

        {/* Books Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => handleAddToShelf(book, "Quero Ler")}
                  >
                    <Plus className="w-4 h-4" />
                    Quero Ler
                  </Button>
                  <Button 
                    variant="hero" 
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => handleAddToShelf(book, "Lendo")}
                  >
                    <BookOpen className="w-4 h-4" />
                    Lendo
                  </Button>
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

            <div className="space-y-6 py-4">
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Como funciona a validação</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Seu livro será verificado automaticamente. Conferimos se o título e autor existem 
                      e se os dados estão corretos antes de adicionar ao sistema.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Título do livro</label>
                <Input
                  placeholder="Ex: O Nome do Vento"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Autor</label>
                <Input
                  placeholder="Ex: Patrick Rothfuss"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
                <Button variant="hero" className="flex-1 gap-2" onClick={handleSuggestBook}>
                  <Check className="w-4 h-4" />
                  Enviar para Validação
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Biblioteca;
