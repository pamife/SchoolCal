import type { IRepository } from './IRepository';

export class LocalStorageRepository<T extends { id: string }> implements IRepository<T> {
  private storageKey: string;
  private defaultData: T[];

  constructor(storageKey: string, defaultData: T[] = []) {
    this.storageKey = `schoolcal_${storageKey}`;
    this.defaultData = defaultData;
    this.initialize();
  }

  private initialize(): void {
    const existing = localStorage.getItem(this.storageKey);
    if (!existing) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.defaultData));
    }
  }

  private getItems(): T[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [...this.defaultData];
      return JSON.parse(data) as T[];
    } catch {
      return [...this.defaultData];
    }
  }

  private setItems(items: T[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  async getAll(): Promise<T[]> {
    return this.getItems();
  }

  async getById(id: string): Promise<T | null> {
    const items = this.getItems();
    return items.find(item => item.id === id) || null;
  }

  async create(item: T): Promise<T> {
    const items = this.getItems();
    const existingIndex = items.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      items[existingIndex] = item;
    } else {
      items.push(item);
    }
    this.setItems(items);
    return item;
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const items = this.getItems();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in ${this.storageKey}`);
    }
    const updated = { ...items[index], ...updates };
    items[index] = updated;
    this.setItems(items);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const items = this.getItems();
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length !== items.length) {
      this.setItems(filtered);
      return true;
    }
    return false;
  }

  async saveAll(items: T[]): Promise<void> {
    this.setItems(items);
  }

  resetToDefault(): void {
    this.setItems(this.defaultData);
  }
}
