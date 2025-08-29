import { TestResult, TestSession, TestAnalytics, CategoryScore, Question } from '@/types/question';
import { ITestResultRepository, ITestSessionRepository, UserPreferences, IUserPreferencesRepository } from './interfaces';
import { LocalStorageProvider } from '../storage/LocalStorageProvider';

// Base repository class using LocalStorage
abstract class BaseLocalStorageRepository<T extends { id: string }> {
  protected storage: LocalStorageProvider;
  protected collectionKey: string;

  constructor(collectionKey: string, storage?: LocalStorageProvider) {
    this.collectionKey = collectionKey;
    this.storage = storage || new LocalStorageProvider();
  }

  async findById(id: string): Promise<T | null> {
    const collection = await this.getCollection();
    return collection.find(item => item.id === id) || null;
  }

  async findAll(): Promise<T[]> {
    return await this.getCollection();
  }

  async save(entity: T): Promise<T> {
    const collection = await this.getCollection();
    const existingIndex = collection.findIndex(item => item.id === entity.id);
    
    if (existingIndex >= 0) {
      collection[existingIndex] = entity;
    } else {
      collection.push(entity);
    }
    
    await this.saveCollection(collection);
    return entity;
  }

  async update(id: string, entity: Partial<T>): Promise<T> {
    const collection = await this.getCollection();
    const existingIndex = collection.findIndex(item => item.id === id);
    
    if (existingIndex < 0) {
      throw new Error(`Entity with id ${id} not found`);
    }
    
    const updated = { ...collection[existingIndex], ...entity };
    collection[existingIndex] = updated;
    
    await this.saveCollection(collection);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const initialLength = collection.length;
    const filtered = collection.filter(item => item.id !== id);
    
    if (filtered.length === initialLength) {
      return false; // Nothing was deleted
    }
    
    await this.saveCollection(filtered);
    return true;
  }

  async exists(id: string): Promise<boolean> {
    const item = await this.findById(id);
    return item !== null;
  }

  async findBy(criteria: Partial<T>): Promise<T[]> {
    const collection = await this.getCollection();
    return collection.filter(item => {
      return Object.entries(criteria).every(([key, value]) => {
        const itemValue = (item as Record<string, unknown>)[key];
        return itemValue === value;
      });
    });
  }

  async findOne(criteria: Partial<T>): Promise<T | null> {
    const results = await this.findBy(criteria);
    return results.length > 0 ? results[0] : null;
  }

  async count(criteria?: Partial<T>): Promise<number> {
    if (criteria) {
      const results = await this.findBy(criteria);
      return results.length;
    }
    const collection = await this.getCollection();
    return collection.length;
  }

  protected async getCollection(): Promise<T[]> {
    const data = await this.storage.getObject<T[]>(this.collectionKey);
    return data || [];
  }

  protected async saveCollection(collection: T[]): Promise<void> {
    await this.storage.setObject(this.collectionKey, collection);
  }
}

// Test Result Repository Implementation
export class TestResultRepository extends BaseLocalStorageRepository<TestResult> implements ITestResultRepository {
  constructor(storage?: LocalStorageProvider) {
    super('test_results', storage);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<TestResult[]> {
    const collection = await this.getCollection();
    return collection.filter(result => {
      const completedAt = new Date(result.completedAt);
      return completedAt >= startDate && completedAt <= endDate;
    });
  }

  async findRecentResults(limit: number): Promise<TestResult[]> {
    const collection = await this.getCollection();
    return collection
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, limit);
  }

  async findByPassStatus(passed: boolean): Promise<TestResult[]> {
    return await this.findBy({ passed } as Partial<TestResult>);
  }

  async findMistakes(): Promise<TestResult[]> {
    const collection = await this.getCollection();
    return collection.filter(result => result.mistakes.length > 0);
  }

