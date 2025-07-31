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

export type Language = 'de' | 'en' | 'tr';

export interface AppConfig {
  dataFile: string;
  supportedLanguages: Language[];
  defaultLanguage: Language;
}