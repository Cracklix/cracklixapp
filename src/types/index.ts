/**
 * CRACKLIX Global Type Definitions
 * Production-grade Architecture Layer v32.5 (Institutional Standard)
 */

export type UserRole = 'student' | 'admin' | 'superadmin' | 'creator';
export type PassTier = 'free' | 'pass_plus' | 'premium' | 'elite';
export type LanguageMode = 'english' | 'punjabi' | 'bilingual' | 'hindi';
export type QuestionStatus = 'NOT_VISITED' | 'VISITED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';

export const EXAM_LIST = [
  "PSSSB Clerk (General)", "PSSSB Clerk IT", "PSSSB Clerk Accounts", "PSSSB Patwari", 
  "PSSSB Excise Inspector", "PSSSB Junior Engineer (Civil)", "PSSSB Junior Engineer (Electrical)",
  "Punjab Police SI", "Punjab Police Constable", "PPSC PCS", "PPSC ADO", "CTET Paper 1", 
  "CTET Paper 2", "PSTET Paper 1", "PSTET Paper 2", "Lab Attendant", "Other..."
];

export const SUBJECT_LIST = [
  "General Knowledge", "Current Affairs", "Punjab History & Culture", 
  "Logical Reasoning", "Quantitative Aptitude", "Punjabi (Qualifying)", 
  "Punjabi Language", "English Language", "ICT & Computers", 
  "Child Development & Pedagogy", "Environmental Studies (EVS)",
  "Civil Engineering Core", "Other..."
];

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
  correctAnswer: string; // "A", "B", "C", "D"
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  negativeMarks: number;
  order?: number;
  status: 'draft' | 'published';
  source?: string;
  qualityScore?: number;
}

export interface MockTest {
  id: string;
  title: string;
  exam: string;
  category: 'full' | 'sectional' | 'subject' | 'chapter' | 'pyq' | 'mini' | 'quiz';
  duration: number; 
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: number;
  accessType: PassTier;
  status: 'draft' | 'published' | 'archived';
  languageMode: LanguageMode;
  createdAt: number;
  updatedAt: number;
  attemptCount: number;
  publishedAt?: number;
}

export interface AttemptAnswer {
  questionId: string;
  selectedOption: string | null;
  status: QuestionStatus;
  timeSpent: number; 
  lastUpdated: number;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  mockId: string;
  mockTitle: string;
  status: 'ongoing' | 'paused' | 'completed';
  startedAt: number;
  completedAt?: number;
  remainingTime: number; 
  currentQuestionIndex: number;
  answers: Record<string, AttemptAnswer>; 
  score?: number;
  accuracy?: number;
  correctCount?: number;
  incorrectCount?: number;
  unattemptedCount?: number;
  percentile?: number;
  rank?: number;
  totalParticipants?: number;
  topicPerformance?: Record<string, { total: number; correct: number }>;
}
