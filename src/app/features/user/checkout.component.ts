import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { FormsModule } from '@angular/forms';
import { FirestoreOrderService } from '../../core/services/firestore-order.service';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import { forkJoin } from 'rxjs';

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

  constructor(private cart: CartService, private router: Router, private orders: FirestoreOrderService, private auth: AuthService, private productService: ProductService) {}

  placeOrder() {
    const items = this.cart.getItems();
    if (!items.length) {
      alert('Panier vide');
      return;
    }

    // Fetch current stock from Firestore for each product
    const productObservables = items.map(item => this.productService.getProduct(item.product.id));
    forkJoin(productObservables).subscribe(currentProducts => {
      // Check stock availability
      const insufficientStock = items.some((it, index) => it.quantity > (currentProducts[index]?.stock || 0));
      if (insufficientStock) {
        alert('Stock insuffisant pour un ou plusieurs produits. Veuillez ajuster les quantités.');
        return;
      }

      const now = new Date();
      const order = {
        name: this.name,
        address: this.address,
        items: items.map((it: any, index: number) => ({
          ...it,
          currentStock: currentProducts[index]?.stock || 0
        })),
        totalAmount: items.reduce((s: any, it: any) => s + it.product.price * it.quantity, 0),
        createdAt: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ' at ' + now.toTimeString().split(' ')[0] + ' UTC+' + (now.getTimezoneOffset() === 0 ? '0' : Math.abs(now.getTimezoneOffset() / 60)),
        orderDate: now.toISOString().split('T')[0],
        userId: (this.auth.getCurrentUser() as any)?.uid || null
      };

      // create order in Firestore, fallback to localStorage
      this.orders.createOrder(order).subscribe({
        next: (res: any) => {
          this.cart.clear();
          alert('Commande créée (id: ' + (res?.id || 'n/a') + ')');
          this.router.navigate(['/shop/profile']);
        },
        error: (err: any) => {
          console.error('Order create failed, saving locally', err);
          const ordersRaw = localStorage.getItem('app_orders');
          const orders = ordersRaw ? JSON.parse(ordersRaw) : [];
          orders.push(Object.assign({ id: Date.now() }, order));
          localStorage.setItem('app_orders', JSON.stringify(orders));
          this.cart.clear();
          alert('Commande créée (enregistrée localement)');
          this.router.navigate(['/shop/profile']);
        }
      });
    });
  }
}
