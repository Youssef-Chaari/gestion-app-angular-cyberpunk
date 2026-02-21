import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="cart-page">
      <!-- Header -->
      <div class="cart-header">
        <div class="header-content">
          <h1 class="cart-title">
            <span class="title-icon">🛒</span>
            MON PANIER
          </h1>
          <p class="cart-subtitle">Gérez vos articles sélectionnés</p>
        </div>
      </div>

      <!-- Cart Content -->
      <div class="cart-content" *ngIf="items.length > 0; else emptyCart">
        <!-- Cart Items -->
        <div class="cart-items">
          <div class="cart-item"
               *ngFor="let item of items; trackBy: trackByItemId"
               [class.last-item]="items.indexOf(item) === items.length - 1">

            <div class="item-image">
              <div class="product-icon">📦</div>
            </div>

            <div class="item-details">
              <h3 class="item-name">{{ item.product.name }}</h3>
              <div class="item-category">
                <span class="category-label">Catégorie:</span>
                <span class="category-value">{{ item.product.category_name || 'Général' }}</span>
              </div>
              <div class="item-price">
                <span class="unit-price">{{ item.product.price | number:'1.2-2' }} TND</span>
                <span class="price-label">l'unité</span>
              </div>
            </div>

            <div class="item-quantity">
              <div class="quantity-controls">
                <button class="qty-btn qty-minus"
                        (click)="updateQuantity(item.product.id, item.quantity - 1)"
                        [disabled]="item.quantity <= 1"
                        title="Diminuer la quantité">
                  <span class="qty-icon">−</span>
                </button>

                <input type="number"
                       class="qty-input"
                       [value]="item.quantity"
                       (change)="updateQuantity(item.product.id, $any($event.target).value)"
                       min="1"
                       title="Quantité">

                <button class="qty-btn qty-plus"
                        (click)="updateQuantity(item.product.id, item.quantity + 1)"
                        title="Augmenter la quantité">
                  <span class="qty-icon">+</span>
                </button>
              </div>
            </div>

            <div class="item-total">
              <div class="total-price">
                <span class="total-amount">{{ (item.product.price * item.quantity) | number:'1.2-2' }}</span>
                <span class="total-currency">TND</span>
              </div>
            </div>

            <div class="item-actions">
              <button class="btn-remove"
                      (click)="removeItem(item.product.id)"
                      title="Retirer du panier">
                <span class="remove-icon">🗑️</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="cart-summary">
          <div class="summary-card">
            <div class="summary-header">
              <h3>RÉSUMÉ DE LA COMMANDE</h3>
            </div>

            <div class="summary-content">
              <div class="summary-row">
                <span class="summary-label">Sous-total ({{ getTotalItems() }} articles)</span>
                <span class="summary-value">{{ total | number:'1.2-2' }} TND</span>
              </div>

              <div class="summary-row">
                <span class="summary-label">Frais de livraison</span>
                <span class="summary-value">Gratuit</span>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-row summary-total">
                <span class="summary-label">Total</span>
                <span class="summary-value">{{ total | number:'1.2-2' }} TND</span>
              </div>
            </div>

            <div class="summary-actions">
              <button class="btn btn-secondary btn-continue"
                      routerLink="/shop"
                      title="Continuer les achats">
                <span class="btn-icon">⬅️</span>
                <span class="btn-text">CONTINUER</span>
              </button>

              <button class="btn btn-primary btn-checkout"
                      (click)="proceedToCheckout()"
                      title="Procéder au paiement">
                <span class="btn-icon">💳</span>
                <span class="btn-text">COMMANDER</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Cart -->
      <ng-template #emptyCart>
        <div class="empty-cart">
          <div class="empty-content">
            <div class="empty-icon">🛒</div>
            <h3>Votre panier est vide</h3>
            <p>Découvrez nos produits et commencez vos achats !</p>
            <button class="btn btn-primary" routerLink="/shop">
              <span class="btn-icon">🛍️</span>
              <span class="btn-text">ALLER AU CATALOGUE</span>
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .cart-page {
      animation: fadeInUp 0.6s ease-out;
    }

    /* Header */
    .cart-header {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 255, 136, 0.02) 100%);
      border-radius: 12px;
      border: 1px solid rgba(0, 255, 136, 0.2);
      padding: 2rem;
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
    }

    .cart-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #00ff88, #ff006e, #00ff88);
      animation: borderGlow 3s ease-in-out infinite;
    }

    .header-content {
      text-align: center;
    }

    .cart-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      font-family: 'Orbitron', sans-serif;
      font-size: 2.5rem;
      color: #00ff88;
      margin: 0 0 0.5rem 0;
      text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
      letter-spacing: 3px;
    }

    .title-icon {
      font-size: 2rem;
      filter: drop-shadow(0 0 10px #00ff88);
    }

    .cart-subtitle {
      color: rgba(0, 255, 136, 0.7);
      font-size: 1.1rem;
      margin: 0;
      font-family: 'Space Mono', monospace;
      letter-spacing: 1px;
    }

    /* Cart Content */
    .cart-content {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 2rem;
      align-items: start;
    }

    /* Cart Items */
    .cart-items {
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.8) 0%, rgba(26, 26, 62, 0.8) 100%);
      border-radius: 12px;
      border: 1px solid rgba(0, 255, 136, 0.2);
      overflow: hidden;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 80px 1fr 140px 120px 50px;
      gap: 1rem;
      padding: 1.5rem;
      border-bottom: 1px solid rgba(0, 255, 136, 0.1);
      transition: all 0.3s ease;
      align-items: center;
    }

    .cart-item:hover {
      background: rgba(0, 255, 136, 0.05);
    }

    .cart-item.last-item {
      border-bottom: none;
    }

    .item-image {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-icon {
      font-size: 2rem;
      opacity: 0.8;
    }

    .item-details {
      min-width: 0; /* Allow text to wrap */
    }

    .item-name {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.2rem;
      color: #00ff88;
      margin: 0 0 0.5rem 0;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-category {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .category-label {
      color: rgba(0, 255, 136, 0.6);
      font-size: 0.85rem;
      font-family: 'Space Mono', monospace;
    }

    .category-value {
      color: #ff006e;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .item-price {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }

    .unit-price {
      color: #00ff88;
      font-weight: 600;
      font-size: 1rem;
    }

    .price-label {
      color: rgba(0, 255, 136, 0.6);
      font-size: 0.8rem;
    }

    /* Quantity Controls */
    .item-quantity {
      display: flex;
      justify-content: center;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(0, 255, 136, 0.1);
      border-radius: 8px;
      padding: 0.5rem;
      border: 1px solid rgba(0, 255, 136, 0.2);
    }

    .qty-btn {
      background: rgba(0, 255, 136, 0.2);
      border: 1px solid rgba(0, 255, 136, 0.3);
      border-radius: 4px;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #00ff88;
    }

    .qty-btn:hover:not(:disabled) {
      background: #00ff88;
      color: #0a0e27;
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
    }

    .qty-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .qty-input {
      width: 50px;
      text-align: center;
      border: 1px solid rgba(0, 255, 136, 0.3);
      border-radius: 4px;
      background: rgba(0, 255, 136, 0.05);
      color: #00ff88;
      font-family: 'Space Mono', monospace;
      font-size: 0.9rem;
      padding: 0.25rem;
    }

    .qty-input:focus {
      outline: none;
      border-color: #00ff88;
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }

    /* Item Total */
    .item-total {
      text-align: right;
    }

    .total-price {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .total-amount {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.2rem;
      color: #00ff88;
      font-weight: 700;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }

    .total-currency {
      font-size: 0.8rem;
      color: rgba(0, 255, 136, 0.6);
    }

    /* Item Actions */
    .item-actions {
      display: flex;
      justify-content: center;
    }

    .btn-remove {
      background: rgba(255, 0, 110, 0.2);
      border: 1px solid rgba(255, 0, 110, 0.3);
      border-radius: 6px;
      padding: 0.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #ff006e;
    }

    .btn-remove:hover {
      background: #ff006e;
      color: #0a0e27;
      box-shadow: 0 0 15px rgba(255, 0, 110, 0.5);
      transform: scale(1.1);
    }

    /* Cart Summary */
    .cart-summary {
      position: sticky;
      top: 2rem;
    }

    .summary-card {
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.9) 0%, rgba(26, 26, 62, 0.9) 100%);
      border: 1px solid rgba(0, 255, 136, 0.3);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.1);
    }

    .summary-header {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.05) 100%);
      padding: 1.5rem;
      border-bottom: 1px solid rgba(0, 255, 136, 0.2);
    }

    .summary-header h3 {
      margin: 0;
      color: #00ff88;
      font-family: 'Orbitron', sans-serif;
      font-size: 1.2rem;
      text-align: center;
      letter-spacing: 2px;
    }

    .summary-content {
      padding: 1.5rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .summary-label {
      color: rgba(0, 255, 136, 0.8);
      font-family: 'Space Mono', monospace;
      font-size: 0.9rem;
    }

    .summary-value {
      color: #00ff88;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .summary-total {
      border-top: 1px solid rgba(0, 255, 136, 0.2);
      padding-top: 1rem;
      margin-top: 1rem;
    }

    .summary-total .summary-label,
    .summary-total .summary-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: #00ff88;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }

    .summary-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.3), transparent);
      margin: 1rem 0;
    }

    .summary-actions {
      padding: 1.5rem;
      border-top: 1px solid rgba(0, 255, 136, 0.2);
      display: flex;
      gap: 1rem;
    }

    .summary-actions .btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .summary-actions .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }

    .summary-actions .btn:hover::before {
      left: 100%;
    }

    .btn-secondary {
      background: transparent;
      color: #00ff88;
      border: 2px solid #00ff88;
    }

    .btn-secondary:hover {
      background: rgba(0, 255, 136, 0.1);
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
      transform: translateY(-1px);
    }

    .btn-primary {
      background: linear-gradient(135deg, #00ff88, #00cc6a);
      color: #0a0e27;
      border: 2px solid #00ff88;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #00cc6a, #00ff88);
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
      transform: translateY(-2px);
    }

    /* Empty Cart */
    .empty-cart {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-content {
      max-width: 500px;
      margin: 0 auto;
    }

    .empty-icon {
      font-size: 5rem;
      opacity: 0.5;
      margin-bottom: 2rem;
      filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.3));
    }

    .empty-content h3 {
      color: #00ff88;
      font-family: 'Orbitron', sans-serif;
      margin: 0 0 1rem 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .empty-content p {
      color: rgba(0, 255, 136, 0.7);
      margin: 0 0 2rem 0;
      font-size: 1.1rem;
      line-height: 1.6;
    }

    /* Animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes borderGlow {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .cart-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .cart-summary {
        position: static;
      }

      .cart-item {
        grid-template-columns: 60px 1fr 100px 80px 40px;
        gap: 0.75rem;
        padding: 1rem;
      }

      .item-name {
        font-size: 1rem;
      }
    }

    @media (max-width: 768px) {
      .cart-item {
        grid-template-columns: 1fr;
        gap: 1rem;
        text-align: center;
      }

      .item-image, .item-quantity, .item-total, .item-actions {
        justify-self: center;
      }

      .quantity-controls {
        justify-content: center;
      }

      .summary-actions {
        flex-direction: column;
      }

      .cart-title {
        font-size: 2rem;
      }
    }

    @media (max-width: 480px) {
      .cart-header {
        padding: 1.5rem;
      }

      .cart-title {
        font-size: 1.5rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .cart-item {
        padding: 1rem 0.75rem;
      }

      .summary-content {
        padding: 1rem;
      }

      .summary-actions {
        padding: 1rem;
      }
    }
  `]
})
export class CartComponent {
  items: CartItem[] = [];
  total = 0;

  constructor(private cart: CartService, private router: Router) {
    this.items = this.cart.getItems();
    this.computeTotal();
    this.cart.items$.subscribe(items => {
      this.items = items;
      this.computeTotal();
    });
  }

  computeTotal() {
    this.total = this.items.reduce((s, it) => s + (it.product.price * it.quantity), 0);
  }

  updateQuantity(productId: string | number, qty: any) {
    const n = Math.max(1, Number(qty) || 1);
    this.cart.update(productId, n);
  }

  removeItem(productId: string | number) {
    this.cart.remove(productId);
  }

  getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  proceedToCheckout() {
    this.router.navigate(['/shop/checkout']);
  }

  trackByItemId(index: number, item: CartItem): any {
    return item.product.id;
  }
}
