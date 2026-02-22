import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../core/services/auth.service';
import { FirestoreOrderService } from '../../core/services/firestore-order.service';
import { environment } from '../../../environments/environment';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, doc, getDoc, getFirestore } from 'firebase/firestore';

interface Order {
  id: string;
  created_at: string | any;
  total: number;
  items: OrderItem[];
  clientName?: string;
  clientEmail?: string;
  status?: string;
  phone?: string;
  address?: string;
  paymentMethod?: string;
  deliveryNotes?: string;
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
              <span class="info-value">{{ getUserDisplayName() }}</span>
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
              <span class="info-value">{{ memberSince }}</span>
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
                <button class="btn btn-secondary btn-details" (click)="viewOrderDetails(order)" title="Voir les détails">
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
              <p>{{ formatDate(selectedOrder.created_at) }}</p>
            </div>
            <div class="detail-group" *ngIf="selectedOrder.clientName">
              <label>Nom du client:</label>
              <p>{{ selectedOrder.clientName }}</p>
            </div>
            <div class="detail-group" *ngIf="selectedOrder.clientEmail">
              <label>Email:</label>
              <p>{{ selectedOrder.clientEmail }}</p>
            </div>
            <div class="detail-group">
              <label>Montant total:</label>
              <p class="amount">{{ selectedOrder.total | number:'1.0-2' }} TND</p>
            </div>
            <div class="detail-group" *ngIf="selectedOrder.status">
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
export class ProfileComponent implements OnInit {
  orders: Order[] = [];
  currentUser: User | null = null;
  selectedOrder: Order | null = null;
  memberSince = 'Inconnu';
  private db: Firestore;

