export type Role = 'user' | 'admin';

export interface User {
  id: string; // Auth UID
  name: string;
  email: string;
  role: Role;
  averageScore: number;
  createdAt: string; // ISO String or Firestore Timestamp
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  authorId: string;
  status: 'active' | 'inactive';
  rating: number; // Média das avaliações
  ratingsCount: number;
  contactPhone?: string;
  contactEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  recommendationId: string;
  authorId: string;
  authorName: string; // Desnormalizado para evitar join
  rating: number; // 1 a 5
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  recommendationId: string;
  createdAt: string;
}
