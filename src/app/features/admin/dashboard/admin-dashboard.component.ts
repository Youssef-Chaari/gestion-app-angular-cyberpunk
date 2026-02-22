import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';

interface DashboardStats {
  salesThisMonth: number;
  totalProducts: number;
  totalCategories: number;
  salesData: { month: string; amount: number }[];
  productsByType: { type: string; count: number }[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <h1 class="page-title">📊 Dashboard Admin</h1>
            <div class="quick-actions">
        <a routerLink="/admin/orders" class="action-card">
          <div class="action-icon">📋</div>
          <div class="action-content">
            <h3>Consulter l'historique</h3>
            <p>Voir l'historique des commandes</p>
          </div>
          <div class="action-arrow">→</div>
        </a>
      </div>
            <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-label">Ventes ce mois</div>
            <div class="stat-value">{{ stats.salesThisMonth | currency:'USD':'symbol':'1.2-2' }}</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <div class="stat-label">Total Produits</div>
            <div class="stat-value">{{ stats.totalProducts }}</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🏷️</div>
          <div class="stat-content">
            <div class="stat-label">Total Catégories</div>
            <div class="stat-value">{{ stats.totalCategories }}</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h2>📈 Informations Récentes</h2>
        <p><strong>Derniers 3 mois:</strong></p>
        <ul>
          <li *ngFor="let data of stats.salesData">
            {{ data.month }}: {{ data.amount | currency:'USD':'symbol':'1.0-0' }}
          </li>
        </ul>
        <p><strong>Produits par type:</strong></p>
        <ul>
          <li *ngFor="let type of stats.productsByType">
            {{ type.type }}: {{ type.count }} produits
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
    }

    .page-title {
      font-size: 2rem;
      color: #00ff88;
      margin: 0 0 2rem 0;
      font-family: 'Space Mono', monospace;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.05) 100%);
      border: 2px solid rgba(0, 255, 136, 0.3);
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
      color: inherit;
    }

    .action-card:hover {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.08) 100%);
      border-color: #00ff88;
      transform: translateX(4px);
      box-shadow: 0 6px 20px rgba(0, 255, 136, 0.2);
    }

    .action-icon {
      font-size: 2.5rem;
      flex-shrink: 0;
    }

    .action-content {
      flex: 1;
    }

    .action-content h3 {
      margin: 0 0 0.5rem 0;
      color: #00ff88;
      font-family: 'Space Mono', monospace;
      font-size: 1.1rem;
    }

    .action-content p {
      margin: 0;
      color: rgba(0, 255, 136, 0.7);
      font-size: 0.9rem;
    }

    .action-arrow {
      font-size: 1.5rem;
      color: #00ff88;
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }

    .action-card:hover .action-arrow {
      transform: translateX(4px);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 255, 136, 0.02) 100%);
      border: 1px solid rgba(0, 255, 136, 0.2);
      border-radius: 12px;
    }

    .stat-icon {
      font-size: 2rem;
    }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      color: rgba(0, 255, 136, 0.7);
      font-size: 0.85rem;
      margin-bottom: 0.3rem;
    }

    .stat-value {
      color: #00ff88;
      font-size: 1.8rem;
      font-weight: 700;
      font-family: 'Space Mono', monospace;
    }

    .info-section {
      background: rgba(0, 255, 136, 0.05);
      border: 1px solid rgba(0, 255, 136, 0.15);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .info-section h2 {
      color: #00ff88;
      font-family: 'Space Mono', monospace;
      margin-top: 0;
    }

    .info-section ul {
      list-style: none;
      padding: 0;
    }

    .info-section li {
      padding: 0.5rem 0;
      color: rgba(0, 255, 136, 0.8);
      border-bottom: 1px solid rgba(0, 255, 136, 0.1);
    }

    .info-section li:last-child {
      border-bottom: none;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    salesThisMonth: 0,
    totalProducts: 0,
    totalCategories: 0,
    salesData: [],
    productsByType: []
  };

  constructor(
    private dashboardService: DashboardService,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load products and categories count
    this.productService.getProducts().subscribe((products: any) => {
      this.stats.totalProducts = products.length;
    });

    this.categoryService.getCategories().subscribe((categories: any) => {
      this.stats.totalCategories = categories.length;
    });

    // Generate mock sales data for last 3 months
    const now = new Date();
    const salesData: any[] = [];
    for (let i = 2; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      salesData.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        amount: Math.floor(Math.random() * 5000) + 2000
      });
    }
    this.stats.salesData = salesData;
    this.stats.salesThisMonth = salesData[salesData.length - 1].amount;

    // Generate product by type data (mock)
    this.stats.productsByType = [
      { type: 'Electronics', count: 15 },
      { type: 'Clothing', count: 25 },
      { type: 'Books', count: 12 },
      { type: 'Home', count: 18 }
    ];
  }
}
