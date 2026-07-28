export interface Flashcard {
  front: string;
  back: string;
  hint?: string;
  mastered?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface FlashcardDeck {
  type: 'flashcards';
  title: string;
  cards: Flashcard[];
}

export interface QuizDeck {
  type: 'quiz';
  title: string;
  questions: QuizQuestion[];
}

export type StudyDeck = FlashcardDeck | QuizDeck;

export interface Session {
  id: string;
  timestamp: number;
  notes: string;
  data: StudyDeck;
}
