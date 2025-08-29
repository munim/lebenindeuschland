import { IStorageProvider, StorageOptions, StorageError } from './IStorageProvider';

export class LocalStorageProvider implements IStorageProvider {
  private readonly prefix: string;
  private readonly serializer: { serialize: (value: unknown) => string; deserialize: (value: string) => unknown };
  private readonly errorHandler: (error: Error, operation: string) => void;

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || 'lebenindeutschland_';
    this.serializer = options.serializer || {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    };
    this.errorHandler = options.errorHandler || ((error, operation) => {
      console.error(`LocalStorageProvider ${operation} error:`, error);
    });

    // Check for localStorage availability
    this.checkAvailability();
  }

  private checkAvailability(): void {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (error) {
      throw new StorageError('localStorage is not available', 'initialization', error as Error);
    }
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const fullKey = this.getFullKey(key);
      const value = localStorage.getItem(fullKey);
      return value;
    } catch (error) {
      this.errorHandler(error as Error, 'getItem');
      throw new StorageError(`Failed to get item with key: ${key}`, 'getItem', error as Error);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      localStorage.setItem(fullKey, value);
    } catch (error) {
      this.errorHandler(error as Error, 'setItem');
      throw new StorageError(`Failed to set item with key: ${key}`, 'setItem', error as Error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
    } catch (error) {
      this.errorHandler(error as Error, 'removeItem');
      throw new StorageError(`Failed to remove item with key: ${key}`, 'removeItem', error as Error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.getAllKeys();
      for (const key of keys) {
        await this.removeItem(key);
      }
    } catch (error) {
      this.errorHandler(error as Error, 'clear');
      throw new StorageError('Failed to clear storage', 'clear', error as Error);
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
      return keys;
    } catch (error) {
      this.errorHandler(error as Error, 'getAllKeys');
      throw new StorageError('Failed to get all keys', 'getAllKeys', error as Error);
    }
  }

  // Helper methods for object storage
  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.getItem(key);
    if (value === null) return null;
    
    try {
      return this.serializer.deserialize(value) as T;
    } catch (error) {
      this.errorHandler(error as Error, 'getObject');
      throw new StorageError(`Failed to deserialize object with key: ${key}`, 'getObject', error as Error);
    }
  }

  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      const serializedValue = this.serializer.serialize(value);
      await this.setItem(key, serializedValue);
    } catch (error) {
      this.errorHandler(error as Error, 'setObject');
      throw new StorageError(`Failed to serialize and set object with key: ${key}`, 'setObject', error as Error);
    }
  }

  // Storage usage information
  getStorageInfo(): { used: number; available: number; total: number } {
    let used = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          used += key.length + (localStorage.getItem(key)?.length || 0);
        }
      }
      
      // Approximate localStorage limit (usually 5-10MB)
      const total = 5 * 1024 * 1024; // 5MB
      const available = total - used;
      
      return { used, available, total };
    } catch {
      return { used: 0, available: 0, total: 0 };
    }
  }
}