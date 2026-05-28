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

export interface QuestionContent {
  question: string;
  options: string[];
  explanation?: string;
}

export interface Question {
  id: string;
  en: QuestionContent;
  pa?: QuestionContent;
  correctAnswer: string; // The exact text match or index reference
  subject: Subject;
  chapter?: string;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  exam?: string;
  year?: number;
  tags?: string[];
  status: 'draft' | 'published';
  usageCount: number;
  qualityScore?: number;
  correctPercentage?: number;
  avgTimeSeconds?: number;
  createdAt: number;
  updatedAt: number;
}

export type MockStatus = 'draft' | 'published' | 'live' | 'archived';
export type MockAccessType = 'free' | 'pass_plus' | 'premium';
export type MockCategory = 'full' | 'sectional' | 'chapter' | 'quiz' | 'live_test' | 'pyq';

export interface MockTest {
  id: string;
  title: string;
  exam: string;
  category: MockCategory;
  duration: number;
  totalQuestions: number;
  negativeMarking: number;
  accessType: MockAccessType;
  status: MockStatus;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  attemptCount?: number;
  avgScore?: number;
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
