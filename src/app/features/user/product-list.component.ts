import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="shop">
      <h2>Catalogue</h2>
      <div class="grid">
        <div class="card" *ngFor="let p of products">
          <h3>{{p.name}}</h3>
          <p>{{p.category_name}}</p>
          <p>Prix: {{p.price | number:'1.2-2'}} TND</p>
          <div class="actions">
            <a [routerLink]="['/shop','product',p.id]" class="btn">Voir</a>
            <button class="btn" (click)="addToCart(p)">Ajouter</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService, private cart: CartService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        const payload = Array.isArray(data) ? data : (data.data || []);
        this.products = payload.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          category_id: p.category_id,
          description: p.description,
          category_name: p.category_name
        }));
      },
      error: () => {
        this.products = [];
      }
    });
  }

  addToCart(p: Product) {
    this.cart.add(p, 1);
    alert(`${p.name} ajouté au panier`);
  }
}
