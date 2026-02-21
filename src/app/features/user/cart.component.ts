import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cart">
      <h2>Panier</h2>
      <div *ngIf="items.length; else empty">
        <div *ngFor="let it of items" class="cart-row">
          <div>{{ it.product.name }}</div>
          <div>
            <input type="number" [value]="it.quantity" (change)="changeQty(it.product.id, $any($event.target).value)" min="1">
          </div>
          <div>{{ (it.product.price * it.quantity) | number:'1.2-2' }} TND</div>
          <div><button (click)="remove(it.product.id)">Supprimer</button></div>
        </div>
        <div class="cart-total">Total: {{ total | number:'1.2-2' }} TND</div>
        <div class="actions">
          <button (click)="checkout()">Passer la commande</button>
        </div>
      </div>
      <ng-template #empty>
        <p>Votre panier est vide.</p>
      </ng-template>
    </div>
  `
})
export class CartComponent {
  items: CartItem[] = [];
  total = 0;

  constructor(private cart: CartService, private router: Router) {
    this.items = this.cart.getItems();
    this.computeTotal();
    this.cart.items$.subscribe(items => { this.items = items; this.computeTotal(); });
  }

  computeTotal() {
    this.total = this.items.reduce((s, it) => s + (it.product.price * it.quantity), 0);
  }

  changeQty(productId: number, qty: any) {
    const n = Number(qty) || 1;
    this.cart.update(productId, n);
  }

  remove(productId: number) {
    this.cart.remove(productId);
  }

  checkout() {
    this.router.navigate(['/shop/checkout']);
  }
}
