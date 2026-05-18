import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import { useNavigate } from 'react-router-dom';
import { createCategory } from '../hooks/useCategories';
import { 
  getDashboardStats, 
  fetchAllUsers, 
  fetchAllRecommendations, 
  updateRecommendationStatusAdmin, 
  updateUserRole 
} from '../hooks/useAdmin';
import { Users, List, Edit, Shield, Grid, Plus, X } from 'lucide-react';
import type { Recommendation, Category, User } from '../types';

export function Admin() {
  useAuth();
  const { categories, mutate } = useCategories();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalRecommendations: 0 });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allRecs, setAllRecs] = useState<Recommendation[]>([]);

  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<'admin' | 'user'>('user');
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('category');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catError, setCatError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Pagination and Filtering for Recommendations
  const filteredRecs = allRecs.filter(rec => {
    let match = true;
    if (filterCategory && rec.categoryId !== filterCategory) match = false;
    if (filterStatus) {
      const recStatus = rec.status || 'active'; // Default to active if missing
      if (filterStatus !== recStatus) match = false;
    }
    return match;
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredRecs.length / itemsPerPage));
  const currentRecs = filteredRecs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [filterCategory, filterStatus]);

  // Auto-generate slug when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewCatName(value);
    setNewCatSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, recsRes] = await Promise.all([
          getDashboardStats(),
          fetchAllUsers(),
          fetchAllRecommendations(),
        ]);
        setStats(statsRes);
        setAllUsers(usersRes);
        setAllRecs(recsRes);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveRole = async () => {
    if (!roleModalUser?.id) return;
    
    setIsSubmitting(true);
    try {
      await updateUserRole(roleModalUser.id, editingRole);
      setAllUsers(allUsers.map(u => u.id === roleModalUser.id ? { ...u, role: editingRole } : u));
      setRoleModalUser(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar cargo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRoleModal = (user: User) => {
    setRoleModalUser(user);
    setEditingRole(user.role as 'admin' | 'user' || 'user');
  };

  const handleUpdateStatus = async (id: string, newStatus: 'active' | 'inactive') => {
    try {
      await updateRecommendationStatusAdmin(id, newStatus);
      setAllRecs(allRecs.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar status.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');
    if (!newCatName.trim() || !newCatSlug.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createCategory(newCatName.trim(), newCatSlug.trim(), newCatIcon.trim());
      await mutate();
      setNewCatName('');
      setNewCatSlug('');
      setNewCatIcon('category');
      setIsAddCatModalOpen(false);
    } catch (err) {
      console.error(err);
      setCatError(err instanceof Error ? err.message : 'Erro ao criar categoria.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Dashboard Header: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Stat Card 1 */}
        <div className="glass-card rounded-xl p-6 glow-primary flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
            <List className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-on-surface-variant font-semibold uppercase tracking-wider text-xs">Total Indicações</p>
            <h3 className="text-primary font-slackey text-xl leading-none mt-1">{stats.totalRecommendations}</h3>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="glass-card rounded-xl p-6 glow-primary flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-on-surface-variant font-semibold uppercase tracking-wider text-xs">Total Usuários</p>
            <h3 className="text-primary font-slackey text-xl leading-none mt-1">{stats.totalUsers}</h3>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="glass-card rounded-xl p-6 glow-primary flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
            <Grid className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-on-surface-variant font-semibold uppercase tracking-wider text-xs">Categorias Cadastradas</p>
            <h3 className="text-primary font-slackey text-xl leading-none mt-1">{categories?.length || 0}</h3>
          </div>
        </div>
      </div>

      {/* Management Sections Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Gestão de Categorias */}
        <section className="lg:col-span-4 glass-card rounded-xl p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-primary font-slackey text-lg">Gestão de Categorias</h2>
            <button 
              onClick={() => setIsAddCatModalOpen(true)}
              className="w-8 h-8 flex items-center justify-center bg-primary-container/20 text-primary rounded-full hover:bg-primary-container/40 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {categories?.slice(0, 4).map((cat: Category) => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-surface-container rounded-lg border border-white/5 hover:border-primary/30 transition-all">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-on-surface">{cat.name}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate('/admin/categories')} 
                    className="text-on-surface-variant hover:text-primary transition-colors p-1"
                    title="Editar em Gestão"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {(!categories || categories.length === 0) && (
              <p className="text-on-surface-variant text-sm text-center py-4">Nenhuma categoria cadastrada.</p>
            )}
          </div>
          <button 
            onClick={() => navigate('/admin/categories')}
            className="w-full py-3 border border-primary text-primary rounded-lg text-sm font-bold hover:bg-primary/10 transition-colors active:scale-95"
          >
            Ver Todas as Categorias
          </button>
        </section>

        {/* Right: Lista de Usuários */}
        <section className="lg:col-span-8 glass-card rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h2 className="text-primary font-slackey text-lg">Lista de Usuários</h2>
            <div className="flex gap-2 bg-surface-container-low p-1 rounded-lg w-fit">
              <button className="px-4 py-1.5 text-xs font-bold rounded-md bg-primary-container text-on-primary-container leading-none">Todos</button>
              <button className="px-4 py-1.5 text-xs font-bold rounded-md text-on-surface-variant hover:text-on-surface leading-none">Pendentes</button>
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="text-on-surface-variant border-b border-white/5 text-sm font-semibold">
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Cargo</th>
                  <th className="px-6 py-4 text-center">Permissão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allUsers.map((u: User) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                        {u.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{u.name || 'Usuário Anônimo'}</span>
                        <span className="text-xs text-on-surface-variant">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-primary-container/20 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => openRoleModal(u)}
                          className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-white/5"
                          title="Alternar Cargo"
                        >
                          <Shield className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
      
      {/* Moderation Section Below Grid */}
      <section className="glass-card rounded-xl p-6 mt-6 flex flex-col gap-6">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <h2 className="text-primary font-slackey text-lg">Moderação de Indicações</h2>
           <div className="flex flex-col sm:flex-row gap-3">
             <select
               value={filterCategory}
               onChange={(e) => setFilterCategory(e.target.value)}
               className="bg-surface-variant/30 border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none text-on-surface"
             >
               <option value="" className="bg-surface-container-high text-on-surface">Todas as categorias</option>
               {categories?.map((cat: Category) => (
                 <option key={cat.id} value={cat.id} className="bg-surface-container-high text-on-surface">{cat.name}</option>
               ))}
             </select>
             <select
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
               className="bg-surface-variant/30 border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none text-on-surface"
             >
               <option value="" className="bg-surface-container-high text-on-surface">Todos os status</option>
               <option value="active" className="bg-surface-container-high text-on-surface">Ativos</option>
               <option value="inactive" className="bg-surface-container-high text-on-surface">Inativos</option>
             </select>
           </div>
         </div>
         <div className="flex flex-col gap-4">
           {currentRecs.map(rec => (
               <div key={rec.id} className="bg-surface border border-white/10 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/30">
                <div className="flex flex-col gap-1">
                  <h4 className="font-bold text-lg text-on-surface leading-tight">{rec.title}</h4>
                  <p className="text-sm text-on-surface-variant line-clamp-2 max-w-3xl">{rec.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-sm font-semibold text-on-surface-variant">Status</label>
                  <select 
                    value={rec.status || 'active'}
                    onChange={(e) => rec.id && handleUpdateStatus(rec.id, e.target.value as 'active' | 'inactive')}
                    className="bg-surface-variant/30 border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none text-on-surface font-semibold"
                  >
                    <option value="active" className="bg-surface-container-high text-on-surface">Ativo</option>
                    <option value="inactive" className="bg-surface-container-high text-on-surface">Inativo</option>
                  </select>
                </div>
               </div>
           ))}
           {filteredRecs.length === 0 && <p className="text-on-surface-variant py-4 text-center">Nenhuma indicação encontrada.</p>}
           
           {totalPages > 1 && (
             <div className="flex justify-center items-center gap-4 mt-4">
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
         </div>
      </section>

      {/* Add Category Modal */}
      {isAddCatModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-slackey text-primary">Nova Categoria</h3>
              <button 
                onClick={() => setIsAddCatModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
              {catError && (
                <div className="bg-error/20 border border-error/50 text-error p-3 rounded-lg text-sm bg-surface">
                  {catError}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label htmlFor="catName" className="font-semibold text-sm">Nome da Categoria</label>
                <input
                  id="catName"
                  type="text"
                  value={newCatName}
                  onChange={handleNameChange}
                  placeholder="Ex: Encanador, Pedreiro..."
                  autoFocus
                  required
                  className="bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="catSlug" className="font-semibold text-sm">Slug único</label>
                <input
                  id="catSlug"
                  type="text"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="Ex: encanador"
                  required
                  className="bg-surface-container border border-white/10 rounded-lg p-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="catIcon" className="font-semibold text-sm">Ícone (Material Symbol)</label>
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 shrink-0 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">{newCatIcon || 'category'}</span>
                  </div>
                  <input
                    id="catIcon"
                    type="text"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
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
                  onClick={() => setIsAddCatModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg font-bold text-on-surface-variant hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newCatName.trim() || !newCatSlug.trim()}
                  className="px-5 py-2.5 rounded-lg font-bold bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Adicionando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-sm flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-slackey text-primary">Alterar Permissão</h3>
              <button 
                onClick={() => setRoleModalUser(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <p className="text-on-surface-variant text-sm border-b border-white/10 pb-4">
                Selecione o novo perfil para o usuário <strong>{roleModalUser.name || 'Usuário'}</strong>:
              </p>
              
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-white/10 hover:border-primary/50 transition-colors">
                  <input 
                    type="radio" 
                    name="role" 
                    value="user" 
                    checked={editingRole === 'user'} 
                    onChange={() => setEditingRole('user')}
                    className="accent-primary w-4 h-4"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface">Usuário Comum</span>
                    <span className="text-xs text-on-surface-variant">Pode acessar, favoritar e fazer indicações.</span>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-primary/30 bg-primary/5 hover:border-primary/50 transition-colors">
                  <input 
                    type="radio" 
                    name="role" 
                    value="admin" 
                    checked={editingRole === 'admin'} 
                    onChange={() => setEditingRole('admin')}
                    className="accent-primary w-4 h-4"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-primary">Administrador</span>
                    <span className="text-xs text-on-surface-variant">Acesso total, pode excluir indicações e categorias.</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-lg font-bold text-on-surface-variant hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveRole}
                  disabled={isSubmitting || roleModalUser.role === editingRole}
                  className="px-5 py-2.5 rounded-lg font-bold bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

