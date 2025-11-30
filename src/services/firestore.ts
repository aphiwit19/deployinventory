import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export const getAll = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getById = async (collectionName: string, id: string) => {
  const ref = doc(db, collectionName, id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const add = async (collectionName: string, data: any) => {
  const ref = await addDoc(collection(db, collectionName), data);
  return { id: ref.id, ...data };
};

export const update = async (collectionName: string, id: string, data: any) => {
  const ref = doc(db, collectionName, id);
  await updateDoc(ref, data);
  return { id, ...data };
};

export const remove = async (collectionName: string, id: string) => {
  await deleteDoc(doc(db, collectionName, id));
};

export const queryDocs = async (
  collectionName: string,
  field: string,
  op: any,
  value: any,
) => {
  const q = query(collection(db, collectionName), where(field, op, value));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};
