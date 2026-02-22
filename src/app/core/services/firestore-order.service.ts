import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, Firestore, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { from, Observable, forkJoin, throwError } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';

const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase || {});
const db: Firestore = getFirestore(firebaseApp);

@Injectable({ providedIn: 'root' })
export class FirestoreOrderService {
  private ordersCol = collection(db, 'orders');
  private productsCol = collection(db, 'products');
  private readonly allowedPaymentMethods = ['card', 'paypal', 'cash'];

  createOrder(orderData: any): Observable<any> {
    const validated = this.sanitizeAndValidateOrder(orderData);
    if ('error' in validated) {
      return throwError(() => new Error(validated.error));
    }

    const payload = validated.payload;
    console.log('Creating order with data:', orderData);
    return from(addDoc(this.ordersCol, payload)).pipe(
      switchMap(ref => {
        console.log('Order created successfully in Firestore with ID:', ref.id);
        // Decrement stock for each item in the order
        const stockUpdates = (payload.items || []).map((item: any) => {
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
    const q = query(this.ordersCol, orderBy('createdAt', 'desc'));
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

  private sanitizeAndValidateOrder(orderData: any): { payload: any } | { error: string } {
    const payload = {
      name: String(orderData?.name || '').trim(),
      email: String(orderData?.email || '').trim().toLowerCase(),
      phone: this.normalizePhone(orderData?.phone),
      address: String(orderData?.address || '').trim(),
      paymentMethod: String(orderData?.paymentMethod || '').trim(),
      deliveryNotes: String(orderData?.deliveryNotes || '').trim(),
      createdAt: String(orderData?.createdAt || '').trim(),
      orderDate: String(orderData?.orderDate || '').trim(),
      userId: String(orderData?.userId || '').trim(),
      items: Array.isArray(orderData?.items) ? orderData.items.map((it: any) => ({
        productId: String(it?.productId || '').trim(),
        productName: String(it?.productName || '').trim(),
        price: Number(it?.price),
        quantity: Number(it?.quantity),
        currentStock: Number(it?.currentStock || 0)
      })) : [],
      totalAmount: Number(orderData?.totalAmount)
    };

    if (!payload.name || payload.name.length < 3 || payload.name.length > 80) {
      return { error: 'Validation commande: nom invalide.' };
    }
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(payload.name)) {
      return { error: 'Validation commande: le nom contient des caracteres invalides.' };
    }

    if (!payload.email || payload.email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return { error: 'Validation commande: email invalide.' };
    }

    if (!/^\+?[0-9]{8,15}$/.test(payload.phone)) {
      return { error: 'Validation commande: telephone invalide.' };
    }

    if (!payload.address) {
      return { error: 'Validation commande: adresse invalide.' };
    }

    if (!this.allowedPaymentMethods.includes(payload.paymentMethod)) {
      return { error: 'Validation commande: methode de paiement invalide.' };
    }

    if (payload.deliveryNotes.length > 500) {
      return { error: 'Validation commande: notes de livraison trop longues.' };
    }

    if (!payload.userId) {
      return { error: 'Validation commande: utilisateur non authentifie.' };
    }

    if (!payload.orderDate || !/^\d{4}-\d{2}-\d{2}$/.test(payload.orderDate)) {
      return { error: 'Validation commande: date de commande invalide.' };
    }

    if (!payload.createdAt) {
      return { error: 'Validation commande: date de creation manquante.' };
    }

    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      return { error: 'Validation commande: le panier est vide.' };
    }

    const invalidItem = payload.items.find((item: any) =>
      !item.productId ||
      !item.productName ||
      !Number.isFinite(item.price) ||
      item.price <= 0 ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99 ||
      !Number.isFinite(item.currentStock) ||
      item.currentStock < 0
    );
    if (invalidItem) {
      return { error: 'Validation commande: un article du panier est invalide.' };
    }

    const recomputedTotal = payload.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    if (!Number.isFinite(payload.totalAmount) || payload.totalAmount <= 0) {
      return { error: 'Validation commande: total invalide.' };
    }
    if (Math.abs(payload.totalAmount - recomputedTotal) > 0.01) {
      return { error: 'Validation commande: incoherence du montant total.' };
    }

    return { payload };
  }

  private normalizePhone(phone: any): string {
    const raw = String(phone || '').trim();
    return raw.startsWith('+')
      ? `+${raw.slice(1).replace(/\D/g, '')}`
      : raw.replace(/\D/g, '');
  }
}
