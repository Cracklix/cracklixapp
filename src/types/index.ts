/**
 * CRACKLIX Global Type Definitions
 * Production-grade Architecture Layer v17.0 (Testbook Standard)
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
  purchasedTests: string[];
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
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  negativeMarks: number;
  order?: number;
  type: 'MCQ' | 'MULTIPLE_SELECT' | 'NUMERICAL' | 'MATCH' | 'COMPREHENSION';
}

export interface ExamSection {
  id: string;
  name: string;
  order: number;
  questionIds: string[];
  timeLimitMinutes?: number; // Optional sectional timing
  isLocked?: boolean;
}

export interface MockTest {
  id: string;
  seriesId: string;
  title: string;
  exam: string;
  category: 'full' | 'sectional' | 'subject' | 'chapter' | 'pyq' | 'mini';
  duration: number; // Total duration in minutes
  totalQuestions: number;
  negativeMarking: number;
  accessType: PassTier;
  status: 'draft' | 'published';
  sections: ExamSection[];
  pausable: boolean;
  createdAt: number;
  attemptCount?: number;
}

export interface AttemptAnswer {
  questionId: string;
  selectedOption: string | string[] | number | null;
  status: QuestionStatus;
  timeSpent: number; // Seconds spent on this question
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
  remainingTime: number; // Seconds remaining
  currentQuestionIndex: number;
  currentSectionId: string;
  answers: Record<string, AttemptAnswer>; // Keyed by questionId
  deviceInfo: string;
  suspiciousActivityCount: number;
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
  sections: string[]; // List of subject tabs
  createdAt: number;
}
