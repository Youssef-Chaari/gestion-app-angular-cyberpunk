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
      <h2>{{ product.name }}</h2>
      <p>{{ product.category_name }}</p>
      <p>Prix: {{ product.price | number:'1.2-2' }} TND</p>
      <p>{{ product.description }}</p>
      <div>
        <button class="btn" (click)="addToCart()">Ajouter au panier</button>
        <a routerLink="/shop/cart" class="btn">Voir le panier</a>
      </div>
    </div>
  `
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
            this.product = { id: p.id, name: p.name, price: Number(p.price), category_id: p.category_id, description: p.description, category_name: p.category_name };
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
