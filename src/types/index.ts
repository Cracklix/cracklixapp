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
  status: 'draft' | 'published' | 'rejected';
  usageCount?: number;
  isMath?: boolean;
  source?: string;
  createdAt?: number;
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
  sections?: {
    subject: Subject;
    count: number;
  }[];
  status: 'draft' | 'published';
  createdAt: number;
}
