
import { useState } from 'react';
import { useCategories, deleteCategoryLogically, updateCategory } from '../hooks/useCategories';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, ChevronLeft, X } from 'lucide-react';
import type { Category } from '../types';

export function CategoriesAdmin() {
  const { categories, mutate } = useCategories();
  const navigate = useNavigate();

  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catError, setCatError] = useState('');

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja inativar a categoria "${name}"? (Exclusão lógica)`)) {
      await deleteCategoryLogically(id);
      await mutate();
    }
  };

  const openEditModal = (cat: Category) => {
    setEditCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditIcon(cat.icon || 'category');
    setCatError('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');
    if (!editCategory) return;
    
    setIsSubmitting(true);
    try {
      await updateCategory(editCategory.id, {
        name: editName.trim(),
        slug: editSlug.trim(),
        icon: editIcon.trim() || 'category'
      });
      await mutate();
      setEditCategory(null);
    } catch (err) {
      console.error(err);
      setCatError(err instanceof Error ? err.message : 'Erro ao atualizar categoria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full relative">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-slackey text-primary">Todas as Categorias</h1>
      </div>

      <div className="glass-card rounded-xl p-6 md:p-8">
        <div className="flex flex-col gap-4">
          {categories?.map((cat: Category) => (
            <div key={cat.id} className="flex items-center justify-between p-4 bg-surface-container rounded-lg border border-white/5 transition-all hover:border-primary/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">{cat.icon || 'category'}</span>
                </div>
                <div>
                  <span className="font-semibold text-on-surface block text-lg">{cat.name}</span>
                  <span className="text-sm text-on-surface-variant">Slug: {cat.slug}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openEditModal(cat)}
                  className="text-on-surface-variant hover:text-primary transition-colors p-2 bg-white/5 rounded-full"
                  title="Editar Categoria"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="text-on-surface-variant hover:text-error transition-colors p-2 bg-white/5 rounded-full"
                  title="Excluir Categoria"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {(!categories || categories.length === 0) && (
            <p className="text-on-surface-variant text-center py-8 text-lg">Nenhuma categoria cadastrada.</p>
          )}
        </div>
      </div>

      {/* Edit Category Modal */}
      {editCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-slackey text-primary">Editar Categoria</h3>
              <button 
                onClick={() => setEditCategory(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              {catError && (
                <div className="bg-error/20 border border-error/50 text-error p-3 rounded-lg text-sm bg-surface">
                  {catError}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label htmlFor="editName" className="font-semibold text-sm">Nome da Categoria</label>
                <input
                  id="editName"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ex: Encanador, Pedreiro..."
                  autoFocus
                  required
                  className="bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="editSlug" className="font-semibold text-sm">Slug único</label>
                <input
                  id="editSlug"
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  placeholder="Ex: encanador"
                  required
                  className="bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="editIcon" className="font-semibold text-sm">Ícone (Material Symbol)</label>
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 shrink-0 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">{editIcon || 'category'}</span>
                  </div>
                  <input
                    id="editIcon"
                    type="text"
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    placeholder="Ex: category, bolt, home..."
                    required
                    className="flex-1 bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <p className="text-xs text-on-surface-variant">
                  Pesquise no site Google Fonts (Material Symbols).
                </p>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setEditCategory(null)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg font-bold text-on-surface-variant hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !editName.trim() || !editSlug.trim()}
                  className="px-5 py-2.5 rounded-lg font-bold bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
