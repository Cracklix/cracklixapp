/**
 * CRACKLIX Global Type Definitions
 * Enterprise Architecture Layer v50.0 (Institutional Standard)
 */

export type UserRole = 'student' | 'admin' | 'superadmin' | 'creator';
export type PassTier = 'free' | 'pass_plus' | 'premium' | 'elite';
export type LanguageMode = 'english' | 'punjabi' | 'hindi' | 'en_pa' | 'en_hi' | 'pa_hi' | 'trilingual';
export type QuestionStatus = 'NOT_VISITED' | 'VISITED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';

export interface QuestionOption {
  en?: string;
  pa?: string;
  hi?: string;
}

export interface Question {
  id: string;
  questionEn?: string;
  questionPa?: string;
  questionHi?: string;
  options: QuestionOption[];
  correctAnswer: number; // 0, 1, 2, 3
  explanationEn?: string;
  explanationPa?: string;
  explanationHi?: string;
  subject: string;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  negativeMarks: number;
  status: 'draft' | 'published';
  createdAt: number;
  order?: number;
}

export interface MockTest {
  id: string;
  title: string;
  exam: string;
  category: 'full' | 'sectional' | 'subject' | 'pyq' | 'quiz';
  duration: number; // total minutes
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: number;
  marksPerQuestion: number;
  accessType: PassTier;
  status: 'draft' | 'published';
  languageMode: LanguageMode;
  createdAt: number;
  updatedAt: number;
  attemptCount: number;
  sections?: any[];
}

export interface AttemptAnswer {
  questionId: string;
  selectedOption: number | null; // 0-3
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

export const EXAM_LIST = [
  "PSSSB Clerk (General)",
  "PSSSB Clerk IT",
  "PSSSB Clerk Accounts",
  "PSSSB Excise Inspector",
  "PSSSB Senior Assistant",
  "PSSSB Patwari",
  "Punjab Police SI",
  "Punjab Police Constable",
  "PPSC PCS",
  "PSTET Paper 1",
  "PSTET Paper 2",
  "SSC CGL",
  "SSC CHSL",
  "Banking IBPS PO",
  "Banking SBI Clerk",
  "Other..."
];

export const SUBJECT_LIST = [
  "Punjab GK",
  "Quantitative Aptitude",
  "Reasoning Ability",
  "English Language",
  "Punjabi Language",
  "Computer/ICT",
  "General Awareness",
  "Current Affairs",
  "Child Development",
  "Agriculture",
  "Sikh History",
  "Other..."
];
