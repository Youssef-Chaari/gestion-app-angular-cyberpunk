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
          <input
            [(ngModel)]="name"
            name="name"
            required
            minlength="3"
            maxlength="80"
            placeholder="Nom et prenom"
            [class.input-error]="formErrors['name']"
            (input)="clearFieldError('name')">
          <div class="error-message" *ngIf="formErrors['name']">{{ formErrors['name'] }}</div>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input
            [(ngModel)]="email"
            name="email"
            type="email"
            required
            maxlength="120"
            placeholder="Email"
            [class.input-error]="formErrors['email']"
            (input)="clearFieldError('email')">
          <div class="error-message" *ngIf="formErrors['email']">{{ formErrors['email'] }}</div>
        </div>

        <div class="form-group">
          <label>Telephone</label>
          <input
            [(ngModel)]="phone"
            name="phone"
            required
            maxlength="20"
            placeholder="+33 6 XX XX XX XX"
            [class.input-error]="formErrors['phone']"
            (input)="clearFieldError('phone')">
          <div class="error-message" *ngIf="formErrors['phone']">{{ formErrors['phone'] }}</div>
        </div>

        <div class="form-group">
          <label>Adresse de livraison</label>
          <textarea
            [(ngModel)]="address"
            name="address"
            required            placeholder="Votre adresse complete"
            [class.input-error]="formErrors['address']"
            (input)="clearFieldError('address')"></textarea>
          <div class="error-message" *ngIf="formErrors['address']">{{ formErrors['address'] }}</div>
        </div>

        <div class="form-group">
          <label>Methode de paiement</label>
          <select
            [(ngModel)]="paymentMethod"
            name="paymentMethod"
            [class.input-error]="formErrors['paymentMethod']"
            (change)="clearFieldError('paymentMethod')">
            <option value="card">Carte bancaire</option>
            <option value="paypal">PayPal</option>
            <option value="cash">Paiement a la livraison</option>
          </select>
          <div class="error-message" *ngIf="formErrors['paymentMethod']">{{ formErrors['paymentMethod'] }}</div>
        </div>

        <div class="form-group">
          <label>Notes de livraison (optionnel)</label>
          <textarea
            [(ngModel)]="deliveryNotes"
            name="deliveryNotes"
            maxlength="500"
            placeholder="Instructions speciales pour la livraison"
            [class.input-error]="formErrors['deliveryNotes']"
            (input)="clearFieldError('deliveryNotes')"></textarea>
          <div class="error-message" *ngIf="formErrors['deliveryNotes']">{{ formErrors['deliveryNotes'] }}</div>
          <small class="helper-text">{{ deliveryNotes.length }}/500</small>
        </div>

        <div class="form-group" *ngIf="formErrors['general']">
          <div class="error-message">{{ formErrors['general'] }}</div>
        </div>

        <div class="form-actions">
          <button type="submit" class="cyber-btn" [disabled]="isSubmitting">
            {{ isSubmitting ? 'Validation...' : 'Confirmer la commande' }}
          </button>
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

    .input-error {
      border-color: #ff4d6d;
      box-shadow: 0 0 8px rgba(255, 77, 109, 0.4);
    }

    .error-message {
      color: #ff8fa3;
      font-size: 0.85rem;
      margin-top: 0.4rem;
      font-family: 'Courier New', monospace;
    }

    .helper-text {
      display: block;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.75rem;
      margin-top: 0.35rem;
      text-align: right;
      font-family: 'Courier New', monospace;
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

    .cyber-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 0 25px rgba(0, 212, 255, 0.8);
      background: linear-gradient(45deg, #ff0080, #00d4ff);
    }

    .cyber-btn:active {
      transform: translateY(0);
    }

    .cyber-btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
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
  isSubmitting = false;
  formErrors: { [key: string]: string } = {};

  private readonly allowedPaymentMethods = ['card', 'paypal', 'cash'];

  constructor(
    private cart: CartService,
    private router: Router,
    private orders: FirestoreOrderService,
    private auth: AuthService,
    private productService: ProductService,
    private popupService: PopupService
  ) {}

  placeOrder(): void {
    if (this.isSubmitting) return;

    const items = this.cart.getItems();
    if (!items.length) {
      this.popupService.showWarning('Votre panier est vide');
      return;
    }

    if (!this.validateCheckoutForm()) {
      this.popupService.showWarning('Veuillez corriger les champs invalides avant de confirmer.');
      return;
    }

    const currentUser = this.auth.getCurrentUser() as any;
    const userId = currentUser?.uid || currentUser?.id || null;
    if (!userId) {
      this.popupService.showError('Vous devez etre connecte pour passer une commande.');
      return;
    }

    const hasInvalidCartItems = items.some(it =>
      !Number.isInteger(Number(it.quantity)) ||
      Number(it.quantity) < 1 ||
      Number(it.quantity) > 99 ||
      !Number.isFinite(Number(it.product?.price)) ||
      Number(it.product.price) <= 0
    );

    if (hasInvalidCartItems) {
      this.popupService.showError('Le panier contient des donnees invalides. Veuillez le mettre a jour.');
      return;
    }

    this.isSubmitting = true;

    const productObservables = items.map(item => this.productService.getProduct(item.product.id));
    forkJoin(productObservables).subscribe({
      next: currentProducts => {
        const missingProduct = currentProducts.some(p => !p);
        if (missingProduct) {
          this.isSubmitting = false;
          this.popupService.showError('Un ou plusieurs produits n\'existent plus. Rafraichissez votre panier.');
          return;
        }

        const insufficientStock = items.some((it, index) => Number(it.quantity) > Number(currentProducts[index]?.stock || 0));
        if (insufficientStock) {
          this.isSubmitting = false;
          this.popupService.showError('Stock insuffisant pour un ou plusieurs produits. Veuillez ajuster les quantites.');
          return;
        }

        const now = new Date();
        const order = {
          name: this.name.trim(),
          email: this.email.trim().toLowerCase(),
          phone: this.normalizePhone(this.phone),
          address: this.address.trim(),
          paymentMethod: this.paymentMethod,
          deliveryNotes: this.deliveryNotes.trim(),
          items: items.map((it: any, index: number) => ({
            productId: it.product.id,
            productName: String(it.product.name || '').trim(),
            price: Number(it.product.price),
            quantity: Number(it.quantity),
            currentStock: Number(currentProducts[index]?.stock || 0)
          })),
          totalAmount: items.reduce((s: any, it: any) => s + (Number(it.product.price) * Number(it.quantity)), 0),
          createdAt:
            now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
            ' at ' +
            now.toTimeString().split(' ')[0] +
            ' UTC+' +
            (now.getTimezoneOffset() === 0 ? '0' : Math.abs(now.getTimezoneOffset() / 60)),
          orderDate: now.toISOString().split('T')[0],
          userId
        };

        this.orders.createOrder(order).subscribe({
          next: (res: any) => {
            this.isSubmitting = false;
            this.cart.clear();
            if (res.stockUpdateFailed) {
              this.popupService.showWarning('Votre commande a bien ete enregistree. Notre equipe finalise le traitement.', 'Attention');
            } else {
              this.popupService.showSuccess('Votre commande a ete confirmee avec succes.', 'Succes');
            }
            this.router.navigate(['/shop/profile']);
          },
          error: (err: any) => {
            this.isSubmitting = false;
            this.formErrors['general'] = err?.message || 'La commande a echoue. Verifiez vos donnees puis reessayez.';
            console.error('Order creation failed:', err?.message || err);
            const ordersRaw = localStorage.getItem('app_orders');
            const orders = ordersRaw ? JSON.parse(ordersRaw) : [];
            orders.push(Object.assign({ id: Date.now() }, order));
            localStorage.setItem('app_orders', JSON.stringify(orders));
            this.cart.clear();
            this.popupService.showInfo('Commande sauvegardee localement. Elle sera synchronisee automatiquement quand la connexion sera retablie.', 'Mode Hors Ligne');
            this.router.navigate(['/shop/profile']);
          }
        });
      },
      error: () => {
        this.isSubmitting = false;
        this.popupService.showError('Impossible de verifier le stock. Reessayez.');
      }
    });
  }

  clearFieldError(field: string): void {
    delete this.formErrors[field];
  }

  private validateCheckoutForm(): boolean {
    const errors: { [key: string]: string } = {};
    const name = this.name.trim();
    const email = this.email.trim().toLowerCase();
    const phone = this.normalizePhone(this.phone);
    const address = this.address.trim();
    const notes = this.deliveryNotes.trim();

    if (!name) {
      errors['name'] = 'Le nom complet est obligatoire.';
    } else if (name.length < 3 || name.length > 80) {
      errors['name'] = 'Le nom doit contenir entre 3 et 80 caracteres.';
    } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(name)) {
      errors['name'] = 'Le nom contient des caracteres non autorises.';
    }

    if (!email) {
      errors['email'] = 'L\'email est obligatoire.';
    } else if (email.length > 120) {
      errors['email'] = 'L\'email ne peut pas depasser 120 caracteres.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors['email'] = 'Format d\'email invalide.';
    }

    if (!phone) {
      errors['phone'] = 'Le telephone est obligatoire.';
    } else if (!/^\+?[0-9]{8,15}$/.test(phone)) {
      errors['phone'] = 'Le telephone doit contenir 8 a 15 chiffres (optionnel + au debut).';
    }

    if (!address) {
      errors['address'] = 'L\'adresse de livraison est obligatoire.';
    }

    if (!this.allowedPaymentMethods.includes(this.paymentMethod)) {
      errors['paymentMethod'] = 'Methode de paiement invalide.';
    }

    if (notes.length > 500) {
      errors['deliveryNotes'] = 'Les notes de livraison ne peuvent pas depasser 500 caracteres.';
    }

    this.formErrors = errors;
    return Object.keys(errors).length === 0;
  }

  private normalizePhone(value: string): string {
    const raw = String(value || '').trim();
    return raw.startsWith('+')
      ? `+${raw.slice(1).replace(/\D/g, '')}`
      : raw.replace(/\D/g, '');
  }
}

