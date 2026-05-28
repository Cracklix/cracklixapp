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
  | 'Computer'
  | 'Current Affairs'
  | 'General Science'
  | 'History'
  | 'Polity'
  | 'Geography'
  | 'Agriculture'
  | 'Static GK'
  | 'Law/Constitution'
  | 'Environment';

export const SUBJECTS: Subject[] = [
  'Punjab GK', 'Quant', 'Reasoning', 'English', 'Punjabi', 
  'Computer', 'Current Affairs', 'General Science', 'History', 
  'Polity', 'Geography', 'Agriculture', 'Static GK', 
  'Law/Constitution', 'Environment'
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

export interface Exam {
  id: string;
  name: string;
  slug: string;
  department: string;
  category: 'Punjab';
  icon: string;
  totalMocks: number;
  activeStudents: number;
  premium: boolean;
  duration?: number;
  totalMarks?: number;
  eligibility?: string;
  salary?: string;
  createdAt?: number;
}

export interface Question {
  id: string;
  question_en: string;
  question_pa?: string;
  options_en: string[];
  options_pa?: string[];
  correctAnswer: string;
  subject: Subject;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  pyq: boolean;
  year?: number;
  explanation_en?: string;
  explanation_pa?: string;
  qualityScore?: number;
  status?: 'draft' | 'published';
  usageCount?: number;
  isMath?: boolean;
  createdAt?: number;
}

export interface DISet {
  id: string;
  passage: string;
  tableData?: string;
  chartUrl?: string;
  questions: Question[];
  subject: Subject;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: number;
}

export interface MockTest {
  id: string;
  title: string;
  exam: string;
  duration: number;
  totalQuestions: number;
  negativeMarking: number;
  premium: boolean;
  published: boolean;
  aiGenerated?: boolean;
  questionIds?: string[];
  diSetIds?: string[];
  createdAt: number;
}
