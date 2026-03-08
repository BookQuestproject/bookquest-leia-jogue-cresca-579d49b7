import { useState } from "react";
import { Star, Send, Trash2 } from "lucide-react";
import { useBookReviews } from "@/hooks/useBookReviews";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { bookTrails } from "@/pages/Trilhas";

const StarRating = ({ rating, onRate, interactive = false, size = "w-5 h-5" }: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: string;
}) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        className={`${size} transition-colors ${interactive ? "cursor-pointer" : ""} ${
          i <= rating ? "fill-accent text-accent" : "text-muted-foreground/30"
        }`}
        onClick={() => interactive && onRate?.(i)}
      />
    ))}
  </div>
);

const ReviewsTab = () => {
  const { user } = useAuth();
  const { reviews, loading, averageRating, totalReviews, userReview, submitReview, deleteReview } = useBookReviews();
  const [selectedBook, setSelectedBook] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = async () => {
    if (!selectedBook || rating === 0) return;
    setSubmitting(true);
    const book = bookTrails.find(b => b.id === selectedBook);
    const success = await submitReview(selectedBook, rating, comment, book?.title);
    if (success) {
      setRating(0);
      setComment("");
      setSelectedBook("");
    }
    setSubmitting(false);
  };

  // Group reviews by book
  const reviewsByBook = reviews.reduce((acc, r) => {
    const key = r.book_id;
    if (!acc[key]) acc[key] = { title: r.book_title || r.book_id, reviews: [], totalRating: 0 };
    acc[key].reviews.push(r);
    acc[key].totalRating += r.rating;
    return acc;
  }, {} as Record<string, { title: string; reviews: typeof reviews; totalRating: number }>);

  const filteredBooks = Object.entries(reviewsByBook).filter(([, data]) =>
    data.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Write a review */}
      {user && (
        <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
          <h3 className="text-base font-semibold text-foreground">Escreva sua avaliação</h3>

          <select
            value={selectedBook}
            onChange={e => setSelectedBook(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Selecione um livro...</option>
            {bookTrails.map(b => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
          </select>

          {selectedBook && (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Sua nota:</span>
                <StarRating rating={rating} onRate={setRating} interactive />
              </div>

              <Textarea
                placeholder="O que você achou desse livro?"
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="min-h-[80px]"
              />

              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Publicar avaliação
              </Button>
            </>
          )}
        </div>
      )}

      {/* Search */}
      <Input
        placeholder="Buscar avaliações por livro..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />

      {/* Overall stats */}
      {totalReviews > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10">
          <div className="text-3xl font-bold text-foreground">{averageRating.toFixed(1)}</div>
          <div>
            <StarRating rating={Math.round(averageRating)} size="w-4 h-4" />
            <p className="text-xs text-muted-foreground mt-0.5">{totalReviews} avaliações no total</p>
          </div>
        </div>
      )}

      {/* Reviews grouped by book */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Star className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium">Nenhuma avaliação ainda</p>
          <p className="text-sm mt-1">Seja o primeiro a avaliar um livro!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBooks.map(([bookId, data]) => {
            const avg = data.totalRating / data.reviews.length;
            const book = bookTrails.find(b => b.id === bookId);

            return (
              <div key={bookId} className="rounded-xl border border-border/50 bg-card overflow-hidden">
                {/* Book header */}
                <div className="flex items-center gap-3 p-4 border-b border-border/30 bg-muted/30">
                  {book?.cover && (
                    <img src={book.cover} alt={data.title} className="w-10 h-14 rounded object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground truncate">{data.title}</h4>
                    {book?.author && <p className="text-xs text-muted-foreground">{book.author}</p>}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <StarRating rating={Math.round(avg)} size="w-3.5 h-3.5" />
                      <span className="text-sm font-semibold ml-1">{avg.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{data.reviews.length} avaliações</p>
                  </div>
                </div>

                {/* Reviews list */}
                <div className="divide-y divide-border/20">
                  {data.reviews.slice(0, 5).map(review => (
                    <div key={review.id} className="p-4 flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={review.profile?.avatar_url || ""} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {(review.profile?.full_name || "U")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {review.profile?.full_name || "Leitor"}
                          </span>
                          <StarRating rating={review.rating} size="w-3 h-3" />
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(review.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground leading-relaxed">"{review.comment}"</p>
                        )}
                        {user && review.user_id === user.id && (
                          <button
                            onClick={() => deleteReview(review.id)}
                            className="mt-2 text-xs text-destructive/60 hover:text-destructive flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Remover
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;
