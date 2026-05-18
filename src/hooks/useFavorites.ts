import useSWR from 'swr';
import { collection, getDocs, doc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase/config';
import { handleFirestoreError, OperationType } from '../services/firebase/error';
import type { Favorite } from '../types';

const getFavoritesPath = (userId: string) => `users/${userId}/favorites`;

const fetchFavorites = async (userId: string) => {
  try {
    const path = getFavoritesPath(userId);
    const snapshot = await getDocs(collection(db, path));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Favorite));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, getFavoritesPath(userId));
    throw error;
  }
};

export const useFavorites = (userId?: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `users/${userId}/favorites` : null,
    () => fetchFavorites(userId!)
  );

  return { favorites: data, error, isLoading, mutate };
};

export const toggleFavorite = async (recommendationId: string, currentFavorites: Favorite[]) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');

  const path = getFavoritesPath(user.uid);
  const existingFavorite = currentFavorites.find(f => f.recommendationId === recommendationId);

  try {
    if (existingFavorite) {
      if (!existingFavorite.id) throw new Error('Favorite ID missing');
      const docRef = doc(db, path, existingFavorite.id);
      await deleteDoc(docRef);
    } else {
      await addDoc(collection(db, path), {
        recommendationId,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, existingFavorite ? OperationType.DELETE : OperationType.CREATE, path);
    throw error;
  }
};
