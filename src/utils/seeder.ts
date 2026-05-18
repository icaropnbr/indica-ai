import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db} from '../services/firebase/config';

const INITIAL_CATEGORIES = [
  { name: 'Eletricista', slug: 'eletricista', icon: 'zap', isActive: true },
  { name: 'Encanador', slug: 'encanador', icon: 'droplet', isActive: true },
  { name: 'Lava-Jato', slug: 'lava-jato', icon: 'car-wash', isActive: true },
  { name: 'Pedreiro', slug: 'pedreiro', icon: 'hammer', isActive: true },
  { name: 'Diarista', slug: 'diarista', icon: 'sparkles', isActive: true },
  { name: 'Pintor', slug: 'pintor', icon: 'paint-roller', isActive: true },
  { name: 'Mecânico', slug: 'mecanico', icon: 'wrench', isActive: true },
];

export const seedCategories = async () => {
    // Note: in a real environment this should be protected or done manually
    // For this prototype, we'll expose a global function to populate categories if none exist
    try {
        const snapshot = await getDocs(collection(db, 'categories'));
        if (snapshot.empty) {
            console.log('Seeding initial categories...');
            const ops = INITIAL_CATEGORIES.map(cat => 
                addDoc(collection(db, 'categories'), {
                    ...cat,
                    createdAt: serverTimestamp()
                })
            );
            await Promise.all(ops);
            console.log('Categories seeded successfully!');
        }
    } catch(e) {
        console.error('Failed to seed categories', e);
    }
}
