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
