import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { createReview, useUserReview } from '../../hooks/useReviews';
import { useAuth } from '../../hooks/useAuth';

export interface ReviewModalProps {
  recommendationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({ recommendationId, isOpen, onClose, onSuccess }: ReviewModalProps) {
  const { user } = useAuth();
  const { review, isLoading } = useUserReview(recommendationId, user?.uid);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (review) {
      setRating(review.rating);
    } else {
      setRating(0);
    }
  }, [review, recommendationId]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      await createReview(recommendationId, rating, ''); // no comment logic for simplify
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-high p-8 rounded-3xl max-w-sm w-full shadow-2xl flex flex-col items-center relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-on-surface mb-6">Avaliar Indicação</h2>
        
        {isLoading ? (
           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-6"></div>
        ) : (
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  className={`w-10 h-10 transition-colors duration-200 ${
                    star <= (hoverRating || rating) 
                      ? 'fill-amber-500 text-amber-500' 
                      : 'text-on-surface-variant/30'
                  }`} 
                />
              </button>
            ))}
          </div>
        )}

        <button 
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Enviando...' : review ? 'Atualizar Avaliação' : 'Enviar Avaliação'}
        </button>
      </div>
    </div>
  );
}
