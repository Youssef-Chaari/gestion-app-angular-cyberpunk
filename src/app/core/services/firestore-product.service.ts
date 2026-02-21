import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, Firestore } from 'firebase/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase || {});
const db: Firestore = getFirestore(firebaseApp);

@Injectable({ providedIn: 'root' })
export class FirestoreProductService {
  private productsCol = collection(db, 'products');

  getProducts(): Observable<any[]> {
    return from(getDocs(this.productsCol)).pipe(
      map(snapshot => snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }

  getProductById(id: string): Observable<any | null> {
    const ref = doc(db, 'products', id);
    return from(getDoc(ref)).pipe(
      map(d => (d.exists() ? { id: d.id, ...d.data() } : null))
    );
  }
}
