/**
 * CRACKLIX Global Type Definitions
 * Production-grade Architecture Layer v15.0 (Testbook Standard)
 */

export type UserRole = 'student' | 'admin' | 'superadmin' | 'creator';

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
  bloomLevel?: 'knowledge' | 'understanding' | 'application' | 'analysis';
  examId?: string;
  testId?: string;
  marks: number;
  negativeMarks: number;
  status: 'draft' | 'published';
  usageCount: number;
  qualityScore?: number;
  createdAt: number;
  updatedAt: number;
  order?: number;
}

export interface TestSeries {
  id: string;
  title: string;
  category: string; // PSSSB, Punjab Police, PPSC
  description: string;
  thumbnail: string;
  totalTests: number;
  freeTests: number;
  languages: string[]; // ["EN", "PA"]
  price?: number;
  isActive: boolean;
  createdAt: number;
}

export interface ExamSubject {
  id: string;
  seriesId: string;
  name: string;
  icon: string;
  totalTests: number;
  freeTests: number;
  difficulty: string;
  weightage?: number;
}

export type MockStatus = 'draft' | 'published' | 'live' | 'archived';
export type MockAccessType = 'free' | 'pass_plus' | 'premium';
export type MockCategory = 'full' | 'sectional' | 'subject' | 'chapter' | 'quiz' | 'live_test' | 'pyq' | 'marathon' | 'revision';

export interface MockTest {
  id: string;
  seriesId?: string;
  subjectId?: string;
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
  questionIds?: string[];
  aiGenerated?: boolean;
  languageMode?: 'en' | 'pa' | 'bilingual';
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
