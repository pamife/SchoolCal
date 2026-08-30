import type { IRepository } from './IRepository';
import {
  fetchUserCollection,
  fetchUserDoc,
  saveUserDoc,
  updateUserDoc,
  deleteUserDoc,
  saveAllUserDocs,
} from '../firebase/firestoreService';

export class FirestoreRepository<T extends { id: string }> implements IRepository<T> {
  private collectionName: string;
  private getUid: () => string | null;

  constructor(collectionName: string, getUid: () => string | null) {
    this.collectionName = collectionName;
    this.getUid = getUid;
  }

  async getAll(): Promise<T[]> {
    const uid = this.getUid();
    if (!uid) return [];
    return fetchUserCollection<T>(uid, this.collectionName);
  }

  async getById(id: string): Promise<T | null> {
    const uid = this.getUid();
    if (!uid) return null;
    return fetchUserDoc<T>(uid, this.collectionName, id);
  }

  async create(item: T): Promise<T> {
    const uid = this.getUid();
    if (!uid) throw new Error('User is not authenticated');
    return saveUserDoc<T>(uid, this.collectionName, item);
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const uid = this.getUid();
    if (!uid) throw new Error('User is not authenticated');
    await updateUserDoc<T>(uid, this.collectionName, id, updates);
    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Item ${id} could not be updated`);
    }
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const uid = this.getUid();
    if (!uid) return false;
    await deleteUserDoc(uid, this.collectionName, id);
    return true;
  }

  async saveAll(items: T[]): Promise<void> {
    const uid = this.getUid();
    if (!uid) throw new Error('User is not authenticated');
    await saveAllUserDocs<T>(uid, this.collectionName, items);
  }
}
