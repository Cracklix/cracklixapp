/**
 * CRACKLIX Global Type Definitions
 * Production-grade Architecture Layer v32.0 (Institutional Standard)
 */

export type UserRole = 'student' | 'admin' | 'superadmin' | 'creator';
export type PassTier = 'free' | 'pass_plus' | 'premium' | 'elite';
export type LanguageMode = 'english' | 'punjabi' | 'bilingual' | 'hindi';
export type QuestionStatus = 'NOT_VISITED' | 'VISITED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';

export const EXAM_LIST = [
  "PSSSB Clerk", "PSSSB IT Clerk", "PSSSB Patwari", "PSSSB Excise Inspector",
  "Punjab Police SI", "Punjab Police Constable", "Punjab Police Head Constable",
  "PPSC PCS", "PPSC ADO", "PSPCL JE Electrical", "PSPCL JE Civil", "PSTCL JE",
  "CTET Paper 1", "CTET Paper 2", "PSTET", "Lab Attendant", "Other..."
];

export const SUBJECT_LIST = [
  "General Knowledge", "Punjab History & Culture", "Current Affairs",
  "Logical Reasoning", "Quantitative Aptitude", "Punjabi Language",
  "English Language", "ICT & Computers", "Child Pedagogy", 
  "Civil Engineering", "Electrical Engineering", "Other..."
];

export type Subject = typeof SUBJECT_LIST[number];

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  xp: number;
  streak: number;
  role: UserRole;
  activePass: PassTier;
  passExpiry: number;
  createdAt: number;
  updatedAt: number;
  district?: string;
  targetExam?: string;
  bookmarks?: any[];
}

export interface QuestionContent {
  question: string;
  options: string[];
  explanation?: string;
  image?: string;
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
  jobId?: string;
  source?: string;
}

export interface MockTest {
  id: string;
  title: string;
  exam: string;
  subject?: string;
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
  instructions?: string;
  publishedAt?: number;
  aiGenerated?: boolean;
  source?: string;
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

export interface AIGenerationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'review';
  progress: number;
  logs: string[];
  config: any;
  generatedCount: number;
  totalQuestions: number;
  createdAt: number;
  updatedAt: number;
}
