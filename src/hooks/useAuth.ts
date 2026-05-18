import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
               await setDoc(userRef, { role: 'admin' }, { merge: true });
            }
            setUser({ id: userSnap.id, ...data, role } as User);
          } else {
            // User logged in but no profile in Firestore yet? We can set a basic profile.
            const role = firebaseUser.email === 'icaropn@gmail.com' ? 'admin' : 'user';
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Usuário',
              role,
            };
            await setDoc(userRef, newUser);
            setUser({ id: firebaseUser.uid, ...newUser });
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

  return { user, loading };
}
