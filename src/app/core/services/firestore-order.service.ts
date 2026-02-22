import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, Firestore, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { from, Observable, forkJoin } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';

const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase || {});
const db: Firestore = getFirestore(firebaseApp);

@Injectable({ providedIn: 'root' })
export class FirestoreOrderService {
  private ordersCol = collection(db, 'orders');
  private productsCol = collection(db, 'products');

  createOrder(orderData: any): Observable<any> {
    console.log('Creating order with data:', orderData);
    return from(addDoc(this.ordersCol, orderData)).pipe(
      switchMap(ref => {
        console.log('Order created successfully in Firestore with ID:', ref.id);
        // Decrement stock for each item in the order
        const stockUpdates = (orderData.items || []).map((item: any) => {
          const productRef = doc(this.productsCol, String(item.productId));
          const currentStock = item.currentStock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          console.log(`Updating stock for product ${item.productId}: ${currentStock} - ${item.quantity} = ${newStock}`);
          return from(updateDoc(productRef, { stock: newStock })).pipe(
            tap(() => {
              console.log(`✓ Stock updated successfully for product ${item.productId}`);
            }),
            catchError(error => {
              console.error('✗ Failed to update stock for product', item.productId, ':', error.message || error);
              // Still throw to alert that stock update failed
              throw error;
            })
          );
        });

        if (stockUpdates.length === 0) {
          console.log('No items to update stock for');
          return from(Promise.resolve({ id: ref.id }));
        }

        return forkJoin(stockUpdates).pipe(
          map(() => {
            console.log('✓ All stock updates completed for order', ref.id);
            return { id: ref.id };
          }),
          catchError((err) => {
            console.error('✗ Stock update failed for order', ref.id, ':', err);
            // Still return success for order creation, but log the stock failure
            return from(Promise.resolve({ id: ref.id, stockUpdateFailed: true }));
          })
        );
      }),
      catchError(error => {
        console.error('✗ Failed to create order in Firestore:', error.message || error);
        throw error;
      })
    );
  }

  getOrdersByUser(userId: string): Observable<any[]> {
    console.log('Querying orders for userId:', userId);
    const q = query(this.ordersCol, where('userId', '==', userId), orderBy('orderDate', 'desc'));
    return from(getDocs(q)).pipe(
      tap(snapshot => {
        console.log(`Found ${snapshot.docs.length} orders for userId ${userId}`);
        snapshot.docs.forEach(doc => {
          console.log('Order:', doc.id, doc.data());
        });
      }),
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }))),
      catchError(error => {
        console.error('Error querying orders for userId', userId, error);
        throw error;
      })
    );
  }

  getAllOrders(): Observable<any[]> {
    console.log('Querying all orders');
    const q = query(this.ordersCol, orderBy('orderDate', 'desc'));
    return from(getDocs(q)).pipe(
      tap(snapshot => {
        console.log(`Found ${snapshot.docs.length} total orders`);
        snapshot.docs.forEach(doc => {
          const data = doc.data() as any;
          console.log('Order ID:', data.userId, 'Doc:', doc.id, 'Data:', data);
        });
      }),
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }))),
      catchError(error => {
        console.error('Error querying all orders', error);
        throw error;
      })
    );
  }
}
