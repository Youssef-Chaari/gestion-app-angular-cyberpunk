import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="checkout">
      <h2>Checkout</h2>
      <form (ngSubmit)="placeOrder()">
        <div>
          <label>Nom</label>
          <input [(ngModel)]="name" name="name" required>
        </div>
        <div>
          <label>Adresse</label>
          <textarea [(ngModel)]="address" name="address" required></textarea>
        </div>
        <div>
          <button type="submit">Confirmer</button>
        </div>
      </form>
    </div>
  `
})
export class CheckoutComponent {
  name = '';
  address = '';

  constructor(private cart: CartService, private router: Router) {}

  placeOrder() {
    const items = this.cart.getItems();
    if (!items.length) {
      alert('Panier vide');
      return;
    }
    const ordersRaw = localStorage.getItem('app_orders');
    const orders = ordersRaw ? JSON.parse(ordersRaw) : [];
    const order = {
      id: Date.now(),
      name: this.name,
      address: this.address,
      items,
      total: items.reduce((s:any, it:any)=> s + it.product.price * it.quantity, 0),
      created_at: new Date().toISOString()
    };
    orders.push(order);
    localStorage.setItem('app_orders', JSON.stringify(orders));
    this.cart.clear();
    alert('Commande créée');
    this.router.navigate(['/shop/profile']);
  }
}
