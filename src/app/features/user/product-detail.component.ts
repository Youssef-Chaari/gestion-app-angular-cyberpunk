import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService, Product } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { PopupService } from '../../shared/components/popup/popup.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div *ngIf="product" class="product-detail">
      <div class="detail-container">
        <div class="image-section">
          <img *ngIf="product.image" [src]="product.image" class="product-image" alt="{{ product.name }}">
          <div *ngIf="!product.image" class="no-image">Pas d'image disponible</div>
        </div>
        <div class="info-section">
          <h2>{{ product.name }}</h2>
          <p class="category">{{ product.category_name }}</p>
          <p class="price">{{ product.price | number:'1.2-2' }} TND</p>
          <p class="description" *ngIf="product.description">{{ product.description }}</p>
          <div class="actions">
            <button class="btn" (click)="addToCart()">Ajouter au panier</button>
            <a routerLink="/shop/cart" class="btn">Voir le panier</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-detail {
      padding: 2rem;
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(255, 0, 127, 0.1) 100%);
      border-radius: 8px;
      border: 1px solid rgba(0, 255, 136, 0.3);
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.1);
    }

    .detail-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .image-section {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      padding: 2rem;
      border: 2px solid rgba(0, 255, 136, 0.2);
      min-height: 400px;
    }

    .product-image {
      max-width: 100%;
      max-height: 400px;
      border-radius: 8px;
      box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
    }

    .no-image {
      color: rgba(0, 255, 136, 0.5);
      font-size: 1.1rem;
    }

    .info-section h2 {
      color: #00ff88;
      font-size: 2rem;
      margin-bottom: 0.5rem;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
    }

    .category {
      color: #ff007f;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .price {
      color: #00ff88;
      font-size: 1.8rem;
      font-weight: bold;
      margin-bottom: 1rem;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }

    .description {
      color: #cccccc;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: 2px solid #00ff88;
      background: rgba(0, 255, 136, 0.1);
      color: #00ff88;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }

    .btn:hover {
      background: rgba(0, 255, 136, 0.2);
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .detail-container {
        grid-template-columns: 1fr;
      }

      .image-section {
        min-height: 300px;
      }

      .product-image {
        max-height: 300px;
      }

      .info-section h2 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;

  constructor(private route: ActivatedRoute, private productService: ProductService, private cart: CartService, private popupService: PopupService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.productService.getProduct(id).subscribe({
        next: (data) => {
          const p = Array.isArray(data) ? data[0] : (data.data ? data.data[0] : data);
          if (p) {
            this.product = { 
              ...p, 
              price: Number(p.price) 
            };
            console.log('Product loaded:', this.product);
          }
        },
        error: (err) => console.error('Error loading product', err)
      });
    }
  }

  addToCart() {
    if (this.product) {
      this.cart.add(this.product, 1);
      this.popupService.showSuccess('Produit ajouté au panier');
    }
  }
}
