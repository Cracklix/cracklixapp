/**
 * CRACKLIX Global Type Definitions
 * Production-grade Architecture Layer v16.0 (Testbook Standard)
 */

export type UserRole = 'student' | 'admin' | 'superadmin' | 'creator';
export type PassTier = 'free' | 'pass_plus' | 'premium' | 'elite';
export type LanguageMode = 'en' | 'pa' | 'hi' | 'bilingual';

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
  purchasedTests: string[];
  languageMode: LanguageMode;
  createdAt: number;
  updatedAt: number;
}

export interface TestSeries {
  id: string;
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  totalTests: number;
  freeTests: number;
  price: number;
  passRequired: PassTier;
  isActive: boolean;
  createdAt: number;
}

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
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  negativeMarks: number;
  order?: number;
}

export interface MockTest {
  id: string;
  seriesId: string;
  title: string;
  exam: string;
  category: 'full' | 'sectional' | 'subject' | 'chapter' | 'pyq' | 'mini';
  duration: number;
  totalQuestions: number;
  negativeMarking: number;
  accessType: PassTier;
  status: 'draft' | 'published';
  createdAt: number;
  attemptCount?: number;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  mockId: string;
  status: 'ongoing' | 'completed';
  startedAt: number;
  completedAt?: number;
  answers: Record<string, any>;
}

export interface AttemptAnswer {
  questionId: string;
  selectedOption: string | null;
  status: 'NOT_VISITED' | 'NOT_ANSWERED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';
  timeSpent: number;
}
