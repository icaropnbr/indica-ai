import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import { createRecommendation, updateRecommendation } from '../hooks/useRecommendations';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { Send, Save, X } from 'lucide-react';

export function Indicate() {
  const { user } = useAuth();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (editId && user) {
      setFetching(true);
      const fetchRec = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'recommendations', editId));
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.authorId !== user.uid && user.role !== 'admin') {
              setErrorMsg('Você não tem permissão para editar esta indicação.');
            } else {
              setTitle(data.title || '');
              setCategoryId(data.categoryId || '');
              setDescription(data.description || '');
              setPhone(data.contactPhone || '');
              setWebsite(data.contactWebsite || '');
            }
          } else {
            setErrorMsg('Indicação não encontrada.');
          }
        } catch (error) {
          setErrorMsg('Erro ao carregar os dados da indicação.');
        } finally {
          setFetching(false);
        }
      };
      fetchRec();
    }
  }, [editId, user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
        <p className="text-on-surface-variant">Você precisa estar logado para fazer uma indicação.</p>
      </div>
    );
  }

  const formatPhone = (val: string) => {
    let raw = val.replace(/\D/g, '');
    if (raw.length > 11) raw = raw.slice(0, 11);
    
    let formatted = raw;
    if (raw.length > 2 && raw.length <= 6) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    } else if (raw.length > 6 && raw.length <= 10) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 6)}-${raw.slice(6)}`;
    } else if (raw.length > 10) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    }
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const validateURL = (url: string) => {
    if (!url) return true; // Optional
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});
    
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Título é obrigatório.';
    if (!categoryId) errors.categoryId = 'Categoria é obrigatória.';
    if (!description.trim()) errors.description = 'Descrição é obrigatória.';
    
    if (!phone) {
      errors.phone = 'Telefone é obrigatório.';
    } else if (phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Informe um telefone válido.';
    }

    if (website && !validateURL(website) && !validateURL('https://' + website)) {
      errors.website = 'Informe um site válido (URL).';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    let finalWebsite = website;
    if (website && !/^https?:\/\//i.test(website)) {
      finalWebsite = 'https://' + website;
    }

    setLoading(true);
    try {
      if (editId) {
        await updateRecommendation(editId, {
          title: title.trim(),
          categoryId,
          description: description.trim(),
          contactPhone: phone,
          contactWebsite: finalWebsite.trim(),
        });
        setSuccessMsg('Indicação atualizada com sucesso!');
      } else {
        await createRecommendation({
          title: title.trim(),
          categoryId,
          description: description.trim(),
          contactPhone: phone,
          contactWebsite: finalWebsite.trim(),
        });
        setSuccessMsg('Indicação publicada com sucesso!');
      }
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      console.error('Submit Error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao salvar a indicação.');
    } finally {
      setLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div className="max-w-2xl mx-auto w-full pt-16 flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
        <div className="w-16 h-16 bg-primary-container/20 text-primary rounded-full flex items-center justify-center mb-4">
          <Send className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-slackey text-primary">{successMsg}</h2>
        <p className="text-on-surface-variant">Redirecionando para a página inicial...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full pt-16 relative">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-slackey text-primary">
          {editId ? 'Editar Indicação' : 'Fazer uma Indicação'}
        </h1>
        {editId && (
          <button 
            type="button"
            onClick={() => navigate(-1)} 
            className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-white/5"
            title="Cancelar"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>
      <p className="text-on-surface-variant mb-8 text-lg">
        {editId 
          ? 'Atualize os dados da sua indicação.' 
          : 'Conhece alguém que presta um bom serviço? Compartilhe com a comunidade.'}
      </p>
      
      {fetching ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-3xl flex flex-col gap-6">
        
        {errorMsg && (
          <div className="bg-error/20 border border-error/50 text-error p-3 rounded-lg text-sm font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="font-bold text-sm text-on-surface">Título do Serviço *</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => { setTitle(e.target.value); setFieldErrors(prev => ({...prev, title: ''})) }}
            placeholder="Ex: Eletricista João Silva" 
            className={`w-full bg-surface-variant/30 border ${fieldErrors.title ? 'border-error' : 'border-outline-variant'} rounded-xl p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all`}
            required
            maxLength={100}
          />
          {fieldErrors.title && <span className="text-error text-xs font-semibold">{fieldErrors.title}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-sm text-on-surface">Categoria *</label>
          <div className={`flex items-center gap-3 w-full bg-surface-variant/30 border ${fieldErrors.categoryId ? 'border-error' : 'border-outline-variant'} rounded-xl p-3 outline-none focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all`}>
            {categoryId && (
              <span className="material-symbols-outlined text-primary text-[20px]">
                {categories?.find((c: any) => c.id === categoryId)?.icon || 'category'}
              </span>
            )}
            <select 
              className="w-full bg-transparent outline-none appearance-none text-on-surface"
              required
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setFieldErrors(prev => ({...prev, categoryId: ''})) }}
            >
              <option value="" disabled className="bg-surface-container-high text-on-surface">Selecione uma categoria...</option>
              {categories?.map((cat: { id: string; name: string; icon: string; }) => (
                <option key={cat.id} value={cat.id} className="bg-surface-container-high text-on-surface">{cat.name}</option>
              ))}
            </select>
          </div>
          {fieldErrors.categoryId && <span className="text-error text-xs font-semibold">{fieldErrors.categoryId}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-sm text-on-surface">Por que você indica? *</label>
          <textarea 
            value={description}
            onChange={(e) => { setDescription(e.target.value); setFieldErrors(prev => ({...prev, description: ''})) }}
            placeholder="Conte um pouco sobre sua experiência com esse prestador de serviços..." 
            className={`w-full bg-surface-variant/30 border ${fieldErrors.description ? 'border-error' : 'border-outline-variant'} rounded-xl p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[120px] resize-none`}
            required
            maxLength={500}
          />
          {fieldErrors.description && <span className="text-error text-xs font-semibold">{fieldErrors.description}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-on-surface">Telefone *</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => { handlePhoneChange(e); setFieldErrors(prev => ({...prev, phone: ''})) }}
              placeholder="(00) 00000-0000" 
              className={`w-full bg-surface-variant/30 border ${fieldErrors.phone ? 'border-error' : 'border-outline-variant'} rounded-xl p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all`}
              required
            />
            {fieldErrors.phone && <span className="text-error text-xs font-semibold">{fieldErrors.phone}</span>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-on-surface">Site (Opcional)</label>
            <input 
              type="text" 
              value={website}
              onChange={(e) => { setWebsite(e.target.value); setFieldErrors(prev => ({...prev, website: ''})) }}
              placeholder="https://exemplo.com.br" 
              className={`w-full bg-surface-variant/30 border ${fieldErrors.website ? 'border-error' : 'border-outline-variant'} rounded-xl p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all`}
            />
            {fieldErrors.website && <span className="text-error text-xs font-semibold">{fieldErrors.website}</span>}
          </div>
        </div>

        <button 
          disabled={loading || !!(editId && errorMsg.includes('permissão'))}
          type="submit" 
          className="mt-4 w-full bg-primary text-on-primary py-4 rounded-xl font-bold flex gap-2 items-center justify-center hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {loading ? (editId ? 'Salvando...' : 'Publicando...') : (
             editId ? <><Save className="w-5 h-5" /> Salvar Alterações</> : <><Send className="w-5 h-5" /> Publicar Indicação</>
          )}
        </button>
      </form>
      )}
    </div>
  );
}
