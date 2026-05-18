import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserRecommendations, deleteRecommendation } from '../hooks/useRecommendations';
import { useCategories } from '../hooks/useCategories';
import { ServiceCard } from '../components/ui/ServiceCard';
import { SkeletonServiceCard } from '../components/ui/SkeletonServiceCard';
import { Star, Bookmark, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { recommendations, isLoading: recsLoading, mutate } = useUserRecommendations(user?.uid || '');
  const { categories } = useCategories();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 4; // Use 4 to fit in 2x2 grid ideally
  const totalPages = recommendations ? Math.ceil(recommendations.length / itemsPerPage) : 0;
  const currentRecs = recommendations ? recommendations.slice((page - 1) * itemsPerPage, page * itemsPerPage) : [];

  const getCategoryName = (categoryId: string) => {
    return categories?.find((c: any) => c.id === categoryId)?.name || 'Geral';
  };

  const getCategoryIcon = (categoryId: string) => {
    return categories?.find((c: any) => c.id === categoryId)?.icon || 'category';
  };

  const handleEdit = (id: string) => {
    navigate(`/indicate?edit=${id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteRecommendation(deletingId);
      mutate(); // Refresh the list
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir indicação.');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
        <p className="text-on-surface-variant">Você precisa estar logado para ver seu perfil.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pt-16 relative">
      {deletingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-high p-8 rounded-3xl max-w-md w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-error/20 text-error rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Excluir permanentemente?</h2>
            <p className="text-on-surface-variant mb-8">Esta ação irá remover a indicação de forma irreversível, não sendo mais exibida para nenhum usuário.</p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="flex-1 bg-surface-variant text-on-surface py-3 rounded-xl font-bold hover:bg-surface-variant/80 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 bg-error text-white py-3 rounded-xl font-bold hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-primary font-black text-4xl">
          {(user.displayName || user.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col items-center md:items-start flex-1 text-center md:text-left">
          <h1 className="text-3xl font-slackey text-primary">{user.displayName || user.name || 'Usuário'}</h1>
          <p className="text-on-surface-variant mb-4">{user.email}</p>
          
          <div className="flex gap-4">
            <div className="bg-white/5 py-2 px-4 rounded-xl flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="font-bold">{user.averageScore?.toFixed(1) || '0.0'}</span>
              <span className="text-on-surface-variant text-sm">Média de Recomendações</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-slackey text-primary flex items-center gap-2">
          <Bookmark className="w-6 h-6" /> Minhas Indicações
        </h2>
        
        {recsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <SkeletonServiceCard key={i} />
            ))}
          </div>
        ) : (!recommendations || recommendations.length === 0) ? (
          <div className="p-12 text-center border-2 border-dashed border-white/20 rounded-3xl">
            <p className="text-on-surface-variant font-medium">Você ainda não fez nenhuma indicação.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {currentRecs.map((rec) => (
                <ServiceCard
                  key={rec.id}
                  recommendation={rec}
                  categoryName={getCategoryName(rec.categoryId)}
                  categoryIcon={getCategoryIcon(rec.categoryId)}
                  isFavorite={false}
                  onToggleFavorite={() => {}}
                  authorName={user.displayName || user.name || 'Eu'}
                  isAuthor={true}
                  onEdit={() => handleEdit(rec.id!)}
                  onDelete={() => setDeletingId(rec.id!)}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6 mb-8">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-surface-container rounded-lg disabled:opacity-50 hover:bg-white/10 transition-colors font-bold"
                >
                  Anterior
                </button>
                <span className="text-on-surface-variant text-sm font-semibold">Página {page} de {totalPages}</span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-surface-container rounded-lg disabled:opacity-50 hover:bg-white/10 transition-colors font-bold"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
