import useSWR from 'swr';
import { collection, getDocs, doc, addDoc, updateDoc, query, where, serverTimestamp, Query, limit } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import type { Category } from '../types';

const CATEGORIES_PATH = 'categories';
const RECOMMENDATIONS_PATH = 'recommendations';

const fetchCategories = async (onlyActive = true) => {
  let q: Query<DocumentData, DocumentData> = collection(db, CATEGORIES_PATH);
  if (onlyActive) {
    q = query(q, where('isActive', '==', true));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
};

export function useCategories(onlyActive = true) {
  const { data, error, isLoading, mutate } = useSWR(
    `categories?active=${onlyActive}`,
    () => fetchCategories(onlyActive)
  );

  return { categories: data || [], error, isLoading, mutate };
}

const fetchPopulatedCategories = async () => {
  const allCategories = await fetchCategories(true);
  const populated = await Promise.all(allCategories.map(async (cat) => {
    const q = query(
      collection(db, RECOMMENDATIONS_PATH),
      where('categoryId', '==', cat.id),
      where('status', '==', 'active'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : cat;
  }));
  return populated.filter(Boolean) as Category[];
};

export function usePopulatedCategories() {
  const { data, error, isLoading, mutate } = useSWR(
    'categories/populated',
    fetchPopulatedCategories
  );

  return { categories: data || [], error, isLoading, mutate };
}

export const checkSlugUnique = async (slug: string, excludeId?: string) => {
  const q = query(collection(db, CATEGORIES_PATH), where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return true;
  if (snapshot.size === 1 && excludeId && snapshot.docs[0].id === excludeId) return true;
  return false;
};

export const createCategory = async (name: string, slug: string, icon: string) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Formato de slug inválido. Use apenas letras minúsculas, números e hifens.');
  }
  
  const isUnique = await checkSlugUnique(slug);
  if (!isUnique) {
    throw new Error('Este slug já está em uso por outra categoria.');
  }

  await addDoc(collection(db, CATEGORIES_PATH), {
    name,
    slug,
    icon: icon || 'category',
    isActive: true,
    createdAt: serverTimestamp(),
  });
};

export const updateCategory = async (id: string, data: Partial<Category>) => {
  if (data.slug) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
      throw new Error('Formato de slug inválido. Use apenas letras minúsculas, números e hifens.');
    }
    const isUnique = await checkSlugUnique(data.slug, id);
    if (!isUnique) {
      throw new Error('Este slug já está em uso por outra categoria.');
    }
  }
  const docRef = doc(db, CATEGORIES_PATH, id);
  await updateDoc(docRef, data);
};

export const deleteCategoryLogically = async (id: string) => {
  const docRef = doc(db, CATEGORIES_PATH, id);
  await updateDoc(docRef, {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
};

