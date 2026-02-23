import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookMarked, Plus, Star, Check } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useBookshelf, type ShelfCategory } from "@/hooks/useBookshelf";

const categories = [
  { id: "lendo", label: "Lendo" },
  { id: "reelendo", label: "Reelendo" },
  { id: "quero-ler", label: "Quero Ler" },
  { id: "lido", label: "Lido" },
  { id: "abandonado", label: "Abandonado" },
  { id: "favoritos", label: "Favoritos" },
];

const Estante = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { books, moveBook, updateBook } = useBookshelf();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "lendo"
  );
  const [selectedBook, setSelectedBook] = useState<typeof books[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const filteredBooks = books.filter(book => book.category === selectedCategory);

  const handleOpenBook = (book: typeof books[0]) => {
    setSelectedBook(book);
    setRating(book.rating || 0);
    setReview(book.review || "");
    setIsModalOpen(true);
  };

  const handleSaveReview = () => {
    if (selectedBook) {
      updateBook(selectedBook.id, { rating, review });
      setIsModalOpen(false);
    }
  };

  return (
    <Layout>
      <div className="py-8 min-h-screen">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 animate-fade-in" data-tutorial="estante-header">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BookMarked className="w-8 h-8 text-primary" />
              Minha Estante
            </h1>
            <p className="text-muted-foreground">
              Organize seus livros e acompanhe suas leituras
            </p>
          </div>
          <Button variant="hero" className="gap-2" data-tutorial="estante-add" onClick={() => navigate(`/biblioteca?from=estante&category=${selectedCategory}`)}>
            <Plus className="w-5 h-5" />
            Adicionar Livro
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto py-1 -my-1" data-tutorial="estante-tabs">
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
              <span>{category.label}</span>
              <span className="text-xs opacity-70">
                ({books.filter(b => b.category === category.id).length})
              </span>
            </button>
          ))}
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div
            onClick={() => navigate(`/biblioteca?from=estante&category=${selectedCategory}`)}
            className="glass-card rounded-xl overflow-hidden card-hover cursor-pointer animate-fade-in flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors"
          >
            <Plus className="w-10 h-10 text-muted-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">Adicionar livro</span>
            <span className="text-xs text-muted-foreground/70 mt-1">
              em "{categories.find(c => c.id === selectedCategory)?.label}"
            </span>
          </div>

          {filteredBooks.map((book, index) => (
            <div 
              key={book.id} 
              className="glass-card rounded-xl overflow-hidden card-hover cursor-pointer animate-fade-in"
              style={{ animationDelay: `${(index + 1) * 0.05}s` }}
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

              <div>
                <label className="text-sm font-medium mb-2 block">Sua resenha</label>
                <Textarea
                  placeholder="O que você achou deste livro?"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Mover para</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (selectedBook) {
                          moveBook(selectedBook.id, cat.id as ShelfCategory);
                          setSelectedBook({ ...selectedBook, category: cat.id as ShelfCategory });
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedBook?.category === cat.id
                          ? "bg-secondary text-secondary-foreground ring-2 ring-secondary"
                          : "bg-muted text-primary hover:bg-muted/80"
                      }`}
                    >
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

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
