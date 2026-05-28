/**
 * CRACKLIX Global Type Definitions
 * Clean Architecture Entity Layer
 */

export type UserRole = 'student' | 'admin' | 'superadmin' | 'creator';

export type Subject = 
  | 'Punjab GK'
  | 'Quant'
  | 'Reasoning'
  | 'English'
  | 'Punjabi'
  | 'Hindi'
  | 'Sanskrit'
  | 'Computer'
  | 'Current Affairs'
  | 'General Science'
  | 'History'
  | 'Polity'
  | 'Geography'
  | 'Agriculture'
  | 'Static GK'
  | 'Law/Constitution'
  | 'Environment'
  | 'Child Development & Pedagogy'
  | 'EVS'
  | 'Social Science'
  | 'Science'
  | 'Teaching Aptitude';

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
  question_en: string;
  question_pa?: string;
  question_hi?: string;
  options_en: string[];
  options_pa?: string[];
  options_hi?: string[];
  correctAnswer: string;
  subject: Subject;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  pyq: boolean;
  year?: number;
  explanation_en?: string;
  explanation_pa?: string;
  explanation_hi?: string;
  qualityScore?: number;
  status: 'draft' | 'published' | 'rejected';
  usageCount?: number;
  usedInMocks?: string[];
  lastUsedAt?: number;
  lastMockId?: string;
  isMath?: boolean;
  source?: string;
  ocrConfidence?: number;
  createdAt?: number;
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
  negativeMarking: number;
  premium: boolean; 
  accessType: MockAccessType;
  status: MockStatus;
  questionIds: string[];
  createdAt: number;
  publishedAt?: number;
  scheduledAt?: number;
  expiresAt?: number;
  liveAt?: number;
  updatedAt?: number;
  createdBy?: string;
  marksPerQuestion?: number;
  instructions?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  maxAttempts?: number;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  mockId: string;
  mockTitle: string;
  status: 'ongoing' | 'completed';
  startedAt: number;
  expiresAt: number;
  lastActiveAt: number;
  currentQuestionIndex: number;
  score?: number;
  accuracy?: number;
  cheatFlags: number;
  deviceInfo: string;
  language?: string;
}

export interface AttemptAnswer {
  questionId: string;
  selectedOption: string | null;
  status: QuestionStatus;
  timeSpent: number;
  lastSavedAt: number;
}
