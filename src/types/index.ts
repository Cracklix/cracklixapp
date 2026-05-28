/**
 * CRACKLIX Global Type Definitions
 * Production-grade Architecture Layer v30.5 (Institutional Standard)
 */

export type UserRole = 'student' | 'admin' | 'superadmin' | 'creator';
export type PassTier = 'free' | 'pass_plus' | 'premium' | 'elite';
export type LanguageMode = 'english' | 'punjabi' | 'bilingual';
export type QuestionStatus = 'NOT_VISITED' | 'VISITED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';

export type Subject = 
  | 'General Knowledge' 
  | 'Current Affairs' 
  | 'Punjab History' 
  | 'Punjab Culture'
  | 'Punjabi Language'
  | 'English Language' 
  | 'Reasoning' 
  | 'Quantitative Aptitude' 
  | 'ICT & Computers' 
  | 'Child Development & Pedagogy' 
  | 'Other';

export const SUBJECTS: Subject[] = [
  'General Knowledge', 'Current Affairs', 'Punjab History', 'Punjab Culture', 'Punjabi Language', 'English Language', 'Reasoning', 'Quantitative Aptitude', 'ICT & Computers', 'Child Development & Pedagogy', 'Other'
];

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
  correctAnswer: string; // "A", "B", "C", "D"
  subject: Subject;
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
  category: 'full' | 'sectional' | 'subject' | 'chapter' | 'pyq' | 'mini';
  duration: number; 
  totalQuestions: number;
  totalMarks?: number;
  negativeMarking: number;
  accessType: PassTier;
  status: 'draft' | 'published' | 'archived';
  languageMode: LanguageMode;
  createdAt: number;
  updatedAt: number;
  attemptCount?: number;
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
