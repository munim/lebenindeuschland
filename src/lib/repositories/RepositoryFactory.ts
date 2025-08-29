import { ITestResultRepository, ITestSessionRepository, IUserPreferencesRepository } from './interfaces';
import { TestResultRepository, TestSessionRepository, UserPreferencesRepository } from './LocalStorageRepositories';
import { LocalStorageProvider } from '../storage/LocalStorageProvider';

export type StorageType = 'localStorage' | 'database';

export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private storageType: StorageType = 'localStorage';
  private storageProvider: LocalStorageProvider;

  private constructor() {
    this.storageProvider = new LocalStorageProvider({
      prefix: 'lebenindeutschland_',
      errorHandler: (error, operation) => {
        console.error(`Repository error in ${operation}:`, error);
        // Here you could add error reporting, user notifications, etc.
      }
    });
  }

  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  // Future: Allow switching to database storage
  setStorageType(type: StorageType): void {
    this.storageType = type;
  }

  getTestResultRepository(): ITestResultRepository {
    switch (this.storageType) {
      case 'localStorage':
        return new TestResultRepository(this.storageProvider);
      case 'database':
        // TODO: Implement database repository
        throw new Error('Database storage not yet implemented');
      default:
        throw new Error(`Unsupported storage type: ${this.storageType}`);
    }
  }

  getTestSessionRepository(): ITestSessionRepository {
    switch (this.storageType) {
      case 'localStorage':
        return new TestSessionRepository(this.storageProvider);
      case 'database':
        // TODO: Implement database repository
        throw new Error('Database storage not yet implemented');
      default:
        throw new Error(`Unsupported storage type: ${this.storageType}`);
    }
  }

  getUserPreferencesRepository(): IUserPreferencesRepository {
    switch (this.storageType) {
      case 'localStorage':
        return new UserPreferencesRepository(this.storageProvider);
      case 'database':
        // TODO: Implement database repository
        throw new Error('Database storage not yet implemented');
      default:
        throw new Error(`Unsupported storage type: ${this.storageType}`);
    }
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    await this.storageProvider.clear();
  }

  getStorageInfo() {
    return this.storageProvider.getStorageInfo();
  }

  async exportData(): Promise<string> {
    const testResults = await this.getTestResultRepository().findAll();
    const testSessions = await this.getTestSessionRepository().findAll();
    const preferences = await this.getUserPreferencesRepository().getPreferences();

    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      data: {
        testResults,
        testSessions,
        preferences
      }
    }, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    if (!data.data) {
      throw new Error('Invalid export format');
    }

    const testResultRepo = this.getTestResultRepository();
    const testSessionRepo = this.getTestSessionRepository();
    const preferencesRepo = this.getUserPreferencesRepository();

    // Import test results
    if (data.data.testResults) {
      for (const result of data.data.testResults) {
        await testResultRepo.save(result);
      }
    }

    // Import test sessions
    if (data.data.testSessions) {
      for (const session of data.data.testSessions) {
        await testSessionRepo.save(session);
      }
    }

    // Import preferences
    if (data.data.preferences) {
      await preferencesRepo.save(data.data.preferences);
    }
  }
}

// Convenience functions for getting repositories
export const getTestResultRepository = (): ITestResultRepository => {
  return RepositoryFactory.getInstance().getTestResultRepository();
};

export const getTestSessionRepository = (): ITestSessionRepository => {
  return RepositoryFactory.getInstance().getTestSessionRepository();
};

export const getUserPreferencesRepository = (): IUserPreferencesRepository => {
  return RepositoryFactory.getInstance().getUserPreferencesRepository();
};