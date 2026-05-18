import useSWR from 'swr';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase/config';
import { handleFirestoreError, OperationType } from '../services/firebase/error';
import type { User } from '../types';

const USERS_PATH = 'users';

const fetchUser = async (id: string) => {
  try {
    const docRef = doc(db, USERS_PATH, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as User;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${USERS_PATH}/${id}`);
    throw error;
  }
};

export const useUser = (id?: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `users/${id}` : null,
    () => fetchUser(id!)
  );

  return { user: data, error, isLoading, mutate };
};

export const createProfileIfNotExists = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const docRef = doc(db, USERS_PATH, user.uid);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      const payload = {
        name: user.displayName || 'Usuário',
        email: user.email || '',
        role: 'user',
        averageScore: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(docRef, payload);
      return { id: user.uid, ...payload } as unknown as User;
    }

    return { id: snapshot.id, ...snapshot.data() } as unknown as User;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${USERS_PATH}/${user?.uid}`);
    throw error;
  }
};

export const updateUserProfile = async (id: string, name: string) => {
    try {
        const docRef = doc(db, USERS_PATH, id);
        await updateDoc(docRef, {
            name,
            updatedAt: serverTimestamp()
        })
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `${USERS_PATH}/${id}`);
        throw error;
    }
}
