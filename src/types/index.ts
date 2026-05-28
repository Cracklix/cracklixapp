/**
 * CRACKLIX Global Type Definitions
 * Clean Architecture Entity Layer
 */

export type UserRole = 'student' | 'admin' | 'superadmin' | 'creator';

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
  subject: string;
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
  question_pa: string;
  options_en: string[];
  options_pa: string[];
  correctAnswer: string;
  subject: string;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  pyq: boolean;
  year?: number;
  explanation_en?: string;
  explanation_pa?: string;
  qualityScore?: number;
  status?: 'draft' | 'published';
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
  createdAt: number;
}

export interface LiveActivityItem {
  id: string;
  userId: string;
  message: string;
  type: 'score' | 'level' | 'badge';
  createdAt: number;
}

export interface LiveRank {
  userId: string;
  name: string;
  score: number;
  accuracy: number;
  district?: string;
}

export interface JobAlert {
  id: string;
  title: string;
  department: string;
  postCount: number;
  lastDate: number;
  applyUrl: string;
  category: string;
  status: 'active' | 'closed';
  type: 'vacancy' | 'result' | 'admit_card' | 'notice';
  createdAt: number;
}
