import { useState } from "react";
import { BookMarked, Plus, ArrowRightLeft, Star, BookOpen, X, Check } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  category: "lendo" | "quero-ler" | "lido" | "abandonado" | "favoritos";
  progress?: number;
  rating?: number;
  review?: string;
}

const mockBooks: Book[] = [
  { id: 1, title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", cover: "https://m.media-amazon.com/images/I/81ibfYk4qmL._AC_UF1000,1000_QL80_.jpg", category: "lendo", progress: 65 },
  { id: 2, title: "O Senhor dos Anéis", author: "J.R.R. Tolkien", cover: "https://m.media-amazon.com/images/I/81j7E0oFdRL._AC_UF1000,1000_QL80_.jpg", category: "quero-ler" },
  { id: 3, title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", cover: "https://m.media-amazon.com/images/I/71OZY035QKL._AC_UF1000,1000_QL80_.jpg", category: "lido", rating: 5, review: "Leitura incrível!" },
  { id: 4, title: "1984", author: "George Orwell", cover: "https://m.media-amazon.com/images/I/819js3EQwbL._AC_UF1000,1000_QL80_.jpg", category: "lido", rating: 4 },
  { id: 5, title: "Dom Casmurro", author: "Machado de Assis", cover: "https://m.media-amazon.com/images/I/61wezcT0yJL._AC_UF1000,1000_QL80_.jpg", category: "abandonado" },
  { id: 6, title: "O Hobbit", author: "J.R.R. Tolkien", cover: "https://m.media-amazon.com/images/I/91b0C2YNSrL._AC_UF1000,1000_QL80_.jpg", category: "favoritos", rating: 5 },
];

const categories = [
  { id: "lendo", label: "Lendo", icon: "📖", color: "text-primary" },
  { id: "quero-ler", label: "Quero Ler", icon: "📚", color: "text-accent" },
  { id: "lido", label: "Lido", icon: "✅", color: "text-success" },
  { id: "abandonado", label: "Abandonado", icon: "❌", color: "text-destructive" },
  { id: "favoritos", label: "Favoritos", icon: "⭐", color: "text-warning" },
];

const Estante = () => {
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [selectedCategory, setSelectedCategory] = useState("lendo");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const filteredBooks = books.filter(book => book.category === selectedCategory);

  const handleOpenBook = (book: Book) => {
    setSelectedBook(book);
    setRating(book.rating || 0);
    setReview(book.review || "");
    setIsModalOpen(true);
  };

  const handleSaveReview = () => {
    if (selectedBook) {
      setBooks(books.map(b => 
        b.id === selectedBook.id ? { ...b, rating, review } : b
      ));
      setIsModalOpen(false);
    }
  };

  const handleMoveBook = (bookId: number, newCategory: Book["category"]) => {
    setBooks(books.map(b => 
      b.id === bookId ? { ...b, category: newCategory } : b
    ));
  };

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BookMarked className="w-8 h-8 text-primary" />
              Minha Estante
            </h1>
            <p className="text-muted-foreground">
              Organize seus livros e acompanhe suas leituras
            </p>
          </div>
          <Button variant="hero" className="gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Livro
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto py-1 -my-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                selectedCategory === category.id
                  ? "bg-secondary text-secondary-foreground ring-2 ring-secondary"
                  : "bg-muted text-primary hover:bg-muted/80"
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
              <span className="text-xs opacity-70">
                ({books.filter(b => b.category === category.id).length})
              </span>
            </button>
          ))}
        </div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredBooks.map((book, index) => (
              <div 
                key={book.id} 
                className="glass-card rounded-xl overflow-hidden card-hover cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => handleOpenBook(book)}
              >
                <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                  <img 
                    src={book.cover} 
                    alt={`Capa de ${book.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm truncate">{book.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                  
                  {book.progress !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-bold">{book.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {book.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < book.rating! ? "text-accent fill-accent" : "text-muted"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Nenhum livro aqui</h3>
            <p className="text-muted-foreground mb-4">
              Adicione livros da biblioteca para esta categoria
            </p>
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar livro
            </Button>
          </div>
        )}

        {/* Book Detail Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={selectedBook?.cover} 
                    alt={`Capa de ${selectedBook?.title}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xl">{selectedBook?.title}</p>
                  <p className="text-sm text-muted-foreground font-normal">{selectedBook?.author}</p>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Rating */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sua avaliação</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-8 h-8 ${star <= rating ? "text-accent fill-accent" : "text-muted"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sua resenha</label>
                <Textarea
                  placeholder="O que você achou deste livro?"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Move to category */}
              <div>
                <label className="text-sm font-medium mb-2 block">Mover para</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (selectedBook) {
                          handleMoveBook(selectedBook.id, cat.id as Book["category"]);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedBook?.category === cat.id
                          ? "bg-secondary text-secondary-foreground ring-2 ring-secondary"
                          : "bg-muted text-primary hover:bg-muted/80"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button variant="hero" className="flex-1 gap-2" onClick={handleSaveReview}>
                  <Check className="w-4 h-4" />
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Estante;
