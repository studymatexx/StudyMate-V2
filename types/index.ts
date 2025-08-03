// Core Data Models for StudyMate App

export interface User {
  id: string;
  email: string;
  name: string;
  preferredLanguage: 'en' | 'tr';
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  userId: string;
  name: string;
  code?: string;
  color: string;
  type: 'theoretical' | 'practical';
  credits?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyTask {
  id: string;
  courseId: string;
  userId: string;
  type: 'studied' | 'reviewed' | 'notes_taken' | 'quiz_solved' | 'extra_resource_read';
  completed: boolean;
  date: Date;
  notes?: string;
  timeSpent?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  userId: string;
  courseId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  location?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GPAGoal {
  id: string;
  userId: string;
  targetGPA: number;
  currentGPA: number;
  calculationType: 'university' | 'preuni';
  targetDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Grade {
  id: string;
  userId: string;
  courseId: string;
  type: 'midterm' | 'final' | 'assignment' | 'quiz' | 'term1' | 'term2';
  score: number;
  maxScore: number;
  weight: number; // percentage weight in final grade
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Todo {
  id: string;
  userId: string;
  courseId?: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  estimatedTime?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface FocusSession {
  id: string;
  userId: string;
  courseId?: string;
  startTime: Date;
  endTime?: Date;
  plannedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  wasCompleted: boolean;
  notes?: string;
  problemsSolved?: number;
  createdAt: Date;
}

export interface ProblemSolution {
  id: string;
  userId: string;
  focusSessionId?: string;
  imageUrl: string;
  question: string;
  solution: string;
  steps: SolutionStep[];
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isCorrect?: boolean;
  feedback?: string;
  createdAt: Date;
}

export interface SolutionStep {
  stepNumber: number;
  description: string;
  equation?: string;
  result: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in minutes
  questions: QuizQuestion[];
  isPublic: boolean;
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  maxScore: number;
  accuracy: number; // percentage
  responses: QuizResponse[];
  timeSpent: number; // in seconds
  isCompleted: boolean;
  createdAt: Date;
}

export interface QuizResponse {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  points: number;
}

export interface StudyStatistics {
  id: string;
  userId: string;
  date: Date;
  totalStudyTime: number; // in minutes
  focusSessions: number;
  tasksCompleted: number;
  quizzesTaken: number;
  avgQuizScore: number;
  subjectBreakdown: SubjectStats[];
  createdAt: Date;
}

export interface SubjectStats {
  subject: string;
  timeSpent: number; // in minutes
  sessionsCount: number;
  avgScore: number;
  tasksCompleted: number;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface GPTRequest {
  imageBase64?: string;
  question?: string;
  subject?: string;
  previousAttempts?: string[];
  userContext?: {
    currentCourse?: string;
    difficulty?: string;
    language: 'en' | 'tr';
  };
}

export interface GPTResponse {
  solution: string;
  steps: SolutionStep[];
  explanation: string;
  confidence: number; // 0-1
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  alternativeSolutions?: string[];
  commonMistakes?: string[];
  relatedTopics?: string[];
}

// UI State Types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  language: 'en' | 'tr';
  currentTheme: 'light' | 'dark';
  isLoading: boolean;
  error: string | null;
}

export interface StudyPlanState {
  courses: Course[];
  tasks: StudyTask[];
  selectedDate: Date;
  isLoading: boolean;
  error: string | null;
}

export interface FocusState {
  isActive: boolean;
  timeLeft: number;
  selectedDuration: number;
  isLocked: boolean;
  currentSession: FocusSession | null;
}

export interface QuizState {
  currentQuiz: Quiz | null;
  currentQuestion: number;
  selectedAnswers: Record<string, number>;
  timeLeft: number;
  isCompleted: boolean;
  results: QuizAttempt | null;
}