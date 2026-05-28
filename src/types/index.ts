/**
 * CRACKLIX Global Type Definitions
 * Production-grade Architecture Layer
 */

export type UserRole = 'student' | 'admin' | 'superadmin' | 'creator';

export type Subject = 
  | 'Punjab GK' | 'Quant' | 'Reasoning' | 'English' | 'Punjabi' | 'Computer' | 'Current Affairs' | 'Science' | 'History' | 'Polity' | 'Geography';

export const SUBJECTS: Subject[] = [
  'Punjab GK', 'Quant', 'Reasoning', 'English', 'Punjabi', 'Computer', 'Current Affairs', 'Science', 'History', 'Polity', 'Geography'
];

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  xp: number;
  streak: number;
  coins: number;
  referralCode?: string;
  targetExam?: string;
  createdAt: number;
  bookmarks?: any[];
}

export type QuestionStatus = 'NOT_VISITED' | 'NOT_ANSWERED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';

export interface Question {
  id: string;
  mockId?: string;
  question_en: string;
  question_pa?: string;
  options_en: string[];
  options_pa?: string[];
  correctAnswer: string;
  subject: Subject;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation_en?: string;
  explanation_pa?: string;
  status: 'draft' | 'published';
  order: number;
  createdAt: number;
}

export type MockStatus = 'draft' | 'published' | 'live';
export type MockAccessType = 'free' | 'pass_plus';

export interface MockTest {
  id: string;
  title: string;
  exam: string;
  duration: number;
  totalQuestions: number;
  negativeMarking: number;
  accessType: MockAccessType;
  status: MockStatus;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  mockId: string;
  mockTitle: string;
  status: 'ongoing' | 'completed';
  startedAt: number;
  completedAt?: number;
  expiresAt: number;
  currentQuestionIndex: number;
  score?: number;
  accuracy?: number;
  analytics?: any;
  deviceInfo: string;
}

export interface AttemptAnswer {
  questionId: string;
  selectedOption: string | null;
  status: QuestionStatus;
  timeSpent: number;
  lastSavedAt: number;
}