  constructor(private authService: AuthService, private ordersService: FirestoreOrderService) {
    const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase);
    this.db = getFirestore(firebaseApp);

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.memberSince = this.getMemberSince();
      console.log('Profile - Current user:', user);
      console.log('Profile - uid:', (user as any)?.uid);
      console.log('Profile - id:', user?.id);
      if (user) {
        this.loadMemberSinceFromFirestore(user);

        // Use Firebase UID if available, otherwise use id
        const userId = (user as any).uid || user.id;
        if (userId) {
          console.log('Profile - Loading orders for userId:', userId);
          this.loadOrdersForUser(userId.toString());
        } else {
          console.log('Profile - No userId found!');
          this.orders = [];
        }
      } else {
        console.log('Profile - No current user');
        this.orders = [];
      }
    });
  }

  ngOnInit(): void {
    // orders will be loaded via Firestore when user is available
  }

  private loadOrdersForUser(userId: string) {
    console.log('➤ Starting to load orders for userId:', userId);
    
    // First, load ALL orders to see what exists in Firestore
    this.ordersService.getAllOrders().subscribe({
      next: (allOrders) => {
        console.log('📊 ALL ORDERS IN FIRESTORE:', allOrders);
        console.log('📊 User ID we are looking for:', userId);
        
        // Filter orders for this user
        const userOrders = allOrders.filter(o => {
          const match = o.userId === userId;
          console.log(`Checking order ${o.id}: userId="${o.userId}" vs "${userId}" = ${match}`);
          return match;
        });
        
        console.log('✓ Filtered orders for this user:', userOrders);
        console.log('✓ Number of orders found:', userOrders.length);
        
        // Normalize created_at to string for existing UI helpers
        this.orders = userOrders.map(o => {
          console.log('Processing order:', o);
          return {
            id: o.id,
            created_at: o.createdAt || o.orderDate || o.created_at || new Date().toISOString(),
            total: o.totalAmount || o.total || (o.items ? o.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) : 0),
            items: o.items || [],
            clientName: o.name || o.clientName || '',
            clientEmail: o.email || o.clientEmail || '',
            status: o.status || 'Complétée',
            phone: o.phone || '',
            address: o.address || '',
            paymentMethod: o.paymentMethod || '',
            deliveryNotes: o.deliveryNotes || ''
          };
        });
        
        // Sort orders by created_at in descending order (most recent first)
        this.orders.sort((a, b) => {
          const dateA = this.parseCreatedAtDate(a.created_at);
          const dateB = this.parseCreatedAtDate(b.created_at);
          return dateB.getTime() - dateA.getTime();
        });
        
        console.log('✓ Final orders array:', this.orders);
      },
      error: (err) => {
        console.error('✗ Failed to load orders from Firestore:', err);
        // fallback to local storage if Firestore fails
        const raw = localStorage.getItem('app_orders');
        this.orders = raw ? JSON.parse(raw) : [];
        console.log('✓ Using fallback from localStorage:', this.orders);
      }
    });
  }

  getRoleLabel(role: string): string {
    return role === 'admin' ? 'Administrateur' : 'Utilisateur';
  }

  getRoleClass(role: string): string {
    return role === 'admin' ? 'admin' : 'user';
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'N/A';
    
    const firstName = (this.currentUser as any).firstName || '';
    const lastName = (this.currentUser as any).lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return fullName || this.currentUser.email || 'Utilisateur';
  }

  getMemberSince(): string {
    if (!this.currentUser) return 'Inconnu';

    const u: any = this.currentUser as any;
    const candidates = [
      u.createdAt,
      u.created_at,
      u.dateCreated,
      u.registeredAt,
      u.joinedAt,
      (u.metadata && u.metadata.creationTime) || null,
      (u.metadata && u.metadata.createdAt) || null,
      u.creationTime
    ];

    let dateVal: any = null;
    for (const c of candidates) {
      if (c !== undefined && c !== null) {
        dateVal = c;
        break;
      }
    }

    if (!dateVal) return 'Inconnu';

    // ISO from DB: "2026-02-22T01:09:18.518Z" -> "2026-02-22"
    if (typeof dateVal === 'string') {
      const isoDatePrefix = String(dateVal).match(/^(\d{4}-\d{2}-\d{2})/);
      if (isoDatePrefix && isoDatePrefix[1]) return isoDatePrefix[1];
    }

    try {
      // Firestore Timestamp
      if (dateVal && typeof dateVal === 'object' && typeof dateVal.toDate === 'function') {
        const d = dateVal.toDate();
        return d.toISOString().slice(0, 10);
      }

      // numeric timestamp (seconds or ms)
      if (typeof dateVal === 'number') {
        const ts = dateVal < 1e12 ? dateVal * 1000 : dateVal;
        const d = new Date(ts);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      }

      // try parsing ISO or other string formats
      const parsed = new Date(String(dateVal));
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
      }
    } catch (e) {
      console.warn('getMemberSince: failed to parse date', dateVal, e);
    }

    return 'Inconnu';
  }

  private async loadMemberSinceFromFirestore(user: User): Promise<void> {
    if (this.memberSince !== 'Inconnu') return;

    const uid = (user as any)?.uid || user?.id;
    if (!uid) return;

    try {
      const userRef = doc(this.db, 'users', String(uid));
      const snapshot = await getDoc(userRef);
      if (!snapshot.exists()) return;

      const data: any = snapshot.data();
      const dateVal = data?.created_at ?? data?.createdAt ?? null;
      if (!dateVal) return;

      const formatted = this.formatMemberSinceValue(dateVal);
      if (formatted !== 'Inconnu') {
        this.memberSince = formatted;
      }
    } catch (error) {
      console.warn('Profile - Unable to load member date from Firestore', error);
    }
  }

  private formatMemberSinceValue(dateVal: any): string {
    if (!dateVal) return 'Inconnu';

    if (typeof dateVal === 'string') {
      const isoDatePrefix = String(dateVal).match(/^(\d{4}-\d{2}-\d{2})/);
      if (isoDatePrefix && isoDatePrefix[1]) return isoDatePrefix[1];
    }

    try {
      if (dateVal && typeof dateVal === 'object' && typeof dateVal.toDate === 'function') {
        const d = dateVal.toDate();
        return d.toISOString().slice(0, 10);
      }

      if (typeof dateVal === 'number') {
        const ts = dateVal < 1e12 ? dateVal * 1000 : dateVal;
        const d = new Date(ts);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      }

      const parsed = new Date(String(dateVal));
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
      }
    } catch (error) {
      console.warn('formatMemberSinceValue: failed to parse date', dateVal, error);
    }

    return 'Inconnu';
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

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  trackByOrderId(index: number, order: Order): string {
    return order.id;
  }

  parseCreatedAtDate(createdAt: any): Date {
    if (!createdAt) return new Date(0);
    
    try {
      // Handle Firestore Timestamp
      if (createdAt && typeof createdAt === 'object' && createdAt.toDate) {
        return createdAt.toDate();
      }
      
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
