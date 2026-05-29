/**
 * CRACKLIX Global Type Definitions
 * Enterprise Architecture Layer v45.0 (Institutional Standard)
 */

export type UserRole = 'student' | 'admin' | 'superadmin' | 'creator';
export type PassTier = 'free' | 'pass_plus' | 'premium' | 'elite';
export type LanguageMode = 'english' | 'punjabi' | 'bilingual';
export type QuestionStatus = 'NOT_VISITED' | 'VISITED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';

export interface QuestionOption {
  en: string;
  pa: string;
}

export interface Question {
  id: string;
  questionEn: string;
  questionPa: string;
  options: QuestionOption[];
  correctAnswer: number; // 0, 1, 2, 3
  solutionEn: string;
  solutionPa: string;
  explanationEn: string;
  explanationPa: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: number; // seconds
  marks: number;
  negativeMarks: number;
  status: 'draft' | 'published';
  createdAt: number;
  tags?: string[];
  pyq?: boolean;
  source?: string;
}

export interface MockTest {
  id: string;
  title: string;
  exam: string;
  category: 'full' | 'sectional' | 'subject' | 'pyq' | 'quiz';
  duration: number; // minutes
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: number;
  accessType: PassTier;
  status: 'draft' | 'published';
  languageMode: LanguageMode;
  createdAt: number;
  updatedAt: number;
  attemptCount: number;
  questionIds?: string[];
  sections?: any[];
}

export interface AttemptAnswer {
  questionId: string;
  selectedOption: number | null; // 0-3
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
  correctCount?: number;
  incorrectCount?: number;
  unattemptedCount?: number;
  percentile?: number;
  rank?: number;
  totalParticipants?: number;
  topicPerformance?: Record<string, { total: number; correct: number }>;
}

export const EXAM_LIST = [
  "PSSSB Clerk", "PSSSB Clerk IT", "PSSSB Clerk Accounts", "PSSSB Excise Inspector", 
  "PSSSB Senior Assistant", "PSSSB Patwari", "PSSSB Lab Attendant", "PSSSB Jail Warder",
  "PSSSB Fireman", "Veterinary Inspector", "Naib Tehsildar", "Steno Typist", "DEO",
  "PSTET Paper 1", "PSTET Paper 2", "CTET Paper 1", "CTET Paper 2", "ETT Cadre",
  "Master Cadre Punjabi", "Master Cadre English", "Master Cadre Math", "Master Cadre Science", "Master Cadre SST",
  "Punjab Police Constable", "Punjab Police SI", "Intelligence Assistant",
  "PSTCL JE Civil", "PSTCL JE Electrical", "PSTCL ALM", "PSTCL Clerk",
  "PSPCL ALM", "PSPCL JE", "PSPCL Revenue Accountant", "PSPCL Clerk",
  "IBPS PO/Clerk", "SBI PO/Clerk", "RBI Assistant",
  "SSC CGL", "SSC CHSL", "SSC MTS", "SSC GD",
  "Railway NTPC", "Railway Group D", "Other..."
];

export const SUBJECT_LIST = [
  "General Knowledge", "Punjab GK", "Child Development & Pedagogy", "Logical Reasoning", 
  "Quantitative Aptitude", "English Language", "Punjabi Language", "Hindi Language",
  "Computer / ICT", "General Science", "EVS", "Social Science", "Teaching Aptitude",
  "Electrical Engineering", "Electrical Machines", "Power Systems", "Transmission & Distribution",
  "Other..."
];
