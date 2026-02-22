import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, Firestore, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase || {});
const db: Firestore = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

interface OrderDetail {
  id: string;
  clientName: string;
  clientEmail: string;
  totalAmount: number;
  orderDate: string;
  createdAt: any;
  userId: string;
  status?: string;
  items?: any[];
  phone?: string;
  address?: string;
  paymentMethod?: string;
  deliveryNotes?: string;
}

@Component({
  selector: 'app-orders-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-container">
      <div class="orders-header">
        <h1 class="page-title">
          <span class="title-icon">📋</span>
          HISTORIQUE DES COMMANDES
        </h1>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filter-group">
          <label for="clientFilter">Nom du client:</label>
          <input 
            type="text"
            id="clientFilter"
            [(ngModel)]="filters.clientName"
            (input)="filterOrders()"
            placeholder="Rechercher par nom de client..."
            class="filter-input">
        </div>

        <div class="filter-group">
          <label for="dateFrom">Date début:</label>
          <input 
            type="date"
            id="dateFrom"
            [(ngModel)]="filters.dateFrom"
            (change)="filterOrders()"
            class="filter-input">
        </div>

        <div class="filter-group">
          <label for="dateTo">Date fin:</label>
          <input 
            type="date"
            id="dateTo"
            [(ngModel)]="filters.dateTo"
            (change)="filterOrders()"
            class="filter-input">
        </div>

        <button class="btn btn-secondary" (click)="clearFilters()">
          <span class="btn-icon">🔄</span>
          Réinitialiser filtres
        </button>
      </div>

      <!-- Orders Table -->
      <div class="orders-table-container">
        <table class="orders-table" *ngIf="filteredOrders.length > 0; else noOrders">
          <thead>
            <tr>
              <th class="col-date">
                <span class="col-icon">📅</span>
                DATE
              </th>
              <th class="col-client">
                <span class="col-icon">👤</span>
                CLIENT
              </th>
              <th class="col-email">
                <span class="col-icon">✉️</span>
                EMAIL
              </th>
              <th class="col-amount">
                <span class="col-icon">💰</span>
                MONTANT
              </th>
              <th class="col-actions">
                <span class="col-icon">⚙️</span>
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of filteredOrders; trackBy: trackByOrderId"
                class="order-row"
                [class.even]="filteredOrders.indexOf(order) % 2 === 0">
              <td class="col-date">{{ formatDate(order.orderDate) }}</td>
              <td class="col-client">{{ order.clientName }}</td>
              <td class="col-email">{{ order.clientEmail }}</td>
              <td class="col-amount">{{ order.totalAmount | number:'1.0-2' }} TND</td>
              <td class="col-actions">
                <button class="btn btn-small btn-primary" (click)="viewOrderDetails(order)" title="Voir les détails">
                  <span class="btn-icon">👁️</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <ng-template #noOrders>
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>Aucune commande trouvée</h3>
            <p>Aucune commande ne correspond à vos critères de recherche.</p>
            <button class="btn btn-primary" (click)="clearFilters()">
              <span class="btn-icon">🔄</span>
              Réinitialiser filtres
            </button>
          </div>
        </ng-template>
      </div>

      <!-- Order Details Modal -->
      <div class="modal-overlay" *ngIf="selectedOrder" (click)="closeOrderDetails()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Détails de la commande</h2>
            <button class="close-btn" (click)="closeOrderDetails()" title="Fermer">✕</button>
          </div>
          <div class="modal-body">
            <div class="detail-group">
              <label>ID Commande:</label>
              <p>{{ selectedOrder.id }}</p>
            </div>
            <div class="detail-group">
              <label>Date:</label>
              <p>{{ formatDate(selectedOrder.orderDate) }}</p>
            </div>
            <div class="detail-group">
              <label>Nom du client:</label>
              <p>{{ selectedOrder.clientName }}</p>
            </div>
            <div class="detail-group">
              <label>Email:</label>
              <p>{{ selectedOrder.clientEmail }}</p>
            </div>
            <div class="detail-group">
              <label>Montant total:</label>
              <p class="amount">{{ selectedOrder.totalAmount | number:'1.0-2' }} TND</p>
            </div>
            <div class="detail-group">
              <label>Statut:</label>
              <p>{{ selectedOrder.status }}</p>
            </div>
            <div class="detail-group" *ngIf="selectedOrder.phone">
              <label>Téléphone:</label>
              <p>{{ selectedOrder.phone }}</p>
            </div>
            <div class="detail-group" *ngIf="selectedOrder.address">
              <label>Adresse:</label>
              <p>{{ selectedOrder.address }}</p>
            </div>
            <div class="detail-group" *ngIf="selectedOrder.paymentMethod">
              <label>Méthode de paiement:</label>
              <p>{{ selectedOrder.paymentMethod }}</p>
            </div>
            <div class="detail-group" *ngIf="selectedOrder.deliveryNotes">
              <label>Notes de livraison:</label>
              <p>{{ selectedOrder.deliveryNotes }}</p>
            </div>
            <div class="detail-group">
              <label>Articles commandés:</label>
              <div class="order-items">
                <div class="order-item" *ngFor="let item of selectedOrder.items">
                  <div class="item-info">
                    <span class="item-name">{{ item.productName }}</span>
                    <span class="item-details">Quantité: {{ item.quantity }} × {{ item.price | number:'1.0-2' }} TND</span>
                  </div>
                  <div class="item-total">{{ (item.price * item.quantity) | number:'1.0-2' }} TND</div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeOrderDetails()">
              <span class="btn-icon">✕</span>
              Fermer
            </button>
          </div>
        </div>
      </div>

      <div class="orders-stats">
        <div class="stat-item">
          <span class="stat-icon">📊</span>
          <span class="stat-text">{{ filteredOrders.length }} commande(s)</span>
        </div>
        <div class="stat-item" *ngIf="totalAmount > 0">
          <span class="stat-icon">💰</span>
          <span class="stat-text">Total: {{ totalAmount | number:'1.0-2' }} TND</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      padding: 2rem;
      animation: fadeInUp 0.6s ease-out;
    }

    .orders-header {
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 2rem;
      color: #00ff88;
      margin: 0;
      font-family: 'Space Mono', monospace;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .title-icon {
      font-size: 2.5rem;
    }

    /* Filters Section */
    .filters-section {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 255, 136, 0.02) 100%);
      border: 1px solid rgba(0, 255, 136, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr auto;
      gap: 1rem;
      align-items: flex-end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-size: 0.85rem;
      color: rgba(0, 255, 136, 0.8);
      font-weight: 600;
      font-family: 'Space Mono', monospace;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .filter-input {
      padding: 0.8rem;
      border: 2px solid rgba(0, 255, 136, 0.3);
      border-radius: 6px;
      background: rgba(0, 255, 136, 0.05);
      color: #00ff88;
      font-family: 'Space Mono', monospace;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .filter-input:focus {
      outline: none;
      border-color: #00ff88;
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
      background: rgba(0, 255, 136, 0.1);
    }

    .filter-input::placeholder {
      color: rgba(0, 255, 136, 0.5);
    }

    /* Buttons */
    .btn {
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-family: 'Space Mono', monospace;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-icon {
      font-size: 1.1rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
      color: #0a0e27;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 255, 136, 0.4);
    }

    .btn-secondary {
      background: rgba(0, 255, 136, 0.2);
      color: #00ff88;
      border: 1px solid rgba(0, 255, 136, 0.4);
    }

    .btn-secondary:hover {
      background: rgba(0, 255, 136, 0.3);
      border-color: rgba(0, 255, 136, 0.6);
    }

    .btn-small {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    /* Orders Table */
    .orders-table-container {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.03) 0%, rgba(0, 255, 136, 0.01) 100%);
      border: 1px solid rgba(0, 255, 136, 0.15);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 2rem;
    }

    .orders-table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'Space Mono', monospace;
      table-layout: fixed;
    }

    .orders-table thead {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.08) 100%);
    }

    .orders-table thead th {
      padding: 1rem;
      text-align: left;
      color: #00ff88;
      font-weight: 700;
      border-bottom: 2px solid rgba(0, 255, 136, 0.3);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .col-icon {
      font-size: 1.1rem;
      margin-right: 0.3rem;
    }

    .orders-table tbody tr {
      border-bottom: 1px solid rgba(0, 255, 136, 0.1);
      transition: all 0.3s ease;
    }

    .orders-table tbody tr:hover {
      background: rgba(0, 255, 136, 0.08);
    }

    .orders-table tbody tr.even {
      background: rgba(0, 255, 136, 0.03);
    }

    .orders-table tbody td {
      padding: 1rem;
      color: rgba(0, 255, 136, 0.9);
      font-size: 0.9rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .col-date {
      width: 100px;
    }

    .col-client {
      width: 150px;
    }

    .col-email {
      width: 220px;
    }

    .col-amount {
      width: 120px;
      text-align: right;
      color: #00ff88;
      font-weight: 600;
    }

    .col-actions {
      width: 80px;
      text-align: center;
    }

    /* Empty State */
    .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      color: rgba(0, 255, 136, 0.7);
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: #00ff88;
      font-family: 'Space Mono', monospace;
      margin: 0.5rem 0;
    }

    .empty-state p {
      margin: 0.5rem 0 1.5rem 0;
      font-size: 0.95rem;
    }

    /* Stats */
    .orders-stats {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      background: rgba(0, 255, 136, 0.1);
      padding: 1rem 1.5rem;
      border-radius: 8px;
      border: 1px solid rgba(0, 255, 136, 0.2);
    }

    .stat-icon {
      font-size: 1.5rem;
    }

    .stat-text {
      color: #00ff88;
      font-family: 'Space Mono', monospace;
      font-weight: 600;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeInUp 0.3s ease-out;
    }

    .modal-content {
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(26, 26, 62, 0.95) 100%);
      border: 2px solid rgba(0, 255, 136, 0.3);
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 0 40px rgba(0, 255, 136, 0.3), inset 0 0 20px rgba(0, 255, 136, 0.1);
      backdrop-filter: blur(10px);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 2px solid rgba(0, 255, 136, 0.2);
    }

    .modal-header h2 {
      margin: 0;
      color: #00ff88;
      font-family: 'Space Mono', monospace;
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      color: #00ff88;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      transform: scale(1.2);
      color: #00cc6a;
    }

    .modal-body {
      padding: 2rem;
      max-height: 400px;
      overflow-y: auto;
    }

    .detail-group {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(0, 255, 136, 0.1);
    }

    .detail-group:last-child {
      border-bottom: none;
    }

    .detail-group label {
      display: block;
      color: rgba(0, 255, 136, 0.8);
      font-weight: 600;
      font-family: 'Space Mono', monospace;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .detail-group p {
      margin: 0;
      color: #00ff88;
      font-family: 'Space Mono', monospace;
      font-size: 1rem;
    }

    .detail-group p.amount {
      font-weight: 600;
      font-size: 1.2rem;
    }

    .order-items {
      margin-top: 1rem;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem;
      background: rgba(0, 255, 136, 0.05);
      border: 1px solid rgba(0, 255, 136, 0.2);
      border-radius: 6px;
      margin-bottom: 0.5rem;
    }

    .order-item:last-child {
      margin-bottom: 0;
    }

    .item-info {
      flex: 1;
    }

    .item-name {
      display: block;
      color: #00ff88;
      font-weight: 600;
      font-family: 'Space Mono', monospace;
      margin-bottom: 0.3rem;
    }

    .item-details {
      display: block;
      color: rgba(0, 255, 136, 0.7);
      font-size: 0.9rem;
      font-family: 'Space Mono', monospace;
    }

    .item-total {
      color: #00ff88;
      font-weight: 600;
      font-family: 'Space Mono', monospace;
      font-size: 1rem;
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 2px solid rgba(0, 255, 136, 0.2);
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class OrdersHistoryComponent implements OnInit {
  orders: OrderDetail[] = [];
  filteredOrders: OrderDetail[] = [];
  totalAmount = 0;
  selectedOrder: OrderDetail | null = null;

  filters = {
    clientName: '',
    dateFrom: '',
    dateTo: ''
  };

  constructor() {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const ordersCol = collection(db, 'orders');
    const usersCol = collection(db, 'users');

    getDocs(ordersCol).then((orderSnap) => {
      this.orders = orderSnap.docs.map(doc => {
        const data = doc.data() as any;
        console.log('Order data:', data); // Debug log
        
        return {
          id: doc.id,
          clientName: data.name || data.clientName || 'Loading...',
          clientEmail: data.email || data.clientEmail || 'Loading...',
          totalAmount: Number(data.totalAmount || data.total_amount || 0),
          orderDate: data.orderDate || data.created_at || new Date().toISOString(),
          createdAt: data.createdAt,
          userId: data.userId,
          status: data.status || 'Complétée',
          items: data.items || [],
          phone: data.phone || '',
          address: data.address || '',
          paymentMethod: data.paymentMethod || '',
          deliveryNotes: data.deliveryNotes || ''
        };
      });

      // Sort orders by date in descending order (most recent first)
      this.orders.sort((a, b) => {
        // Use orderDate if available, otherwise createdAt
        const dateA = new Date(a.orderDate || a.createdAt || 0);
        const dateB = new Date(b.orderDate || b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });

      this.filteredOrders = [...this.orders];
      this.calculateTotal();
    }).catch(error => {
      console.error('Error loading orders:', error);
    });
  }

  filterOrders(): void {
    this.filteredOrders = this.orders.filter(order => {
      const clientMatch = !this.filters.clientName ||
        order.clientName.toLowerCase().includes(this.filters.clientName.toLowerCase());

      const orderDateObj = new Date(order.orderDate);
      const dateFromObj = this.filters.dateFrom ? new Date(this.filters.dateFrom) : null;
      const dateToObj = this.filters.dateTo ? new Date(this.filters.dateTo) : null;

      const dateMatch = (!dateFromObj || orderDateObj >= dateFromObj) &&
                        (!dateToObj || orderDateObj <= dateToObj);

      return clientMatch && dateMatch;
    });

    // Maintain sorting order in filtered results
    this.filteredOrders.sort((a, b) => {
      const dateA = this.parseCreatedAtDate(a.createdAt);
      const dateB = this.parseCreatedAtDate(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    this.calculateTotal();
  }

  clearFilters(): void {
    this.filters = {
      clientName: '',
      dateFrom: '',
      dateTo: ''
    };
    this.filteredOrders = [...this.orders];
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalAmount = this.filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  trackByOrderId(index: number, order: OrderDetail): string {
    return order.id;
  }

  viewOrderDetails(order: OrderDetail): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  parseCreatedAtDate(createdAt: string): Date {
    if (!createdAt) return new Date(0);
    
    try {
      // Handle format: "22 February 2026 at 01:25:05 UTC+1"
      const match = createdAt.match(/(\d{1,2})\s+(\w+)\s+(\d{4})\s+at\s+(\d{2}):(\d{2}):(\d{2})\s+UTC([+-]\d+)/);
      if (match) {
        const [, day, month, year, hours, minutes, seconds, timezone] = match;
        const monthNames: { [key: string]: number } = {
          'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
          'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        const monthIndex = monthNames[month];
        if (monthIndex !== undefined) {
          const date = new Date();
          date.setFullYear(parseInt(year), monthIndex, parseInt(day));
          date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds), 0);
          // Adjust for timezone offset
          const offsetHours = parseInt(timezone);
          date.setHours(date.getHours() - offsetHours);
          return date;
        }
      }
      
      // Try parsing as ISO string
      const isoDate = new Date(createdAt);
      if (!isNaN(isoDate.getTime())) {
        return isoDate;
      }
      
      // Fallback
      return new Date(0);
    } catch {
      return new Date(0);
    }
  }
}
