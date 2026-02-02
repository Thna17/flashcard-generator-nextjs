// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Flashcard Types
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  imageUrl?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Study Session Types
export interface StudySession {
  id: string;
  userId: string;
  flashcardId: string;
  correct: boolean;
  timeSpent: number;
  createdAt: Date;
}

// Report Types
export interface StudyReport {
  totalCards: number;
  cardsStudied: number;
  correctAnswers: number;
  accuracy: number;
  averageTimePerCard: number;
  categoryBreakdown: {
    category: string;
    count: number;
    accuracy: number;
  }[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
