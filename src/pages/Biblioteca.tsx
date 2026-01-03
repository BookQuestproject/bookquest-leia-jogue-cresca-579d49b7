import { useState } from "react";
import { Library, Search, Filter, Plus, Star, BookOpen } from "lucide-react";
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
import { toast } from "sonner";

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  genre: string;
  rating: number;
  popularity: number;
  description: string;
}

const allBooks: Book[] = [
  { id: 1, title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", cover: "📘", genre: "Fantasia", rating: 4.8, popularity: 95, description: "Um jovem descobre que é um bruxo e entra para a escola de magia de Hogwarts." },
  { id: 2, title: "O Senhor dos Anéis", author: "J.R.R. Tolkien", cover: "📗", genre: "Fantasia", rating: 4.9, popularity: 92, description: "Uma jornada épica para destruir o Um Anel e derrotar o Senhor das Trevas." },
  { id: 3, title: "Orgulho e Preconceito", author: "Jane Austen", cover: "📕", genre: "Romance", rating: 4.7, popularity: 88, description: "A história de Elizabeth Bennet e Mr. Darcy na Inglaterra do século XIX." },
  { id: 4, title: "1984", author: "George Orwell", cover: "📙", genre: "Ficção Científica", rating: 4.6, popularity: 90, description: "Uma distopia sobre vigilância e controle governamental totalitário." },
  { id: 5, title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", cover: "📒", genre: "Clássico", rating: 4.9, popularity: 97, description: "As reflexões de um pequeno príncipe sobre amor, amizade e natureza humana." },
  { id: 6, title: "E Não Sobrou Nenhum", author: "Agatha Christie", cover: "📓", genre: "Mistério", rating: 4.7, popularity: 85, description: "Dez pessoas são convidadas para uma ilha isolada e começam a morrer uma a uma." },
  { id: 7, title: "A Culpa é das Estrelas", author: "John Green", cover: "💚", genre: "Romance", rating: 4.5, popularity: 82, description: "Dois adolescentes com câncer se conhecem e vivem uma história de amor." },
  { id: 8, title: "Dom Casmurro", author: "Machado de Assis", cover: "📕", genre: "Clássico", rating: 4.4, popularity: 78, description: "A história de Bentinho e Capitu, com o famoso enigma da traição." },
  { id: 9, title: "Jogos Vorazes", author: "Suzanne Collins", cover: "🔥", genre: "Aventura", rating: 4.5, popularity: 88, description: "Em uma distopia, jovens lutam até a morte em um reality show brutal." },
  { id: 10, title: "O Hobbit", author: "J.R.R. Tolkien", cover: "🏔️", genre: "Fantasia", rating: 4.8, popularity: 91, description: "Bilbo Bolseiro parte em uma aventura com anões para recuperar um tesouro." },
  { id: 11, title: "Percy Jackson e o Ladrão de Raios", author: "Rick Riordan", cover: "⚡", genre: "Fantasia", rating: 4.6, popularity: 86, description: "Um adolescente descobre que é filho de um deus grego." },
  { id: 12, title: "Sapiens", author: "Yuval Noah Harari", cover: "🧠", genre: "Não-Ficção", rating: 4.7, popularity: 84, description: "Uma breve história da humanidade desde os primeiros humanos." },
];

const genres = ["Todos", "Fantasia", "Romance", "Mistério", "Clássico", "Ficção Científica", "Aventura", "Não-Ficção"];
const sortOptions = ["Popularidade", "Avaliação", "Título A-Z", "Autor A-Z"];

const Biblioteca = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [sortBy, setSortBy] = useState("Popularidade");

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

  const handleAddToShelf = (book: Book) => {
    toast.success(`"${book.title}" adicionado à sua estante!`, {
      description: "O livro foi adicionado em 'Quero Ler'",
    });
  };

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Library className="w-8 h-8 text-primary" />
            Biblioteca
          </h1>
          <p className="text-muted-foreground">
            Explore nossa coleção de livros e adicione à sua estante
          </p>
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
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedGenre === genre
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book, index) => (
            <div 
              key={book.id} 
              className="glass-card rounded-2xl overflow-hidden card-hover animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex gap-4 p-4">
                <div className="w-20 h-28 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl">{book.cover}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {book.genre}
                  </span>
                  <h3 className="font-bold mt-1 truncate">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    <span className="text-sm font-bold">{book.rating}</span>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {book.description}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => handleAddToShelf(book)}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar à Estante
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Biblioteca;
