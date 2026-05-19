import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceCard } from '../components/ui/ServiceCard';
import { SkeletonServiceCard } from '../components/ui/SkeletonServiceCard';
import { ReviewModal } from '../components/ui/ReviewModal';
import { useRecommendations } from '../hooks/useRecommendations';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../hooks/useAuth';
import type { Recommendation } from '../types';

export function Home() {
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [reviewRecId, setReviewRecId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    if (!scrollRef.current) return;
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    setStartX(pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  const onDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault(); // Prevent text selection/scrolling while dragging
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const x = pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; 
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const { recommendations, isLoading: recsLoading, mutate, fetchMore, hasMore } = useRecommendations(selectedCategory);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (recsLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [recsLoading, hasMore, fetchMore]);

  const { categories, isLoading: categoriesLoading } = useCategories();
  const { user } = useAuth();


  const toggleFav = (id: string) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryName = (categoryId: string) => {
    return categories?.find((c: any) => c.id === categoryId)?.name || 'Geral';
  };

  const getCategoryIcon = (categoryId: string) => {
    return categories?.find((c: any) => c.id === categoryId)?.icon || 'category';
  };

  const handleEdit = (id: string) => {
    navigate(`/indicate?edit=${id}`);
  };

  return (
    <div className="flex flex-col gap-8 md:pt-16">
      <ReviewModal 
        recommendationId={reviewRecId!} 
        isOpen={!!reviewRecId} 
        onClose={() => setReviewRecId(null)}
        onSuccess={() => {
          setReviewRecId(null);
          mutate();
        }}
      />
      <section className="mb-4">
        <h2 className="text-3xl md:text-5xl font-slackey mb-4 text-primary max-w-3xl leading-tight">
          Encontre os melhores serviços da sua região.
        </h2>
        <p className="text-on-surface-variant text-lg max-w-2xl">
          Recomendações reais de pessoas reais. Transparência e qualidade técnica para o que você precisar.
        </p>
      </section>

      <section className="mb-4">
        <div 
          ref={scrollRef}
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onMouseMove={onDragMove}
          onTouchStart={onDragStart}
          onTouchEnd={onDragEnd}
          onTouchMove={onDragMove}
          className={`flex overflow-x-auto gap-3 no-scrollbar pb-2 w-full max-w-full ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
        >
          {categoriesLoading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-6 py-4 rounded-full bg-surface-variant/50 animate-pulse w-24 shrink-0"></div>
              ))}
            </>
          ) : (
            <>
              <button 
                onClick={() => setSelectedCategory('')}
                className={`px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                  selectedCategory === '' 
                    ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(22,106,152,0.3)]' 
                    : 'bg-secondary-container text-on-secondary-container hover:bg-white/10'
                }`}
              >
                Todos
              </button>
              
              {categories?.map((cat: any) => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                    selectedCategory === cat.id 
                      ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(22,106,152,0.3)]' 
                      : 'bg-secondary-container text-on-secondary-container hover:bg-white/10'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </>
          )}
        </div>
      </section>

      {recsLoading && !recommendations ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <SkeletonServiceCard key={i} />
          ))}
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations?.map((rec: Recommendation, index: number) => {
              const Component = (
                <ServiceCard
                  key={rec.id}
                  recommendation={rec}
                  categoryName={getCategoryName(rec.categoryId)}
                  categoryIcon={getCategoryIcon(rec.categoryId)}
                  isFavorite={!!favorites[rec.id!]}
                  onToggleFavorite={() => toggleFav(rec.id!)}
                  authorName={"Usuário"} 
                  isAuthor={user?.uid === rec.authorId}
                  onEdit={() => handleEdit(rec.id!)}
                  isLoggedIn={!!user}
                  onReview={() => setReviewRecId(rec.id!)}
                />
              );
              
              if (recommendations.length === index + 1) {
                return (
                  <div ref={lastElementRef} key={`wrapper-${rec.id}`}>
                    {Component}
                  </div>
                );
              }
              return Component;
            })}
            {(!recommendations || recommendations.length === 0) && (
              <div className="col-span-full py-12 text-center text-on-surface-variant">
                Nenhuma indicação encontrada! Que tal ser o primeiro a indicar?
              </div>
            )}
          </section>
          
          {recsLoading && recommendations && recommendations.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="animate-pulse text-on-surface-variant font-medium flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                Carregando mais...
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
