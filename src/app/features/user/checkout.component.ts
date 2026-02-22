import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { FormsModule } from '@angular/forms';
import { FirestoreOrderService } from '../../core/services/firestore-order.service';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import { PopupService } from '../../shared/components/popup/popup.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="checkout">
      <h2>Checkout</h2>
      <form (ngSubmit)="placeOrder()">
        <div class="form-group">
          <label>Nom complet</label>
          <input [(ngModel)]="name" name="name" required placeholder="Votre nom complet">
        </div>
        <div class="form-group">
          <label>Email</label>
          <input [(ngModel)]="email" name="email" type="email" required placeholder="votre.email@example.com">
        </div>
        <div class="form-group">
          <label>Téléphone</label>
          <input [(ngModel)]="phone" name="phone" required placeholder="+33 6 XX XX XX XX">
        </div>
        <div class="form-group">
          <label>Adresse de livraison</label>
          <textarea [(ngModel)]="address" name="address" required placeholder="Votre adresse complète"></textarea>
        </div>
        <div class="form-group">
          <label>Méthode de paiement</label>
          <select [(ngModel)]="paymentMethod" name="paymentMethod">
            <option value="card">Carte bancaire</option>
            <option value="paypal">PayPal</option>
            <option value="cash">Paiement à la livraison</option>
          </select>
        </div>
        <div class="form-group">
          <label>Notes de livraison (optionnel)</label>
          <textarea [(ngModel)]="deliveryNotes" name="deliveryNotes" placeholder="Instructions spéciales pour la livraison"></textarea>
        </div>
        <div class="form-actions">
          <button type="submit" class="cyber-btn">Confirmer la commande</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .checkout {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
      border: 2px solid #00d4ff;
      border-radius: 15px;
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
      animation: glow 2s ease-in-out infinite alternate;
    }

    @keyframes glow {
      from { box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
      to { box-shadow: 0 0 30px rgba(0, 212, 255, 0.6); }
    }

    h2 {
      color: #00d4ff;
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 2rem;
      text-shadow: 0 0 10px #00d4ff;
      font-family: 'Courier New', monospace;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      color: #ff0080;
      font-weight: bold;
      margin-bottom: 0.5rem;
      font-family: 'Courier New', monospace;
      text-shadow: 0 0 5px #ff0080;
    }

    input, textarea, select {
      width: 100%;
      padding: 0.8rem;
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid #00d4ff;
      border-radius: 8px;
      color: #ffffff;
      font-size: 1rem;
      font-family: 'Courier New', monospace;
      transition: all 0.3s ease;
    }

    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: #ff0080;
      box-shadow: 0 0 10px rgba(255, 0, 128, 0.5);
    }

    input::placeholder, textarea::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    select {
      cursor: pointer;
    }

    .form-actions {
      text-align: center;
      margin-top: 2rem;
    }

    .cyber-btn {
      background: linear-gradient(45deg, #00d4ff, #ff0080);
      border: none;
      padding: 1rem 2rem;
      font-size: 1.2rem;
      font-weight: bold;
      color: #ffffff;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Courier New', monospace;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
    }

    .cyber-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 25px rgba(0, 212, 255, 0.8);
      background: linear-gradient(45deg, #ff0080, #00d4ff);
    }

    .cyber-btn:active {
      transform: translateY(0);
    }

    @media (max-width: 768px) {
      .checkout {
        margin: 1rem;
        padding: 1rem;
      }

      h2 {
        font-size: 2rem;
      }
    }
  `]
})
export class CheckoutComponent {
  name = '';
  address = '';
  phone = '';
  email = '';
  paymentMethod = 'card';
  deliveryNotes = '';

  constructor(private cart: CartService, private router: Router, private orders: FirestoreOrderService, private auth: AuthService, private productService: ProductService, private popupService: PopupService) {}

  placeOrder() {
    const items = this.cart.getItems();
    if (!items.length) {
      this.popupService.showWarning('Votre panier est vide');
      return;
    }

    // Fetch current stock from Firestore for each product
    const productObservables = items.map(item => this.productService.getProduct(item.product.id));
    forkJoin(productObservables).subscribe(currentProducts => {
      // Check stock availability
      const insufficientStock = items.some((it, index) => it.quantity > (currentProducts[index]?.stock || 0));
      if (insufficientStock) {
        this.popupService.showError('Stock insuffisant pour un ou plusieurs produits. Veuillez ajuster les quantités.');
        return;
      }

      const now = new Date();
      const order = {
        name: this.name,
        email: this.email,
        phone: this.phone,
        address: this.address,
        paymentMethod: this.paymentMethod,
        deliveryNotes: this.deliveryNotes,
        items: items.map((it: any, index: number) => ({
          productId: it.product.id,
          productName: it.product.name,
          price: it.product.price,
          quantity: it.quantity,
          currentStock: currentProducts[index]?.stock || 0
        })),
        totalAmount: items.reduce((s: any, it: any) => s + it.product.price * it.quantity, 0),
        createdAt: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ' at ' + now.toTimeString().split(' ')[0] + ' UTC+' + (now.getTimezoneOffset() === 0 ? '0' : Math.abs(now.getTimezoneOffset() / 60)),
        orderDate: now.toISOString().split('T')[0],
        userId: (this.auth.getCurrentUser() as any)?.id || null
      };

      // create order in Firestore, fallback to localStorage
      this.orders.createOrder(order).subscribe({
        next: (res: any) => {
          this.cart.clear();
          this.popupService.showSuccess('Commande créée avec succès !', 'Succès');
          this.router.navigate(['/shop/profile']);
        },
        error: (err: any) => {
          console.error('Order create failed, saving locally', err);
          const ordersRaw = localStorage.getItem('app_orders');
          const orders = ordersRaw ? JSON.parse(ordersRaw) : [];
          orders.push(Object.assign({ id: Date.now() }, order));
          localStorage.setItem('app_orders', JSON.stringify(orders));
          this.cart.clear();
          this.popupService.showInfo('Commande enregistrée localement (connexion perdue)', 'Information');
          this.router.navigate(['/shop/profile']);
        }
      });
    });
  }
}
