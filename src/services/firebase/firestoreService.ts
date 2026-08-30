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
  const docRef = doc(db, 'users', uid, collectionName, item.id);
  await setDoc(docRef, item);
  return item;
}

export async function updateUserDoc<T extends { id: string }>(
  uid: string,
  collectionName: string,
  docId: string,
  updates: Partial<T>
): Promise<void> {
  const docRef = doc(db, 'users', uid, collectionName, docId);
  await setDoc(docRef, updates, { merge: true });
}

export async function deleteUserDoc(
  uid: string,
  collectionName: string,
  docId: string
): Promise<void> {
  const docRef = doc(db, 'users', uid, collectionName, docId);
  await deleteDoc(docRef);
}

export async function saveAllUserDocs<T extends { id: string }>(
  uid: string,
  collectionName: string,
  items: T[]
): Promise<void> {
  const batch = writeBatch(db);
  for (const item of items) {
    const docRef = doc(db, 'users', uid, collectionName, item.id);
    batch.set(docRef, item);
  }
  await batch.commit();
}
