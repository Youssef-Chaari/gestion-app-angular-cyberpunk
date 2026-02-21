import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, addDoc, Firestore } from 'firebase/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase || {});
const db: Firestore = getFirestore(firebaseApp);

@Injectable({ providedIn: 'root' })
export class FirestoreCartService {
  private cartsCol = collection(db, 'carts');

  getCart(userId: string): Observable<any | null> {
    const ref = doc(db, 'carts', userId);
    return from(getDoc(ref)).pipe(
      map(d => (d.exists() ? { id: d.id, ...d.data() } : null))
    );
  }

  async updateCart(userId: string, cartData: any): Promise<void> {
    const ref = doc(db, 'carts', userId);
    await setDoc(ref, cartData, { merge: true });
  }
}
