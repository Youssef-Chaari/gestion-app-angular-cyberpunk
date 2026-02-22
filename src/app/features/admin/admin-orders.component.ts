import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FirestoreOrderService } from '../../core/services/firestore-order.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-orders">
      <div class="orders-header">
        <h2 class="page-title">📋 GESTION DES COMMANDES</h2>
        <p class="page-subtitle">Administration des achats et transactions</p>
      </div>

      <div class="orders-stats">
        <div class="stat-card">
          <div class="stat-icon">🛒</div>
          <div class="stat-info">
            <h3>{{ orders.length }}</h3>
            <p>Commandes totales</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <h3>{{ getTotalRevenue() | number:'1.2-2' }} TND</h3>
            <p>Revenus totaux</p>
          </div>
        </div>
      </div>

      <div class="orders-container">
        <div *ngIf="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Chargement des commandes...</p>
        </div>

        <div *ngIf="!loading && orders.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>Aucune commande trouvée</h3>
          <p>Les commandes apparaîtront ici une fois que les utilisateurs feront des achats.</p>
        </div>

        <div *ngIf="!loading && orders.length > 0" class="orders-list">
          <div class="order-card" *ngFor="let order of orders; trackBy: trackByOrderId">
            <div class="order-header">
              <div class="order-id">#{{ order.id }}</div>
              <div class="order-date">{{ order.createdAt }}</div>
            </div>
            <div class="order-details">
              <div class="order-total">
                <span class="total-label">Total:</span>
                <span class="total-amount">{{ order.totalAmount | number:'1.2-2' }} TND</span>
              </div>
              <div class="order-items">
                <span class="items-count">{{ order.items?.length || 0 }} article(s)</span>
              </div>
            </div>
            <div class="order-user">
              <span class="user-label">Utilisateur:</span>
              <span class="user-id">{{ order.userId }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-orders {
      animation: fadeInUp 0.6s ease-out;
      padding: 0;
    }

    .orders-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 2rem;
      padding: 2rem;
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 255, 136, 0.02) 100%);
      border-radius: 12px;
      border: 1px solid rgba(0, 255, 136, 0.2);
      position: relative;
    }

    .page-title {
      color: #00ff88;
      font-family: 'Orbitron', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-align: center;
    }

    .page-subtitle {
      color: rgba(0, 255, 136, 0.7);
      font-size: 1rem;
      margin: 0;
      text-align: center;
    }

    .orders-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.8) 0%, rgba(26, 26, 62, 0.8) 100%);
      border: 1px solid rgba(0, 255, 136, 0.3);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(0, 255, 136, 0.1);
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 255, 136, 0.2);
    }

    .stat-icon {
      font-size: 2rem;
      opacity: 0.8;
    }

    .stat-info h3 {
      color: #00ff88;
      font-family: 'Orbitron', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
    }

    .stat-info p {
      color: rgba(0, 255, 136, 0.7);
      margin: 0;
      font-size: 0.9rem;
    }

    .orders-container {
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.5) 0%, rgba(26, 26, 62, 0.5) 100%);
      border-radius: 12px;
      border: 1px solid rgba(0, 255, 136, 0.2);
      overflow: hidden;
    }

    .loading-state, .empty-state {
      padding: 3rem 1rem;
      text-align: center;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(0, 255, 136, 0.3);
      border-top: 3px solid #00ff88;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-state p, .empty-state p {
      color: rgba(0, 255, 136, 0.7);
      margin: 0;
    }

    .empty-icon {
      font-size: 4rem;
      opacity: 0.5;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: #00ff88;
      font-family: 'Orbitron', sans-serif;
      margin: 0 0 1rem 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .orders-list {
      max-height: 600px;
      overflow-y: auto;
    }

    .order-card {
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.8) 0%, rgba(26, 26, 62, 0.8) 100%);
      border-bottom: 1px solid rgba(0, 255, 136, 0.2);
      padding: 1.5rem;
      transition: all 0.3s ease;
    }

    .order-card:hover {
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.9) 0%, rgba(26, 26, 62, 0.9) 100%);
      transform: translateX(5px);
    }

    .order-card:last-child {
      border-bottom: none;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .order-id {
      color: #00ff88;
      font-family: 'Orbitron', sans-serif;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .order-date {
      color: rgba(0, 255, 136, 0.7);
      font-size: 0.9rem;
    }

    .order-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .order-total .total-label, .order-user .user-label {
      color: rgba(0, 255, 136, 0.7);
      font-size: 0.9rem;
      margin-right: 0.5rem;
    }

    .total-amount {
      color: #00ff88;
      font-weight: 600;
      font-size: 1rem;
    }

    .order-items .items-count {
      color: rgba(0, 255, 136, 0.7);
      font-size: 0.9rem;
    }

    .order-user {
      display: flex;
      align-items: center;
    }

    .user-id {
      color: #00ff88;
      font-family: 'Courier New', monospace;
      font-size: 0.8rem;
      background: rgba(0, 255, 136, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      border: 1px solid rgba(0, 255, 136, 0.3);
    }

    @media (max-width: 768px) {
      .orders-header {
        padding: 1.5rem;
      }

      .page-title {
        font-size: 1.5rem;
      }

      .orders-stats {
        grid-template-columns: 1fr;
      }

      .order-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .order-details {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;

  constructor(private auth: AuthService, private router: Router, private ordersService: FirestoreOrderService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user || user.role !== 'admin') {
      this.router.navigate(['/shop']);
      return;
    }

    this.ordersService.getAllOrders().subscribe(list => {
      this.orders = list.map(o => ({
        ...o,
        created_at: o.orderDate || o.created_at || o.createdAt || new Date().toISOString()
      }));
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  formatDate(s: any): string {
    const d = new Date(s);
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  getTotalRevenue(): number {
    return this.orders.reduce((total, order) => total + (order.totalAmount || 0), 0);
  }

  trackByOrderId(index: number, order: any): any {
    return order.id;
  }
}
