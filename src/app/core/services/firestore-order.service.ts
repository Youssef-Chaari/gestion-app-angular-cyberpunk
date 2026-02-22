import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, Firestore, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { from, Observable, forkJoin } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase || {});
const db: Firestore = getFirestore(firebaseApp);

@Injectable({ providedIn: 'root' })
export class FirestoreOrderService {
  private ordersCol = collection(db, 'orders');
  private productsCol = collection(db, 'products');

  createOrder(orderData: any): Observable<any> {
    return from(addDoc(this.ordersCol, orderData)).pipe(
      switchMap(ref => {
        // Decrement stock for each item in the order
        const stockUpdates = (orderData.items || []).map((item: any) => {
          const productRef = doc(this.productsCol, String(item.productId));
          const currentStock = item.currentStock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          console.log(`Updating stock for product ${item.productId}: ${currentStock} - ${item.quantity} = ${newStock}`);
          return from(updateDoc(productRef, { stock: newStock })).pipe(
            catchError(error => {
              console.error('Failed to update stock for product', item.productId, error);
              // Return empty observable to continue even if stock update fails
              return from(Promise.resolve(null));
            })
          );
        });

        if (stockUpdates.length === 0) {
          return from(Promise.resolve({ id: ref.id }));
        }

        return forkJoin(stockUpdates).pipe(
          map(() => {
            console.log('All stock updates completed for order', ref.id);
            return { id: ref.id };
          }),
          catchError((err) => {
            console.error('Stock update operation failed:', err);
            return from(Promise.resolve({ id: ref.id }));
          })
        );
      })
    );
  }

  getOrdersByUser(userId: string): Observable<any[]> {
    const q = query(this.ordersCol, where('userId', '==', userId), orderBy('orderDate', 'desc'));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })))
    );
  }

  getAllOrders(): Observable<any[]> {
    const q = query(this.ordersCol, orderBy('orderDate', 'desc'));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })))
    );
  }
}
