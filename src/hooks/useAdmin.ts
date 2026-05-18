import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import type { Recommendation, User } from '../types';

export const getDashboardStats = async () => {
  const usersSnap = await getDocs(collection(db, 'users'));
  const recsSnap = await getDocs(collection(db, 'recommendations'));
  return {
    totalUsers: usersSnap.size,
    totalRecommendations: recsSnap.size,
  };
};

export const fetchAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as User[];
};

export const fetchAllRecommendations = async () => {
    const snap = await getDocs(collection(db, 'recommendations'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Recommendation[];
};

export const updateRecommendationStatusAdmin = async (id: string, targetStatus: 'active' | 'inactive') => {
    await updateDoc(doc(db, 'recommendations', id), {
        status: targetStatus,
        updatedAt: new Date()
    });
};

export const updateUserRole = async (userId: string, targetRole: 'admin' | 'user') => {
    await updateDoc(doc(db, 'users', userId), {
        role: targetRole,
        updatedAt: new Date()
    });
};
