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
  translation: {
    en: Translation;
    tr: Translation;
    [key: string]: Translation;
  };
  category: string;
  context: string;
  id: string;
}

export type Language = 'de' | 'en' | 'tr';

export interface AppConfig {
  dataFile: string;
  supportedLanguages: Language[];
  defaultLanguage: Language;
}