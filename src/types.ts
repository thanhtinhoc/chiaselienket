export interface Link {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export interface CategoryOption {
  id: string;
  name: string;
  color: string; // Tailwind class background/text color representation
}

export type SortOption = 'newest' | 'oldest' | 'az' | 'za';
