import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Product } from './product.service';
import { FirestoreCartService } from './firestore-cart.service';
import { AuthService } from './auth.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storageKey = 'app_cart';
  private itemsSubject = new BehaviorSubject<CartItem[]>(this.readFromStorage());
  items$ = this.itemsSubject.asObservable();
  private authSub: Subscription | null = null;
  private currentUserId: string | null = null;

  constructor(private firestoreCart: FirestoreCartService, private auth: AuthService) {
    this.authSub = this.auth.currentUser$.subscribe(user => {
      if (user && (user as any).uid) {
        this.currentUserId = (user as any).uid;
        this.firestoreCart.getCart(this.currentUserId).subscribe(remote => {
          if (remote && remote.items) {
            const local = this.readFromStorage();
            const map = new Map<string, CartItem>();
            for (const it of local) map.set(String(it.product.id), it);
            for (const it of remote.items) map.set(String(it.product.id), it);
            const merged = Array.from(map.values());
            this.writeToStorage(merged);
          } else {
            const local = this.readFromStorage();
            if (local.length) this.firestoreCart.updateCart(this.currentUserId!, { items: local }).catch(() => {});
          }
        });
      } else {
        this.currentUserId = null;
      }
    });
  }

  private readFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private writeToStorage(items: CartItem[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch {}
    this.itemsSubject.next(items);
    if (this.currentUserId) {
      this.firestoreCart.updateCart(this.currentUserId, { items }).catch(() => {});
    }
  }

  getItems(): CartItem[] {
    return this.itemsSubject.getValue();
  }

  add(product: Product, quantity = 1) {
    const items = this.getItems();
    const idx = items.findIndex(i => String(i.product.id) === String(product.id));
    if (idx >= 0) {
      items[idx].quantity += quantity;
    } else {
      items.push({ product, quantity });
    }
    this.writeToStorage(items);
  }

  update(productId: string | number, quantity: number) {
    const items = this.getItems().map(i => String(i.product.id) === String(productId) ? { ...i, quantity } : i).filter(i => i.quantity > 0);
    this.writeToStorage(items);
  }

  remove(productId: string | number) {
    const items = this.getItems().filter(i => String(i.product.id) !== String(productId));
    this.writeToStorage(items);
  }

  clear() {
    this.writeToStorage([]);
  }
}
