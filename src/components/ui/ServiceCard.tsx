import React from 'react';
import { Heart, Star, User, Edit, MessageSquare, MessageCircle, Globe, Trash2, Calendar, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { Recommendation } from '../../types';

export interface ServiceCardProps {
  recommendation: Recommendation;
  categoryName?: string;
  categoryIcon?: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  authorName: string;
  isAuthor: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReview?: () => void;
  isLoggedIn?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  recommendation,
  categoryName = 'Geral',
  categoryIcon,
  isFavorite,
  onToggleFavorite,
  authorName,
  isAuthor,
  onEdit,
  onDelete,
  onReview,
  isLoggedIn = true
}) => {
  const handleShare = async () => {
    const shareData = {
      title: recommendation.title,
      text: `Confira esta indicação: ${recommendation.title} - ${categoryName}\n\n${recommendation.description}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Erro ao compartilhar:', err);
        }
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full group transition-transform hover:-translate-y-1">
      <div className="relative pt-6 px-6 flex justify-between items-start mb-2 gap-2">
        <div className="bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0">
          {categoryIcon && <span className="material-symbols-outlined text-[16px] leading-[1]">{categoryIcon}</span>}
          {categoryName}
        </div>
        <div className="flex items-center gap-1 -mt-2 -mr-2">
          <button 
            onClick={handleShare}
            className="text-on-surface-variant p-2 rounded-full hover:bg-white/5 transition-colors active:scale-95 flex items-center justify-center" aria-label="Compartilhar"
          >
            <Share2 className="w-5 h-5 transition-transform hover:scale-110" />
          </button>
          <button 
            onClick={onToggleFavorite}
            className={`relative p-2 rounded-full transition-all active:scale-95 group/fav flex items-center justify-center ${isFavorite ? 'bg-error/10 text-error' : 'text-on-surface-variant hover:bg-white/5'}`} aria-label="Favoritar"
          >
            <motion.div
              initial={false}
              animate={{ scale: isFavorite ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Heart className={`relative z-10 w-6 h-6 transition-all duration-300 ${isFavorite ? 'fill-error drop-shadow-[0_0_8px_rgba(255,100,100,0.5)]' : 'group-hover/fav:scale-110'}`} />
            </motion.div>
          </button>
        </div>
      </div>

      <div className="p-6 pt-2 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-xl text-primary line-clamp-2">{recommendation.title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-5 h-5 fill-primary text-primary" />
            <span className="font-bold text-primary">{recommendation.rating || '5.0'}</span>
          </div>
        </div>
        
        <p className="text-on-surface-variant text-base mb-4 flex-grow line-clamp-3">
          {recommendation.description}
        </p>

        <div className="space-y-2 mb-6 text-sm text-on-surface-variant">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 shrink-0" />
            <span className="truncate">Indicado por: {authorName}</span>
          </div>
          {recommendation.createdAt && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Cadastrado em: {new Date(recommendation.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
          {recommendation.contactWebsite && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 shrink-0" />
              <a href={/^https?:\/\//i.test(recommendation.contactWebsite) ? recommendation.contactWebsite : `https://${recommendation.contactWebsite}`} target="_blank" rel="noopener noreferrer" className="truncate hover:text-primary transition-colors hover:underline">
                {recommendation.contactWebsite}
              </a>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {isAuthor ? (
            <>
              <button 
                onClick={onEdit} 
                className={`${onDelete ? 'col-span-1' : 'col-span-2'} bg-secondary-container text-on-secondary-container border border-primary/20 py-2 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2`}
              >
                <Edit className="w-4 h-4" /> Editar
              </button>
              {onDelete && (
                <button 
                  onClick={onDelete} 
                  className="col-span-1 bg-error/20 text-error border border-error/20 py-2 rounded-lg text-sm font-semibold hover:bg-error/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
              )}
            </>
          ) : (
            <button 
              onClick={onReview}
              disabled={!isLoggedIn}
              className="col-span-2 bg-secondary-container text-on-secondary-container border border-primary/20 py-2 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <MessageSquare className="w-4 h-4" /> {isLoggedIn ? 'Avaliar' : 'Faça login para avaliar'}
            </button>
          )}
        </div>

        <a 
          className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all" 
          href={(() => {
            if (!recommendation.contactPhone) return '#';
            const cleanPhone = recommendation.contactPhone.replace(/\D/g, '');
            if (cleanPhone.length >= 11) {
              return `https://wa.me/55${cleanPhone.slice(0, 2)}${cleanPhone.slice(3)}`;
            }
            return `https://wa.me/55${cleanPhone}`;
          })()}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp
        </a>
      </div>
    </div>
  );
};
