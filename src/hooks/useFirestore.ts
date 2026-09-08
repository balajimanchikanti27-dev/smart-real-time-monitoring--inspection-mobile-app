import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  QueryConstraint
} from 'firebase/firestore';
import type { DocumentData, FirestoreError } from 'firebase/firestore';
import { db } from '../firebase/config';

interface UseFirestoreResult<T> {
  data: T | null;
  loading: boolean;
  error: FirestoreError | null;
  empty: boolean;
}

interface UseFirestoreCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: FirestoreError | null;
  empty: boolean;
}

export function useFirestoreCollection<T = DocumentData>(
  collectionName: string,
  queryConstraints: QueryConstraint[] = []
): UseFirestoreCollectionResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, collectionName), ...queryConstraints);
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        
        setData(results);
        setEmpty(results.length === 0);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching collection ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, JSON.stringify(queryConstraints)]); 
  // JSON.stringify helps avoid infinite re-renders if constraints array is recreated

  return { data, loading, error, empty };
}

export function useFirestoreDocument<T = DocumentData>(
  collectionName: string,
  documentId: string | undefined
): UseFirestoreResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, collectionName, documentId),
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching document ${collectionName}/${documentId}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, documentId]);

  return { data, loading, error, empty: !data && !loading };
}
