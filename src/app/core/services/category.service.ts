import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, setDoc, deleteDoc, Firestore } from 'firebase/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase || {});
const db: Firestore = getFirestore(firebaseApp);

export interface Category {
  id?: string | number;
  name: string;
  description?: string;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categoriesCol = collection(db, 'categories');

  getCategories(): Observable<any[]> {
    return from(getDocs(this.categoriesCol)).pipe(
      map(snapshot => snapshot.docs.map(d => {
        const data = d.data() as any;
        // Exclude id from data since we use the document ID
        const { id, ...categoryData } = data;
        return { id: d.id, ...categoryData };
      }))
    );
  }

  getCategory(id: string | number): Observable<any | null> {
    const ref = doc(db, 'categories', String(id));
    return from(getDoc(ref)).pipe(map(d => {
      if (!d.exists()) return null;
      const data = d.data() as any;
      // Exclude id from data since we use the document ID
      const { id: _, ...categoryData } = data;
      return { id: d.id, ...categoryData };
    }));
  }

  createCategory(category: Category) {
    return from(addDoc(this.categoriesCol, category).then(ref => ref.id));
  }

  updateCategory(id: string | number, category: Partial<Category>) {
    const ref = doc(db, 'categories', String(id));
    return from(setDoc(ref, category, { merge: true }));
  }

  deleteCategory(id: string | number) {
    const ref = doc(db, 'categories', String(id));
    return from(deleteDoc(ref));
  }
}
