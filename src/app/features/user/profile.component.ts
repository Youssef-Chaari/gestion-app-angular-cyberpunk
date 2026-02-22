import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../core/services/auth.service';
import { FirestoreOrderService } from '../../core/services/firestore-order.service';

interface Order {
  id: string;
  created_at: string | any;
  total: number;
  items: OrderItem[];
}

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  currentStock?: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-page">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="header-content">
          <h1 class="profile-title">
            <span class="title-icon">👤</span>
            MON PROFIL
          </h1>
          <p class="profile-subtitle">Gérez vos informations et consultez vos commandes</p>
        </div>
      </div>

      <!-- Profile Content -->
      <div class="profile-content">
        <!-- User Info Card -->
        <div class="info-card">
          <div class="card-header">
            <h3>INFORMATIONS PERSONNELLES</h3>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="info-label">Nom d'utilisateur:</span>
              <span class="info-value">{{ currentUser?.username }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">{{ currentUser?.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Rôle:</span>
              <span class="info-value role-badge" [class]="getRoleClass(currentUser?.role || 'user')">
                {{ getRoleLabel(currentUser?.role || 'user') }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Membre depuis:</span>
              <span class="info-value">{{ getMemberSince() }}</span>
            </div>
          </div>
        </div>

        <!-- Orders Section -->
        <div class="orders-section">
          <div class="section-header">
            <h3>HISTORIQUE DES COMMANDES</h3>
            <div class="orders-stats">
              <span class="stat-item">
                <span class="stat-icon">📦</span>
                <span class="stat-text">{{ orders.length }} commande{{ orders.length !== 1 ? 's' : '' }}</span>
              </span>
            </div>
          </div>

          <div class="orders-content" *ngIf="orders.length > 0; else noOrders">
            <div class="order-card"
                 *ngFor="let order of orders; trackBy: trackByOrderId"
                 [class.recent]="isRecentOrder(order.created_at)">

              <div class="order-header">
                <div class="order-info">
                  <h4 class="order-number">Commande #{{ order.id }}</h4>
                  <div class="order-date">
                    <span class="date-icon">📅</span>
                    <span class="date-text">{{ formatDate(order.created_at) }}</span>
                    <span class="recent-badge" *ngIf="isRecentOrder(order.created_at)">RÉCENT</span>
                  </div>
                </div>
                <div class="order-total">
                  <div class="total-amount">
                    <span class="total-value">{{ order.total | number:'1.2-2' }}</span>
                    <span class="total-currency">TND</span>
                  </div>
                </div>
              </div>

              <div class="order-items">
                <div class="order-item" *ngFor="let item of order.items">
                  <div class="item-details">
                    <span class="item-name">{{ item.productName }}</span>
                    <span class="item-quantity">×{{ item.quantity }}</span>
                  </div>
                  <div class="item-price">
                    <span class="price-value">{{ (item.price * item.quantity) | number:'1.2-2' }}</span>
                    <span class="price-currency">TND</span>
                  </div>
                </div>
              </div>

              <div class="order-footer">
                <div class="order-status">
                  <span class="status-icon">✅</span>
                  <span class="status-text">Commande livrée</span>
                </div>
                <button class="btn btn-secondary btn-details" title="Voir les détails">
                  <span class="btn-icon">📋</span>
                  <span class="btn-text">DÉTAILS</span>
                </button>
              </div>
            </div>
          </div>

          <!-- No Orders -->
          <ng-template #noOrders>
            <div class="no-orders">
              <div class="empty-content">
                <div class="empty-icon">📋</div>
                <h4>Aucune commande trouvée</h4>
                <p>Vous n'avez pas encore passé de commande. Découvrez notre catalogue !</p>
                <button class="btn btn-primary" routerLink="/shop">
                  <span class="btn-icon">🛍️</span>
                  <span class="btn-text">COMMENCER LES ACHATS</span>
                </button>
              </div>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      animation: fadeInUp 0.6s ease-out;
    }

    /* Header */
    .profile-header {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 255, 136, 0.02) 100%);
      border-radius: 12px;
      border: 1px solid rgba(0, 255, 136, 0.2);
      padding: 2rem;
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
    }

    .profile-header::before {
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

    .profile-title {
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

    .profile-subtitle {
      color: rgba(0, 255, 136, 0.7);
      font-size: 1.1rem;
      margin: 0;
      font-family: 'Space Mono', monospace;
      letter-spacing: 1px;
    }

    /* Profile Content */
    .profile-content {
      display: grid;
      gap: 2rem;
    }

    /* Info Card */
    .info-card {
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.9) 0%, rgba(26, 26, 62, 0.9) 100%);
      border: 1px solid rgba(0, 255, 136, 0.3);
      border-radius: 12px;
      overflow: hidden;
    }

    .card-header {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.05) 100%);
      padding: 1.5rem;
      border-bottom: 1px solid rgba(0, 255, 136, 0.2);
    }

    .card-header h3 {
      margin: 0;
      color: #00ff88;
      font-family: 'Orbitron', sans-serif;
      font-size: 1.2rem;
      text-align: center;
      letter-spacing: 2px;
    }

    .card-content {
      padding: 1.5rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(0, 255, 136, 0.1);
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      color: rgba(0, 255, 136, 0.8);
      font-family: 'Space Mono', monospace;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .info-value {
      color: #00ff88;
      font-weight: 600;
      text-align: right;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
    }

    .role-badge.admin {
      background: linear-gradient(135deg, rgba(255, 0, 110, 0.2) 0%, rgba(255, 0, 110, 0.1) 100%);
      color: #ff006e;
      border: 1px solid rgba(255, 0, 110, 0.3);
    }

    .role-badge.user {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 136, 0.1) 100%);
      color: #00ff88;
      border: 1px solid rgba(0, 255, 136, 0.3);
    }

    /* Orders Section */
    .orders-section {
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.9) 0%, rgba(26, 26, 62, 0.9) 100%);
      border: 1px solid rgba(0, 255, 136, 0.3);
      border-radius: 12px;
      overflow: hidden;
    }

    .section-header {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.05) 100%);
      padding: 1.5rem;
      border-bottom: 1px solid rgba(0, 255, 136, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-header h3 {
      margin: 0;
      color: #00ff88;
      font-family: 'Orbitron', sans-serif;
      font-size: 1.2rem;
      letter-spacing: 2px;
    }

    .orders-stats {
      display: flex;
      gap: 1rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(0, 255, 136, 0.1);
      border-radius: 20px;
      font-family: 'Space Mono', monospace;
      color: rgba(0, 255, 136, 0.8);
      font-size: 0.85rem;
    }

    .stat-icon {
      font-size: 1rem;
    }

    /* Order Cards */
    .orders-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .order-card {
      background: linear-gradient(135deg, rgba(26, 26, 62, 0.8) 0%, rgba(10, 14, 39, 0.8) 100%);
      border: 1px solid rgba(0, 255, 136, 0.2);
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .order-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 255, 136, 0.2);
      border-color: #00ff88;
    }

    .order-card.recent {
      border-color: #ff006e;
      box-shadow: 0 0 15px rgba(255, 0, 110, 0.3);
    }

    .order-card.recent::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #ff006e, #00ff88);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      border-bottom: 1px solid rgba(0, 255, 136, 0.1);
    }

    .order-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .order-number {
      margin: 0;
      color: #00ff88;
      font-family: 'Orbitron', sans-serif;
      font-size: 1.1rem;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }

    .order-date {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .date-icon {
      font-size: 0.9rem;
      opacity: 0.7;
    }

    .date-text {
      color: rgba(0, 255, 136, 0.7);
      font-size: 0.85rem;
      font-family: 'Space Mono', monospace;
    }

    .recent-badge {
      background: linear-gradient(135deg, #ff006e, #cc0055);
      color: white;
      padding: 0.2rem 0.5rem;
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .order-total {
      text-align: right;
    }

    .total-amount {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .total-value {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.3rem;
      color: #00ff88;
      font-weight: 700;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }

    .total-currency {
      font-size: 0.8rem;
      color: rgba(0, 255, 136, 0.6);
    }

    .order-items {
      padding: 1rem 1.25rem;
      background: rgba(0, 255, 136, 0.02);
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(0, 255, 136, 0.1);
    }

    .order-item:last-child {
      border-bottom: none;
    }

    .item-details {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .item-name {
      color: #00ff88;
      font-weight: 600;
    }

    .item-quantity {
      color: rgba(0, 255, 136, 0.7);
      font-family: 'Space Mono', monospace;
    }

    .item-price {
      text-align: right;
    }

    .price-value {
      color: #00ff88;
      font-weight: 600;
    }

    .price-currency {
      font-size: 0.8rem;
      color: rgba(0, 255, 136, 0.6);
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background: rgba(0, 255, 136, 0.05);
      border-top: 1px solid rgba(0, 255, 136, 0.1);
    }

    .order-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-icon {
      font-size: 1rem;
    }

    .status-text {
      color: rgba(0, 255, 136, 0.8);
      font-size: 0.9rem;
      font-weight: 600;
    }

    .btn-details {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: transparent;
      color: #00ff88;
      border: 1px solid #00ff88;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-details:hover {
      background: rgba(0, 255, 136, 0.1);
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }

    /* No Orders */
    .no-orders {
      padding: 3rem 1.5rem;
      text-align: center;
    }

    .empty-content {
      max-width: 400px;
      margin: 0 auto;
    }

    .empty-icon {
      font-size: 4rem;
      opacity: 0.5;
      margin-bottom: 1.5rem;
      filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.3));
    }

    .empty-content h4 {
      color: #00ff88;
      font-family: 'Orbitron', sans-serif;
      margin: 0 0 1rem 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .empty-content p {
      color: rgba(0, 255, 136, 0.7);
      margin: 0 0 2rem 0;
      font-size: 1rem;
      line-height: 1.6;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }

    .btn:hover::before {
      left: 100%;
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
    @media (max-width: 768px) {
      .profile-content {
        gap: 1.5rem;
      }

      .section-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .order-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .order-items {
        padding: 1rem;
      }

      .order-item {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
      }

      .order-footer {
        flex-direction: column;
        gap: 1rem;
      }

      .profile-title {
        font-size: 2rem;
      }
    }

    @media (max-width: 480px) {
      .profile-header {
        padding: 1.5rem;
      }

      .profile-title {
        font-size: 1.5rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .info-row {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
      }

      .card-content {
        padding: 1rem;
      }

      .orders-content {
        padding: 1rem;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  orders: Order[] = [];
  currentUser: User | null = null;

  constructor(private authService: AuthService, private ordersService: FirestoreOrderService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.id) {
        this.loadOrdersForUser(user.id.toString());
      } else {
        this.orders = [];
      }
    });
  }

  ngOnInit(): void {
    // orders will be loaded via Firestore when user is available
  }

  private loadOrdersForUser(userId: string) {
    this.ordersService.getOrdersByUser(userId).subscribe(list => {
      // Normalize created_at to string for existing UI helpers
      this.orders = list.map(o => ({
        id: o.id,
        created_at: o.orderDate || o.created_at || o.createdAt || new Date().toISOString(),
        total: o.totalAmount || o.total || (o.items ? o.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) : 0),
        items: o.items || []
      }));
    }, () => {
      // fallback to local storage if Firestore fails
      const raw = localStorage.getItem('app_orders');
      this.orders = raw ? JSON.parse(raw) : [];
    });
  }

  getRoleLabel(role: string): string {
    return role === 'admin' ? 'Administrateur' : 'Utilisateur';
  }

  getRoleClass(role: string): string {
    return role === 'admin' ? 'admin' : 'user';
  }

  getMemberSince(): string {
    // This would normally come from the user data
    // For now, return a placeholder
    return 'Janvier 2024';
  }

  isRecentOrder(createdAt: string): boolean {
    const orderDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Consider orders from last 7 days as recent
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  trackByOrderId(index: number, order: Order): string {
    return order.id;
  }
}
