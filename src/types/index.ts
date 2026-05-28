
/**
 * CRACKLIX Global Type Definitions
 * Production-grade Architecture Layer v25.0 (Institutional Standard)
 */

export type UserRole = 'student' | 'admin' | 'superadmin' | 'creator';
export type PassTier = 'free' | 'pass_plus' | 'premium' | 'elite';
export type LanguageMode = 'en' | 'pa' | 'hi' | 'bilingual';
export type QuestionStatus = 'NOT_VISITED' | 'NOT_ANSWERED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';

export type Subject = 
  | 'General Knowledge' 
  | 'Current Affairs' 
  | 'Punjab History' 
  | 'Punjab Culture'
  | 'Punjabi Language'
  | 'English Language' 
  | 'Hindi Language' 
  | 'Reasoning' 
  | 'Quantitative Aptitude' 
  | 'Data Interpretation'
  | 'ICT & Computers' 
  | 'Science' 
  | 'Environmental Studies' 
  | 'Child Development & Pedagogy' 
  | 'Civil Engineering' 
  | 'Electrical Engineering' 
  | 'Mechanical Engineering'
  | 'Other';

export const SUBJECTS: Subject[] = [
  'General Knowledge', 'Current Affairs', 'Punjab History', 'Punjab Culture', 'Punjabi Language', 'English Language', 'Hindi Language', 'Reasoning', 'Quantitative Aptitude', 'Data Interpretation', 'ICT & Computers', 'Science', 'Environmental Studies', 'Child Development & Pedagogy', 'Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Other'
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
  languageMode: LanguageMode;
  createdAt: number;
  updatedAt: number;
}

export interface QuestionContent {
  question: string;
  options: string[];
  explanation?: string;
  image?: string;
}

export interface Question {
  id: string;
  sectionId?: string;
  en: QuestionContent;
  pa?: QuestionContent | null;
  hi?: QuestionContent | null;
  correctAnswer: string; 
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  negativeMarks: number;
  order?: number;
  qualityScore?: number;
  status: 'draft' | 'published';
  type: 'MCQ' | 'NUMERICAL' | 'MATCH';
}

export interface MockTest {
  id: string;
  title: string;
  exam: string;
  category: 'full' | 'sectional' | 'subject' | 'chapter' | 'pyq' | 'mini';
  duration: number; 
  totalQuestions: number;
  negativeMarking: number;
  accessType: PassTier;
  status: 'draft' | 'published';
  createdAt: number;
  updatedAt: number;
  attemptCount?: number;
  aiGenerated?: boolean;
  questionIds?: string[];
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
  topicPerformance?: Record<string, { total: number; correct: number }>;
}
