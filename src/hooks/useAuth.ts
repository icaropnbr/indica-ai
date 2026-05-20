import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase/config';
import type { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            let role = data.role;
            if (firebaseUser.email === 'icaropn@gmail.com' && role !== 'admin') {
               role = 'admin';
               await setDoc(userRef, { role: 'admin', updatedAt: serverTimestamp() }, { merge: true });
            }
            setUser({ id: userSnap.id, ...data, role } as User);
          } else {
            // User logged in but no profile in Firestore yet? We can set a basic profile.
            // Note: firestore.rules requires new users to be created with role 'user'.
            // Escalate to admin after creation.
            const newUser = {
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
              email: firebaseUser.email || '',
              role: 'user',
              averageScore: 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(userRef, newUser);
            
            let finalRole = 'user';
            if (firebaseUser.email === 'icaropn@gmail.com') {
               finalRole = 'admin';
               await setDoc(userRef, { role: 'admin', updatedAt: serverTimestamp() }, { merge: true });
            }

            setUser({ id: firebaseUser.uid, ...newUser, role: finalRole } as any);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Error signing in with Email:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Error signing up with Email:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut };
}
