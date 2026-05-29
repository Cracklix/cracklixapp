/**
 * CRACKLIX Global Type Definitions
 * Enterprise Architecture Layer v50.0 (Institutional Standard)
 */

export type UserRole = 'student' | 'admin' | 'superadmin' | 'creator';
export type PassTier = 'free' | 'pass_plus' | 'premium' | 'elite';
export type LanguageMode = 'english' | 'punjabi' | 'hindi' | 'en_pa' | 'en_hi' | 'pa_hi' | 'trilingual';
export type QuestionStatus = 'NOT_VISITED' | 'VISITED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';

export interface QuestionOption {
  en?: string;
  pa?: string;
  hi?: string;
}

export interface Question {
  id: string;
  questionEn?: string;
  questionPa?: string;
  questionHi?: string;
  options: QuestionOption[];
  correctAnswer: number; // 0, 1, 2, 3
  explanationEn?: string;
  explanationPa?: string;
  explanationHi?: string;
  subject: string;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  negativeMarks: number;
  status: 'draft' | 'published';
  createdAt: number;
  order?: number;
}

export interface MockTest {
  id: string;
  title: string;
  exam: string;
  category: 'full' | 'sectional' | 'subject' | 'pyq' | 'quiz';
  duration: number; // total minutes
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: number;
  marksPerQuestion: number;
  accessType: PassTier;
  status: 'draft' | 'published';
  languageMode: LanguageMode;
  createdAt: number;
  updatedAt: number;
  attemptCount: number;
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
  // PSSSB
  "PSSSB Clerk (General)",
  "PSSSB Clerk IT",
  "PSSSB Clerk Accounts",
  "PSSSB Excise Inspector",
  "PSSSB Senior Assistant",
  "PSSSB Patwari",
  "PSSSB Lab Attendant",
  "PSSSB Jail Warder",
  "PSSSB Fireman",
  "PSSSB Veterinary Inspector",
  "PSSSB Naib Tehsildar",
  "PSSSB Steno Typist",
  "PSSSB Data Entry Operator",
  // POLICE
  "Punjab Police SI",
  "Punjab Police Constable",
  "Punjab Police Intelligence Assistant",
  // EDUCATION
  "PSTET Paper 1",
  "PSTET Paper 2",
  "CTET Paper 1",
  "CTET Paper 2",
  "ETT Cadre",
  "Master Cadre (Punjabi)",
  "Master Cadre (English)",
  "Master Cadre (Math/Science)",
  "Lecturer Cadre",
  // ELECTRICAL
  "PSTCL JE Civil",
  "PSTCL JE Electrical",
  "PSTCL ALM",
  "PSTCL Clerk",
  "PSPCL Assistant Lineman",
  "PSPCL JE",
  "PSPCL Revenue Accountant",
  "PSPCL Clerk",
  // NATIONAL
  "SSC CGL",
  "SSC CHSL",
  "SSC MTS",
  "SSC GD",
  "Railway NTPC",
  "Railway Group D",
  "Banking IBPS",
  "Banking SBI",
  "State PCS (PPSC)",
  "CUSTOM"
];

export const SUBJECT_LIST = [
  "Punjab GK & History",
  "Quantitative Aptitude",
  "Reasoning Ability",
  "English Language",
  "Punjabi Language (Part A)",
  "Punjabi Grammar (Part B)",
  "Computer/ICT",
  "General Awareness",
  "Current Affairs",
  "Child Development & Pedagogy",
  "Agriculture",
  "Electrical Engineering",
  "Electrical Machines",
  "Power Systems",
  "Transmission & Distribution",
  "Sikh History",
  "Teaching Aptitude",
  "Environmental Studies",
  "Mathematics",
  "Science",
  "Social Science",
  "Pedagogy",
  "SST",
  "Other..."
];

export const EXAM_CONFIG: Record<string, string[]> = {
  "PSSSB Clerk (General)": ["Punjabi Language (Part A)", "General Awareness", "Reasoning Ability", "Quantitative Aptitude", "Computer/ICT", "English Language", "Punjabi Grammar (Part B)"],
  "Punjab Police SI": ["General Awareness", "Quantitative Aptitude", "Reasoning Ability", "English Language", "Punjabi Language", "Computer/ICT"],
  "PSTCL JE Electrical": ["Electrical Engineering", "General Awareness", "Reasoning Ability", "Punjabi Language (Part A)"],
  "PSTET Paper 1": ["Child Development & Pedagogy", "Punjabi Language (Part A)", "English Language", "Mathematics", "Environmental Studies"],
  "PSTET Paper 2": ["Child Development & Pedagogy", "Punjabi Language (Part A)", "English Language", "Science", "Social Science"],
  "Master Cadre (Punjabi)": ["Punjabi Language (Part A)", "Pedagogy"],
  "CUSTOM": SUBJECT_LIST
};
