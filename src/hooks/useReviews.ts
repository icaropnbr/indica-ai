import useSWR from 'swr';
import { collection, getDocs, doc, getDoc, deleteDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db, auth } from '../services/firebase/config';
import { handleFirestoreError, OperationType } from '../services/firebase/error';
import type { Review, Recommendation } from '../types';

const getReviewsPath = (recommendationId: string) => `recommendations/${recommendationId}/reviews`;

const fetchReviews = async (recommendationId: string) => {
  try {
    const path = getReviewsPath(recommendationId);
    const snapshot = await getDocs(collection(db, path));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, getReviewsPath(recommendationId));
    throw error;
  }
};

export const useReviews = (recommendationId?: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    recommendationId ? `recommendations/${recommendationId}/reviews` : null,
    () => fetchReviews(recommendationId!)
  );

  return { reviews: data, error, isLoading, mutate };
};

const fetchUserReview = async (recommendationId: string, userId: string): Promise<Review | null> => {
  try {
    const docRef = doc(db, getReviewsPath(recommendationId), userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Review;
  } catch(error) {
    return null;
  }
};

export const useUserReview = (recommendationId?: string, userId?: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    recommendationId && userId ? `reviews/${recommendationId}/${userId}` : null,
    () => fetchUserReview(recommendationId!, userId!)
  );

  return { review: data, error, isLoading, mutate };
};

export const createReview = async (recommendationId: string, rating: number, comment: string = '') => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');

  const reviewRef = doc(db, getReviewsPath(recommendationId), user.uid);
  const recRef = doc(db, 'recommendations', recommendationId);

  try {
    await runTransaction(db, async (transaction) => {
      const recDoc = await transaction.get(recRef);
      if (!recDoc.exists()) throw new Error('Recommendation not found');

      const reviewDoc = await transaction.get(reviewRef);
      const isUpdate = reviewDoc.exists();
      const existingRating = isUpdate ? reviewDoc.data().rating : 0;

      const recData = recDoc.data() as Recommendation;
      const currentRatingSum = (recData.rating || 0) * (recData.ratingsCount || 0);

      let newRatingsCount = recData.ratingsCount || 0;
      let newRatingSum = currentRatingSum;

      if (isUpdate) {
        newRatingSum = currentRatingSum - existingRating + rating;
      } else {
        newRatingsCount += 1;
        newRatingSum += rating;
      }

      const newAverageRating = newRatingsCount > 0 ? (newRatingSum / newRatingsCount) : 0;

      transaction.update(recRef, {
        rating: newAverageRating,
        ratingsCount: newRatingsCount,
        updatedAt: serverTimestamp()
      });

      const reviewData: Partial<Review> = {
        recommendationId,
        authorId: user.uid,
        authorName: user.displayName || 'Usuário',
        rating,
        comment,
        updatedAt: serverTimestamp() as any
      };

      if (!isUpdate) {
        reviewData.createdAt = serverTimestamp() as any;
      }

      transaction.set(reviewRef, reviewData, { merge: true });
    });
    return user.uid;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, getReviewsPath(recommendationId));
    throw error;
  }
};

export const deleteReview = async (recommendationId: string, reviewId: string) => {
   const path = getReviewsPath(recommendationId);
   try {
     const docRef = doc(db, path, reviewId);
     await deleteDoc(docRef);
   } catch(error) {
       handleFirestoreError(error, OperationType.DELETE, `${path}/${reviewId}`);
       throw error;
   }
};
