import { TestResult, TestSession, TestAnalytics } from '@/types/question';
import { IQueryableRepository, IRepository } from './IRepository';

export interface ITestResultRepository extends IQueryableRepository<TestResult> {
  findByDateRange(startDate: Date, endDate: Date): Promise<TestResult[]>;
  findRecentResults(limit: number): Promise<TestResult[]>;
  findByPassStatus(passed: boolean): Promise<TestResult[]>;
  calculateAnalytics(): Promise<TestAnalytics>;
  findMistakes(): Promise<TestResult[]>;
}

export interface ITestSessionRepository extends IRepository<TestSession> {
  findActiveSession(): Promise<TestSession | null>;
  saveProgress(sessionId: string, answers: Record<string, string>): Promise<void>;
  completeSession(sessionId: string): Promise<void>;
  findIncompleteSession(): Promise<TestSession | null>;
}

export interface UserPreferences {
  id: string;
  appMode: 'study' | 'test';
  language: string;
  theme: string;
  lastUsed: Date;
  [key: string]: string | Date;
}

export interface IUserPreferencesRepository extends IRepository<UserPreferences> {
  findByKey(key: string): Promise<string | null>;
  savePreference(key: string, value: string): Promise<void>;
  getPreferences(): Promise<UserPreferences>;
}