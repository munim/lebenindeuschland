export interface IStorageProvider {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

export interface IAsyncStorageProvider extends IStorageProvider {
  transaction<T>(callback: () => Promise<T>): Promise<T>;
  batch(operations: Array<{
    type: 'set' | 'remove';
    key: string;
    value?: string;
  }>): Promise<void>;
}

export interface StorageOptions {
  prefix?: string;
  serializer?: {
    serialize: (value: unknown) => string;
    deserialize: (value: string) => unknown;
  };
  errorHandler?: (error: Error, operation: string) => void;
}

export class StorageError extends Error {
  constructor(message: string, public readonly operation: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}