  async calculateAnalytics(): Promise<TestAnalytics> {
    const allResults = await this.getCollection();
    
    if (allResults.length === 0) {
      return {
        totalTests: 0,
        passedTests: 0,
        passRate: 0,
        averageScore: 0,
        bestScore: 0,
        weakestCategories: [],
        strongestCategories: [],
        mostMissedQuestions: [],
        improvementTrend: 0
      };
    }

    const totalTests = allResults.length;
    const passedTests = allResults.filter(r => r.passed).length;
    const passRate = Math.round((passedTests / totalTests) * 100);
    
    const scores = allResults.map(r => r.score);
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const bestScore = Math.max(...scores);

    // Calculate category performance
    const categoryStats = new Map<string, { correct: number; total: number }>();
    
    allResults.forEach(result => {
      result.categoryBreakdown.forEach(category => {
        if (!categoryStats.has(category.category)) {
          categoryStats.set(category.category, { correct: 0, total: 0 });
        }
        const stats = categoryStats.get(category.category)!;
        stats.correct += category.correct;
        stats.total += category.total;
      });
    });

    const categoryScores: CategoryScore[] = Array.from(categoryStats.entries()).map(([category, stats]) => ({
      category,
      correct: stats.correct,
      total: stats.total,
      accuracy: Math.round((stats.correct / stats.total) * 100)
    }));

    const sortedByAccuracy = [...categoryScores].sort((a, b) => a.accuracy - b.accuracy);
    const weakestCategories = sortedByAccuracy.slice(0, 3);
    const strongestCategories = sortedByAccuracy.slice(-3).reverse();

    // Calculate improvement trend (last 5 vs previous 5)
    const sortedResults = allResults.sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
    let improvementTrend = 0;
    
    if (sortedResults.length >= 10) {
      const recent5 = sortedResults.slice(-5);
      const previous5 = sortedResults.slice(-10, -5);
      
      const recentAvg = recent5.reduce((sum, r) => sum + r.score, 0) / 5;
      const previousAvg = previous5.reduce((sum, r) => sum + r.score, 0) / 5;
      
      improvementTrend = recentAvg - previousAvg;
    }

    // Most missed questions (aggregate across all tests)
    const questionMissCount = new Map<string, { question: Question; count: number }>();
    allResults.forEach(result => {
      result.mistakes.forEach(mistake => {
        if (!questionMissCount.has(mistake.id)) {
          questionMissCount.set(mistake.id, { question: mistake, count: 0 });
        }
        questionMissCount.get(mistake.id)!.count++;
      });
    });

    const mostMissedQuestions = Array.from(questionMissCount.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(item => item.question);

    return {
      totalTests,
      passedTests,
      passRate,
      averageScore,
      bestScore,
      weakestCategories,
      strongestCategories,
      mostMissedQuestions,
      improvementTrend
    };
  }
}

// Test Session Repository Implementation
export class TestSessionRepository extends BaseLocalStorageRepository<TestSession> implements ITestSessionRepository {
  constructor(storage?: LocalStorageProvider) {
    super('test_sessions', storage);
  }

  async findActiveSession(): Promise<TestSession | null> {
    return await this.findOne({ status: 'active' } as Partial<TestSession>);
  }

  async findIncompleteSession(): Promise<TestSession | null> {
    const sessions = await this.findBy({ status: 'active' } as Partial<TestSession>);
    return sessions.length > 0 ? sessions[0] : null;
  }

  async saveProgress(sessionId: string, answers: Record<string, string>): Promise<void> {
    await this.update(sessionId, { answers });
  }

  async completeSession(sessionId: string): Promise<void> {
    await this.update(sessionId, { 
      status: 'completed' as const, 
      endTime: new Date() 
    });
  }
}

// User Preferences Repository Implementation
export class UserPreferencesRepository extends BaseLocalStorageRepository<UserPreferences> implements IUserPreferencesRepository {
  private static readonly DEFAULT_ID = 'default_user_preferences';

  constructor(storage?: LocalStorageProvider) {
    super('user_preferences', storage);
  }

  async findByKey(key: string): Promise<string | null> {
    const preferences = await this.getPreferences();
    const value = preferences[key];
    if (typeof value === 'string') {
      return value;
    } else if (value instanceof Date) {
      return value.toISOString();
    }
    return null;
  }

  async savePreference(key: string, value: string): Promise<void> {
    const preferences = await this.getPreferences();
    preferences[key] = value;
    preferences.lastUsed = new Date();
    await this.save(preferences);
  }

  async getPreferences(): Promise<UserPreferences> {
    const existing = await this.findById(UserPreferencesRepository.DEFAULT_ID);
    if (existing) {
      return existing;
    }

    // Create default preferences
    const defaultPreferences: UserPreferences = {
      id: UserPreferencesRepository.DEFAULT_ID,
      appMode: 'study',
      language: 'de',
      theme: 'light',
      lastUsed: new Date()
    };

    await this.save(defaultPreferences);
    return defaultPreferences;
  }
}