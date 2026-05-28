/**
 * CRACKLIX Global Type Definitions
 * Clean Architecture Entity Layer
 */

export type UserRole = 'student' | 'admin' | 'superadmin' | 'creator';

export type Subject = 
  | 'Punjab GK'
  | 'Quant' | 'Reasoning' | 'English' | 'Punjabi' | 'Hindi' | 'Sanskrit' | 'Computer' | 'Current Affairs' | 'General Science' | 'History' | 'Polity' | 'Geography' | 'Agriculture' | 'Static GK' | 'Law/Constitution' | 'Environment' | 'Child Development & Pedagogy' | 'EVS' | 'Social Science' | 'Science' | 'Teaching Aptitude';

export const SUBJECTS: Subject[] = [
  'Punjab GK', 'Quant', 'Reasoning', 'English', 'Punjabi', 'Hindi', 'Sanskrit',
  'Computer', 'Current Affairs', 'General Science', 'History', 
  'Polity', 'Geography', 'Agriculture', 'Static GK', 
  'Law/Constitution', 'Environment', 'Child Development & Pedagogy',
  'EVS', 'Social Science', 'Science', 'Teaching Aptitude'
];

export const EXAM_BOARDS = [
  'PSSSB', 'Punjab Police', 'PPSC', 'CTET', 'PSTET', 'SSC', 'Banking', 'Railways', 'UPSC', 'Jail Warder'
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
  bookmarks?: BookmarkItem[];
}

export interface BookmarkItem {
  id: string;
  text: string;
  subject: Subject;
  type: 'question' | 'article';
  savedAt: number;
}

export type QuestionStatus = 'NOT_VISITED' | 'NOT_ANSWERED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';

export interface Question {
  id: string;
  mockId?: string; // Linked to a specific mock if not in global bank
  question_en: string;
  question_pa?: string;
  question_hi?: string;
  options_en: string[];
  options_pa?: string[];
  options_hi?: string[];
  correctAnswer: string;
  subject: Subject;
  topic?: string;
  chapter?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  negativeMarks?: number;
  pyq: boolean;
  year?: number;
  explanation_en?: string;
  explanation_pa?: string;
  explanation_hi?: string;
  qualityScore?: number;
  status: 'draft' | 'published' | 'rejected';
  usageCount?: number;
  order?: number;
  isMath?: boolean;
  imageUrl?: string;
  createdAt?: number;
  updatedAt?: number;
}

export type MockStatus = 'draft' | 'published' | 'scheduled' | 'live' | 'expired' | 'archived';
export type MockAccessType = 'free' | 'pass_plus' | 'premium' | 'batch';

export interface MockTest {
  id: string;
  title: string;
  exam: string;
  type: 'full' | 'sectional' | 'chapter';
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: number;
  accessType: MockAccessType;
  status: MockStatus;
  questionIds: string[]; // Still used for order reference
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  liveAt?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  instructions?: string;
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
  lastActiveAt: number;
  currentQuestionIndex: number;
  score?: number;
  accuracy?: number;
  cheatFlags: number;
  deviceInfo: string;
  language?: string;
  analytics?: any;
}

export interface AttemptAnswer {
  questionId: string;
  selectedOption: string | null;
  status: QuestionStatus;
  timeSpent: number;
  lastSavedAt: number;
}
