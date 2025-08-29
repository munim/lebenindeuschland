export interface IRepository<T, K = string> {
  findById(id: K): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  update(id: K, entity: Partial<T>): Promise<T>;
  delete(id: K): Promise<boolean>;
  exists(id: K): Promise<boolean>;
}

export interface IQueryableRepository<T, K = string> extends IRepository<T, K> {
  findBy(criteria: Partial<T>): Promise<T[]>;
  findOne(criteria: Partial<T>): Promise<T | null>;
  count(criteria?: Partial<T>): Promise<number>;
}

export interface ITimestampedEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRepositoryOptions {
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
  maxRetries?: number;
}