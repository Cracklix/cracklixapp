/**
 * CRACKLIX Global Type Definitions
 * Production-grade Architecture Layer v9.0
 */

export type UserRole = 'student' | 'admin' | 'superadmin' | 'creator';

export type Subject = 
  | 'General Knowledge' 
  | 'Current Affairs' 
  | 'Punjab History' 
  | 'Punjabi' 
  | 'English' 
  | 'Hindi' 
  | 'Reasoning' 
  | 'Quant' 
  | 'ICT' 
  | 'Science' 
  | 'EVS' 
  | 'Child Pedagogy' 
  | 'Civil Engineering' 
  | 'Electrical Engineering' 
  | 'Mechanical' 
  | 'Other';

export const SUBJECTS: Subject[] = [
  'General Knowledge', 'Current Affairs', 'Punjab History', 'Punjabi', 'English', 'Hindi', 'Reasoning', 'Quant', 'ICT', 'Science', 'EVS', 'Child Pedagogy', 'Civil Engineering', 'Electrical Engineering', 'Mechanical', 'Other'
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
  pa?: QuestionContent | null;
  hi?: QuestionContent | null;
  correctAnswer: string; 
  subject: string;
  chapter?: string;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  exam?: string;
  year?: number;
  marks: number;
  negativeMarks: number;
  status: 'draft' | 'published';
  usageCount: number;
  qualityScore?: number;
  createdAt: number;
  updatedAt: number;
  order?: number;
}

export type MockStatus = 'draft' | 'published' | 'live' | 'archived';
export type MockAccessType = 'free' | 'pass_plus' | 'premium';
export type MockCategory = 'full' | 'sectional' | 'subject' | 'chapter' | 'quiz' | 'live_test';

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
  publishedAt?: number | null;
  attemptCount?: number;
  avgScore?: number;
  questionIds?: string[];
  instructions?: string[];
  aiGenerated?: boolean;
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
