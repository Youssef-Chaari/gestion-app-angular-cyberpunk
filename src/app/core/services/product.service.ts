import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  deleteDoc,
  Firestore
} from 'firebase/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase || {});
const db: Firestore = getFirestore(firebaseApp);

export interface Product {
  id?: string | number;
  name: string;
  price: number;
  categoryId?: string | number;
  category_id?: string | number;
  category_name?: string;
  description?: string;
  created_at?: string;
  stock?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private productsCol = collection(db, 'products');

  getProducts(): Observable<any[]> {
    return from(getDocs(this.productsCol)).pipe(
      map(snapshot => snapshot.docs.map(d => {
        const data = d.data() as any;
        // Exclude id from data since we use the document ID
        const { id, ...productData } = data;
        return { id: d.id, ...productData };
      }))
    );
  }

  getProductsWithCategories(): Observable<{ products: any[], categories: any[] }> {
    const categoriesCol = collection(db, 'categories');
    return from(Promise.all([
      getDocs(this.productsCol),
      getDocs(categoriesCol)
    ])).pipe(
      map(([productsSnap, categoriesSnap]) => {
        const categories = categoriesSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        const categoryMap = new Map(categories.map(c => [String(c.id).toLowerCase(), c.name]));

        const products = productsSnap.docs.map(doc => {
          const data = doc.data() as any;
          // Exclude id from data since we use the document ID
          const { id, ...productData } = data;
          const product = { id: doc.id, ...productData };
          const categoryId = String(product.categoryId || product.category_id || '').toLowerCase();
          const categoryName = categoryMap.get(categoryId);
          product.category_name = categoryName || `Catégorie ${categoryId}`;
          console.log(`Product ${product.name}: categoryId=${categoryId}, found=${!!categoryName}, name=${product.category_name}`);
          return product;
        });

        return { products, categories: categories.map(c => ({ ...c, id: String(c.id) })) };
      })
    );
  }

  getProduct(id: string | number): Observable<any | null> {
    const ref = doc(db, 'products', String(id));
    return from(getDoc(ref)).pipe(map(d => {
      if (!d.exists()) return null;
      const data = d.data() as any;
      // Exclude id from data since we use the document ID
      const { id: _, ...productData } = data;
      return { id: d.id, ...productData };
    }));
  }

  createProduct(product: Product) {
    return from(addDoc(this.productsCol, product).then(ref => ref.id));
  }

  updateProduct(id: string | number, product: Partial<Product>) {
    const ref = doc(db, 'products', String(id));
    return from(setDoc(ref, product, { merge: true }));
  }

  deleteProduct(id: string | number) {
    const ref = doc(db, 'products', String(id));
    return from(deleteDoc(ref));
  }

  getCategories(): Observable<any[]> {
    const categoriesCol = collection(db, 'categories');
    return from(getDocs(categoriesCol)).pipe(
      map(snapshot => snapshot.docs.map(d => {
        const data = d.data() as any;
        // Exclude id from data since we use the document ID
        const { id, ...categoryData } = data;
        return { id: d.id, ...categoryData };
      }))
    );
  }
}
