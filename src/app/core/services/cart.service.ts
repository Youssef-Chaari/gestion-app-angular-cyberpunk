import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from './product.service';

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
  }

  getItems(): CartItem[] {
    return this.itemsSubject.getValue();
  }

  add(product: Product, quantity = 1) {
    const items = this.getItems();
    const idx = items.findIndex(i => i.product.id === product.id);
    if (idx >= 0) {
      items[idx].quantity += quantity;
    } else {
      items.push({ product, quantity });
    }
    this.writeToStorage(items);
  }

  update(productId: number, quantity: number) {
    const items = this.getItems().map(i => i.product.id === productId ? { ...i, quantity } : i).filter(i => i.quantity > 0);
    this.writeToStorage(items);
  }

  remove(productId: number) {
    const items = this.getItems().filter(i => i.product.id !== productId);
    this.writeToStorage(items);
  }

  clear() {
    this.writeToStorage([]);
  }
}
