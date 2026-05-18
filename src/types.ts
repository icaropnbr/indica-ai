export interface User {
  uid: string;
  id?: string;
  email: string | null;
  displayName?: string | null;
  name?: string | null;
  role?: 'admin' | 'user';
  averageScore?: number;
}

export interface Recommendation {
  id?: string;
  title: string;
  description: string;
  categoryId: string;
  authorId?: string;
  status?: 'active' | 'inactive';
  contactPhone?: string;
  contactWebsite?: string;
  rating?: number;
  ratingsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  isActive: boolean;
}

export interface Favorite {
  id?: string;
  userId: string;
  recommendationId: string;
  createdAt: string;
}

export interface Review {
  id?: string;
  recommendationId: string;
  authorId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}
