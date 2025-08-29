export interface Translation {
  question: string;
  a: string;
  b: string;
  c: string;
  d: string;
  context: string;
}

export interface Question {
  num: string;
  question: string;
  a: string;
  b: string;
  c: string;
  d: string;
  solution: 'a' | 'b' | 'c' | 'd';
  image?: string;
  category: string;
  context: string;
  id: string;
  translation?: {
    en?: Translation;
    tr?: Translation;
    [key: string]: Translation | undefined;
  };
}

export interface QuestionWithTranslations extends Question {
  translation: {
    en: Translation;
    tr: Translation;
    [key: string]: Translation;
  };
}

export interface Pagination {
  page: number;
  totalPages: number;
  totalQuestions: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QuestionsResponse {
  questions: Question[];
  pagination: Pagination;
  language: Language;
}

export interface CategoryInfo {
  id: string;
  name: string;
  count: number;
}

export interface CategoryResponse {
  questions: Question[];
  category: {
    id: string;
    name: string;
    total: number;
  };
  pagination: Pagination;
  language: Language;
}

export interface CategoriesResponse {
  categories: CategoryInfo[];
  total: number;
  language: Language;
}

export interface StateInfo {
  code: string;
  name: string;
  count: number;
}

export interface StatesResponse {
  states: StateInfo[];
  total: number;
  language: Language;
}

export interface StateResponse {
  questions: Question[];
  state: {
    code: string;
    name: string;
    total: number;
  };
  pagination: Pagination;
  language: Language;
}

export interface FilterState {
  category: string | null;
  state: string | null;
}

export type Language = 'de' | 'en' | 'tr';

export interface AppConfig {
  dataFile: string;
  supportedLanguages: Language[];
  defaultLanguage: Language;
}

// Application Mode
export type AppMode = 'study' | 'test';

// Test Session Types
export interface TestSession {
  id: string;
  state: string;
  questions: Question[];
  answers: Record<string, string>;
  startTime: Date;
  endTime?: Date;
  status: 'setup' | 'active' | 'paused' | 'completed' | 'abandoned';
  currentQuestionIndex: number;
}

// Test Results
export interface TestResult {
  id: string;
  sessionId: string;
  score: number;
  passed: boolean;
  mistakes: Question[];
  correctAnswers: Question[];
  completedAt: Date;
  state: string;
  timeTaken: number;
  categoryBreakdown: CategoryScore[];
}

export interface CategoryScore {
  category: string;
  correct: number;
  total: number;
  accuracy: number;
}

// Test Analytics
export interface TestAnalytics {
  totalTests: number;
  passedTests: number;
  passRate: number;
  averageScore: number;
  bestScore: number;
  weakestCategories: CategoryScore[];
  strongestCategories: CategoryScore[];
  mostMissedQuestions: Question[];
  improvementTrend: number;
}

// Mistake Practice
export interface MistakePracticeSession {
  id: string;
  sourceTestIds: string[];
  questions: Question[];
  type: 'single-test' | 'all-mistakes' | 'category-focused';
  category?: string;
}

// Test Configuration
export interface TestConfig {
  stateCode?: string;
  totalQuestions: 33;
  language: Language;
}

// User Preferences
export interface UserPreferences {
  id: string;
  appMode: AppMode;
  language: Language;
  theme: string;
  lastUsed: Date;
  [key: string]: string | Date | AppMode | Language;
}