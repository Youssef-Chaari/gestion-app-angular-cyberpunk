import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="product-catalog">
      <!-- Header Section -->
      <div class="catalog-header">
        <div class="header-content">
          <h1 class="catalog-title">
            <span class="title-icon">⚡</span>
            CATALOGUE PRODUITS
          </h1>
          <p class="catalog-subtitle">Découvrez notre sélection high-tech</p>
        </div>

        <!-- Search and Filter -->
        <div class="catalog-controls">
          <div class="search-box">
            <input type="text"
                   [(ngModel)]="searchTerm"
                   (input)="filterProducts()"
                   placeholder="Rechercher un produit..."
                   class="search-input">
            <span class="search-icon">🔍</span>
          </div>

          <select [(ngModel)]="selectedCategory"
                  (change)="filterProducts()"
                  class="category-filter">
            <option value="">Toutes les catégories</option>
            <option *ngFor="let category of categories" [value]="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="catalog-stats">
        <div class="stat-item">
          <span class="stat-icon">📦</span>
          <span class="stat-text">{{ filteredProducts.length }} produits</span>
        </div>
        <div class="stat-item" *ngIf="selectedCategory">
          <span class="stat-icon">🏷️</span>
          <span class="stat-text">Filtré par catégorie</span>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="products-grid" *ngIf="filteredProducts.length > 0; else noProducts">
        <div class="product-card"
             *ngFor="let product of filteredProducts; trackBy: trackByProductId"
             [class.featured]="product.price > 1000">

          <div class="card-header">
            <div class="product-category">
              <span class="category-badge">
                {{ product.category_name || 'Général' }}
              </span>
            </div>
          </div>

          <div class="card-image" *ngIf="product.image">
            <img [src]="product.image" alt="{{ product.name }}" class="product-img">
          </div>

          <div class="card-body">
            <h3 class="product-name">{{ product.name }}</h3>

            <div class="product-price">
              <div class="price-main">
                <span class="price-amount">{{ product.price | number:'1.0-0' }}</span>
                <span class="price-currency">TND</span>
              </div>
              <div class="price-subtitle">TTC</div>
            </div>

            <div class="product-description" *ngIf="product.description">
              {{ product.description }}
            </div>
          </div>

          <!-- Stock Status -->
          <div class="product-stock" [class.out-of-stock]="!(product.stock && product.stock > 0)">
            <span class="stock-icon" *ngIf="product.stock && product.stock > 0">✅</span>
            <span class="stock-icon" *ngIf="!(product.stock && product.stock > 0)">❌</span>
            <span class="stock-label" *ngIf="product.stock && product.stock > 0">PRODUIT EN STOCK</span>
            <span class="stock-label" *ngIf="!(product.stock && product.stock > 0)">PRODUIT HORS STOCK</span>
          </div>

          <div class="card-actions">
            <button class="btn btn-secondary btn-view"
                    [routerLink]="['/shop', 'product', product.id]"
                    title="Voir les détails">
              <span class="btn-icon">👁️</span>
              <span class="btn-text">DÉTAILS</span>
            </button>

            <button class="btn btn-primary btn-add-cart"
                    (click)="addToCart(product)"
                    [disabled]="!(product.stock && product.stock > 0)"
                    [title]="(product.stock && product.stock > 0) ? 'Ajouter au panier' : 'Produit hors stock'">
              <span class="btn-icon">🛒</span>
              <span class="btn-text">{{ (product.stock && product.stock > 0) ? 'AJOUTER' : 'HORS STOCK' }}</span>
            </button>
          </div>

          <!-- Hover effect overlay -->
          <div class="card-overlay"></div>
        </div>
      </div>

      <!-- Empty State -->
      <ng-template #noProducts>
        <div class="empty-catalog">
          <div class="empty-content">
            <div class="empty-icon">📦</div>
            <h3>Aucun produit trouvé</h3>
            <p *ngIf="searchTerm || selectedCategory">
              Aucun produit ne correspond à vos critères de recherche.
            </p>
            <p *ngIf="!searchTerm && !selectedCategory">
              Notre catalogue est actuellement vide.
            </p>
            <button class="btn btn-primary" (click)="clearFilters()" *ngIf="searchTerm || selectedCategory">
              <span class="btn-icon">🔄</span>
              Effacer les filtres
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .product-catalog {
      animation: fadeInUp 0.6s ease-out;
    }

    /* Header Section */
    .catalog-header {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 255, 136, 0.02) 100%);
      border-radius: 12px;
      border: 1px solid rgba(0, 255, 136, 0.2);
      padding: 2rem;
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
    }

    .catalog-header::before {
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
      margin-bottom: 2rem;
    }

    .catalog-title {
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

    .catalog-subtitle {
      color: rgba(0, 255, 136, 0.7);
      font-size: 1.1rem;
      margin: 0;
      font-family: 'Space Mono', monospace;
      letter-spacing: 1px;
    }

    .catalog-controls {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-box {
      position: relative;
      flex: 1;
      max-width: 400px;
    }

    .search-input {
      width: 100%;
      padding: 1rem 3rem 1rem 1rem;
      border: 2px solid rgba(0, 255, 136, 0.3);
      border-radius: 8px;
      background: rgba(0, 255, 136, 0.05);
      color: #00ff88;
      font-family: 'Space Mono', monospace;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .search-input::placeholder {
      color: rgba(0, 255, 136, 0.5);
    }

    .search-input:focus {
      outline: none;
      border-color: #00ff88;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
      background: rgba(0, 255, 136, 0.1);
    }

    .search-icon {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(0, 255, 136, 0.7);
      font-size: 1.2rem;
    }

    .category-filter {
      padding: 1rem;
      border: 2px solid rgba(0, 255, 136, 0.3);
      border-radius: 8px;
      background: rgba(0, 255, 136, 0.05);
      color: #00ff88;
      font-family: 'Space Mono', monospace;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 200px;
    }

    .category-filter:focus {
      outline: none;
      border-color: #00ff88;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
    }

    /* Stats Bar */
    .catalog-stats {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.8) 0%, rgba(26, 26, 62, 0.8) 100%);
      border: 1px solid rgba(0, 255, 136, 0.3);
      border-radius: 20px;
      font-family: 'Space Mono', monospace;
      color: rgba(0, 255, 136, 0.8);
    }

    .stat-icon {
      font-size: 1.2rem;
    }

    /* Products Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .product-card {
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.9) 0%, rgba(26, 26, 62, 0.9) 100%);
      border: 1px solid rgba(0, 255, 136, 0.3);
      border-radius: 12px;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .product-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #00ff88, #ff006e);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0, 255, 136, 0.2);
      border-color: #00ff88;
    }

    .product-card:hover::before {
      opacity: 1;
    }

    .product-card.featured {
      border-color: #ff006e;
      box-shadow: 0 0 20px rgba(255, 0, 110, 0.3);
    }

    .product-card.featured::before {
      background: linear-gradient(90deg, #ff006e, #00ff88);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .category-badge {
      background: linear-gradient(135deg, rgba(255, 0, 110, 0.2) 0%, rgba(255, 0, 110, 0.1) 100%);
      color: #ff006e;
      padding: 0.5rem 1rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
      border: 1px solid rgba(255, 0, 110, 0.3);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .product-id {
      font-size: 0.75rem;
      color: rgba(0, 255, 136, 0.6);
      font-family: 'Space Mono', monospace;
    }

    .card-image {
      width: 100%;
      height: 200px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 1rem;
      background: rgba(0, 255, 136, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    .card-body {
      margin-bottom: 1.5rem;
    }

    .product-name {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.3rem;
      color: #00ff88;
      margin: 0 0 1rem 0;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
      line-height: 1.3;
    }

    .product-price {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .price-main {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }

    .price-amount {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.8rem;
      color: #00ff88;
      font-weight: 700;
      text-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
    }

    .price-currency {
      font-size: 1rem;
      color: rgba(0, 255, 136, 0.7);
      font-weight: 600;
    }

    .price-subtitle {
      font-size: 0.8rem;
      color: rgba(0, 255, 136, 0.6);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .product-description {
      color: rgba(0, 255, 136, 0.8);
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0;
    }

    /* Stock Info */
    .product-stock {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      margin: 1rem 0;
      background: rgba(0, 255, 136, 0.1);
      border-left: 3px solid #00ff88;
      border-radius: 4px;
      font-size: 0.9rem;
      font-weight: 600;
      color: #00ff88;
    }

    .product-stock.out-of-stock {
      background: rgba(255, 0, 110, 0.1);
      border-left-color: #ff006e;
      color: #ff006e;
    }

    .stock-icon {
      font-size: 1rem;
    }

    .stock-label {
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .card-actions {
      display: flex;
      gap: 1rem;
    }

    .card-actions .btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .card-actions .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }

    .card-actions .btn:hover::before {
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

    .btn-primary:disabled {
      background: linear-gradient(135deg, #666, #555);
      color: #999;
      border-color: #666;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .btn-primary:disabled:hover {
      transform: none;
      box-shadow: none;
    }

    .card-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, transparent 50%);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    .product-card:hover .card-overlay {
      opacity: 1;
    }

    /* Empty State */
    .empty-catalog {
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
    @media (max-width: 768px) {
      .catalog-header {
        padding: 1.5rem;
      }

      .catalog-title {
        font-size: 2rem;
      }

      .catalog-controls {
        flex-direction: column;
        gap: 1rem;
      }

      .search-box {
        max-width: none;
      }

      .products-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .product-card {
        padding: 1.25rem;
      }

      .card-actions {
        flex-direction: column;
      }

      .card-actions .btn {
        padding: 1rem;
      }
    }

    @media (max-width: 480px) {
      .catalog-title {
        font-size: 1.5rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .catalog-stats {
        flex-direction: column;
        gap: 1rem;
      }

      .stat-item {
        justify-content: center;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: any[] = [];
  searchTerm = '';
  selectedCategory = '';

  constructor(private productService: ProductService, private cart: CartService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProductsWithCategories().subscribe({
      next: (data: any) => {
        const payload = data.products || [];
        this.products = payload.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          category_id: p.categoryId || p.category_id,
          description: p.description,
          category_name: p.category_name,
          stock: p.stock || 0,
          image: p.image
        }));
        this.filteredProducts = [...this.products];
        
        // Also load categories for the filter dropdown
        this.categories = data.categories || [];
      },
      error: () => {
        this.products = [];
        this.filteredProducts = [];
        this.categories = [];
      }
    });
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = !this.selectedCategory ||
        product.category_id.toString() === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.filterProducts();
  }

  addToCart(product: Product): void {
    this.cart.add(product, 1);
    // You could add a toast notification here
    this.showNotification(`${product.name} ajouté au panier !`);
  }

  showNotification(message: string): void {
    // Simple notification - you could enhance this with a proper toast service
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #00ff88, #00cc6a);
      color: #0a0e27;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
      z-index: 1000;
      animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }

  trackByProductId(index: number, product: Product): any {
    return product.id;
  }
}
