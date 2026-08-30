export interface IRepository<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(item: T): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  saveAll?(items: T[]): Promise<void>;
}
