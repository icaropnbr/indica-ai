import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { collection, getDocs, query, where, getDoc, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, limit, startAfter } from 'firebase/firestore';
import { db, auth } from '../services/firebase/config';
import { handleFirestoreError, OperationType } from '../services/firebase/error';
import type { Recommendation } from '../types';

const RECOMMENDATIONS_PATH = 'recommendations';

// Fetchers
const fetchRecommendations = async (_url: string, categoryId?: string, authorId?: string) => {
  try {
    // Only fetch recommendations where status is not inactive. 
    // We'll filter client-side to avoid composite index issues if needed, but it's better to try simple query.
    let q = query(
      collection(db, RECOMMENDATIONS_PATH),
      where('status', '==', 'active')
    );

    if (categoryId) {
      q = query(q, where('categoryId', '==', categoryId));
    }
    
    if (authorId) {
      // If fetching for a specific author, maybe they want to see all? 
      // The prompt says "Se o usuário confirmar, a indicação deve ser inativada, ou seja, exclusão lógica", meaning on profile it's logically excluded, so we shouldn't show it anywhere.
      q = query(collection(db, RECOMMENDATIONS_PATH), where('authorId', '==', authorId), where('status', '==', 'active'));
    }

    const snapshot = await getDocs(q);
    // Sort client side to bypass missing composite indexes for status+createdAt
    const docs = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
      } as Recommendation;
    });
    return docs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, RECOMMENDATIONS_PATH);
    throw error;
  }
};

const fetchRecommendation = async (id: string) => {
  try {
    const docRef = doc(db, RECOMMENDATIONS_PATH, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    return { 
      id: snapshot.id, 
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
    } as Recommendation;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${RECOMMENDATIONS_PATH}/${id}`);
    throw error;
  }
};

// Hooks
export const useRecommendations = (categoryId?: string) => {
  const [recommendations, setRecommendations] = useState<Recommendation[] | undefined>(undefined);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchMore = async (isInitial = false) => {
    if ((!hasMore && !isInitial) || (!isInitial && isLoading)) return;
    
    if (isInitial) {
      setIsLoading(true);
      setRecommendations(undefined);
    }
    
    try {
      let q = query(
        collection(db, RECOMMENDATIONS_PATH),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(6)
      );

      if (categoryId) {
        q = query(
          collection(db, RECOMMENDATIONS_PATH),
          where('categoryId', '==', categoryId),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
      }

      if (!isInitial && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
        } as Recommendation;
      });

      if (docs.length < 6) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (isInitial) {
        setRecommendations(docs);
      } else {
        setRecommendations(prev => {
          if (!prev) return docs;
          const newDocs = docs.filter(d => !prev.find(p => p.id === d.id));
          return [...prev, ...newDocs];
        });
      }

      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setLastDoc(null);
    setHasMore(true);
    fetchMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const mutate = () => fetchMore(true);

  return { recommendations, error, isLoading, hasMore, fetchMore, mutate };
};

export const useUserRecommendations = (userId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `recommendations?user=${userId}` : null,
    () => fetchRecommendations('recommendations', undefined, userId)
  );

  return { recommendations: data, error, isLoading, mutate };
};

export const useRecommendation = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `recommendations/${id}` : null,
    () => fetchRecommendation(id)
  );

  return { recommendation: data, error, isLoading, mutate };
};

// Mutations
export const createRecommendation = async (data: Omit<Recommendation, 'id' | 'authorId' | 'status' | 'rating' | 'ratingsCount' | 'createdAt' | 'updatedAt'>) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');

  try {
    const payload = {
      ...data,
      authorId: user.uid,
      status: 'active',
      rating: 0,
      ratingsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, RECOMMENDATIONS_PATH), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, RECOMMENDATIONS_PATH);
    throw error;
  }
};

export const updateRecommendation = async (id: string, data: Partial<Pick<Recommendation, 'title' | 'description' | 'categoryId' | 'contactPhone' | 'contactWebsite'>>) => {
  try {
    const docRef = doc(db, RECOMMENDATIONS_PATH, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${RECOMMENDATIONS_PATH}/${id}`);
    throw error;
  }
};

export const deleteRecommendation = async (id: string) => {
  try {
    const docRef = doc(db, RECOMMENDATIONS_PATH, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${RECOMMENDATIONS_PATH}/${id}`);
    throw error;
  }
};
