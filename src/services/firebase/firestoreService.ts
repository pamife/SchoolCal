import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
} from 'firebase/firestore';
import { db } from './firebaseApp';

/**
 * Strips undefined properties recursively because Firestore throws errors on undefined values.
 */
function sanitizeForFirestore<T>(data: T): any {
  if (data === null || data === undefined) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item));
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return data;
}

export async function fetchUserCollection<T extends { id: string }>(
  uid: string,
  collectionName: string
): Promise<T[]> {
  try {
    const colRef = collection(db, 'users', uid, collectionName);
    const q = query(colRef);
    const snap = await getDocs(q);
    const results: T[] = [];
    snap.forEach((docSnap) => {
      results.push(docSnap.data() as T);
    });
    return results;
  } catch (error) {
    console.error(`Error fetching collection ${collectionName} for user ${uid}:`, error);
    return [];
  }
}

export async function fetchUserDoc<T>(
  uid: string,
  collectionName: string,
  docId: string
): Promise<T | null> {
  try {
    const docRef = doc(db, 'users', uid, collectionName, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as T;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching doc ${collectionName}/${docId} for user ${uid}:`, error);
    return null;
  }
}

export async function saveUserDoc<T extends { id: string }>(
  uid: string,
  collectionName: string,
  item: T
): Promise<T> {
  try {
    const docRef = doc(db, 'users', uid, collectionName, item.id);
    const sanitized = sanitizeForFirestore(item);
    await setDoc(docRef, sanitized);
  } catch (error) {
    console.error(`Error saving doc ${collectionName}/${item.id} for user ${uid}:`, error);
  }
  return item;
}

export async function updateUserDoc<T extends { id: string }>(
  uid: string,
  collectionName: string,
  docId: string,
  updates: Partial<T>
): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid, collectionName, docId);
    const sanitized = sanitizeForFirestore(updates);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (error) {
    console.error(`Error updating doc ${collectionName}/${docId} for user ${uid}:`, error);
  }
}

export async function deleteUserDoc(
  uid: string,
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting doc ${collectionName}/${docId} for user ${uid}:`, error);
  }
}

export async function saveAllUserDocs<T extends { id: string }>(
  uid: string,
  collectionName: string,
  items: T[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const item of items) {
      const docRef = doc(db, 'users', uid, collectionName, item.id);
      batch.set(docRef, sanitizeForFirestore(item));
    }
    await batch.commit();
  } catch (error) {
    console.error(`Error batch saving in ${collectionName} for user ${uid}:`, error);
  }
}
