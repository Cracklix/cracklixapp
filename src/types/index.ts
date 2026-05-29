/**
 * CRACKLIX Global Type Definitions
 * Enterprise Architecture Layer v45.0 (Institutional Standard)
 */

export type UserRole = 'student' | 'admin' | 'superadmin' | 'creator';
export type PassTier = 'free' | 'pass_plus' | 'premium' | 'elite';
export type LanguageMode = 'english' | 'punjabi' | 'bilingual';
export type QuestionStatus = 'NOT_VISITED' | 'VISITED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';

export interface QuestionOption {
  en: string;
  pa: string;
}

export interface Question {
  id: string;
  questionEn: string;
  questionPa: string;
  options: QuestionOption[];
  correctAnswer: number; // 0, 1, 2, 3
  solutionEn: string;
  solutionPa: string;
  explanationEn: string;
  explanationPa: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: number; // seconds
  marks: number;
  negativeMarks: number;
  status: 'draft' | 'published';
  createdAt: number;
  tags?: string[];
  pyq?: boolean;
  source?: string;
}

export interface MockTest {
  id: string;
  title: string;
  exam: string;
  category: 'full' | 'sectional' | 'subject' | 'pyq' | 'quiz';
  duration: number; // minutes
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: number;
  accessType: PassTier;
  status: 'draft' | 'published';
  languageMode: LanguageMode;
  createdAt: number;
  updatedAt: number;
  attemptCount: number;
  questionIds?: string[];
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
  "PSSSB Clerk (General)", "PSSSB Patwari", "PSSSB Excise Inspector", 
  "Punjab Police SI", "Punjab Police Constable", "PPSC PCS", "CTET", "PSTET", "SSC CGL", "Other..."
];

export const SUBJECT_LIST = [
  "General Knowledge", "Punjab GK", "Logical Reasoning", "Quantitative Aptitude", 
  "English Language", "Punjabi Language", "Computer / ICT", "General Science", "Other..."
];
