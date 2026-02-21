import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../core/services/product.service';
import { CategoryService, Category } from '../../core/services/category.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="products">
      <div class="list-header">
        <h2>📦 PRODUITS</h2>
        <button class="btn btn-primary" (click)="openForm()">+ AJOUTER</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>NOM</th>
            <th>CATÉGORIE</th>
            <th>PRIX</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let product of products">
            <td>{{ product.name | uppercase }}</td>
            <td>{{ product.category_name ? (product.category_name | uppercase) : ('CATÉGORIE ' + product.category_id) }}</td>
            <td>TND{{ product.price | number: '1.2-2' }}</td>
            <td>
              <button class="btn btn-small btn-edit" (click)="editProduct(product)">MODIFIER</button>
              <button class="btn btn-small btn-delete" (click)="deleteProduct(product.id)">SUPPRIMER</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="showForm" class="modal active">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editingId ? 'MODIFIER' : 'AJOUTER' }} UN PRODUIT</h2>
            <button class="close-btn" (click)="closeForm()">✕</button>
          </div>
          <form (ngSubmit)="saveProduct()">
            <div class="form-group">
              <label for="name">NOM DU PRODUIT</label>
              <input type="text" id="name" [(ngModel)]="formData.name" name="name" required>
            </div>
            <div class="form-group">
              <label for="price">PRIX</label>
              <input type="number" id="price" [(ngModel)]="formData.price" name="price" step="0.01" required>
            </div>
            <div class="form-group">
              <label for="category">CATÉGORIE</label>
              <select id="category" [(ngModel)]="formData.category_id" name="category_id" required>
                <option value="">SÉLECTIONNER</option>
                <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-cancel" (click)="closeForm()">ANNULER</button>
              <button type="submit" class="btn btn-primary">ENREGISTRER</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .products {
      animation: fadeIn 0.5s ease-in;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .list-header h2 {
      font-family: 'Orbitron', sans-serif;
      font-size: 2rem;
      color: #00ff88;
      margin: 0;
      letter-spacing: 2px;
      text-transform: uppercase;
      animation: glow 2s ease-in-out infinite;
    }

    .table {
      width: 100%;
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 255, 136, 0.02) 100%);
      border-collapse: collapse;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #00ff88;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.2), inset 0 0 20px rgba(0, 255, 136, 0.1);
    }

    .table thead {
      background: rgba(0, 255, 136, 0.1);
      border-bottom: 2px solid #00ff88;
    }

    .table th {
      padding: 1rem;
      text-align: left;
      font-weight: 700;
      color: #00ff88;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-size: 0.85rem;
    }

    .table td {
      padding: 1rem;
      border-bottom: 1px solid rgba(0, 255, 136, 0.2);
      color: #00ff88;
    }

    .table tbody tr:hover {
      background: rgba(0, 255, 136, 0.1);
      box-shadow: inset 0 0 20px rgba(0, 255, 136, 0.1);
    }

    .btn-small {
      padding: 0.5rem 1rem;
      margin-right: 0.5rem;
      border: 1px solid;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
      transition: all 0.3s ease;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .btn-edit {
      background: rgba(0, 255, 136, 0.2);
      color: #00ff88;
      border-color: #00ff88;
    }

    .btn-edit:hover {
      background: #00ff88;
      color: #0a0e27;
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.6);
    }

    .btn-delete {
      background: rgba(255, 0, 110, 0.2);
      color: #ff006e;
      border-color: #ff006e;
    }

    .btn-delete:hover {
      background: #ff006e;
      color: #0a0e27;
      box-shadow: 0 0 15px rgba(255, 0, 110, 0.6);
    }

    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 2000;
      justify-content: center;
      align-items: center;
      backdrop-filter: blur(5px);
    }

    .modal.active {
      display: flex;
    }

    .modal-content {
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(26, 26, 62, 0.95) 100%);
      padding: 2rem;
      border-radius: 8px;
      width: 100%;
      max-width: 500px;
      border: 2px solid #00ff88;
      box-shadow: 0 0 40px rgba(0, 255, 136, 0.4), inset 0 0 40px rgba(0, 255, 136, 0.1);
      backdrop-filter: blur(10px);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #00ff88;
      padding-bottom: 1rem;
    }

    .modal-header h2 {
      margin: 0;
      color: #00ff88;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #ff006e;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      color: #00ff88;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-family: 'Orbitron', sans-serif;
      font-weight: 700;
      color: #00ff88;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-size: 0.85rem;
    }

    input, select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #00ff88;
      border-radius: 4px;
      font-size: 1rem;
      background: rgba(0, 255, 136, 0.05);
      color: #00ff88;
      font-family: 'Space Mono', monospace;
      transition: all 0.3s ease;
    }

    input::placeholder {
      color: rgba(0, 255, 136, 0.5);
    }

    input:focus, select:focus {
      outline: none;
      border-color: #ff006e;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.5), inset 0 0 20px rgba(0, 255, 136, 0.1);
      background: rgba(0, 255, 136, 0.1);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .form-actions button {
      flex: 1;
    }

    .btn-cancel {
      background: transparent;
      color: #ff006e;
      border-color: #ff006e;
      box-shadow: inset 0 0 20px rgba(255, 0, 110, 0.2);
    }

    .btn-cancel:hover {
      background: rgba(255, 0, 110, 0.1);
      box-shadow: 0 0 20px rgba(255, 0, 110, 0.5), inset 0 0 20px rgba(255, 0, 110, 0.2);
    }

    @keyframes glow {
      0%, 100% {
        text-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88;
      }
      50% {
        text-shadow: 0 0 20px #00ff88, 0 0 30px #00ff88, 0 0 40px #00ff88, 0 0 50px #00ff88;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .list-header {
        flex-direction: column;
        gap: 1rem;
      }

      .list-header h2 {
        font-size: 1.5rem;
      }

      .btn {
        width: 100%;
      }

      .table {
        font-size: 0.85rem;
      }

      .table th, .table td {
        padding: 0.75rem;
      }
    }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  showForm = false;
  editingId: number | null = null;
  formData: Product = {
    id: 0,
    name: '',
    price: 0,
    category_id: 0
  };

  constructor(private productService: ProductService, private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        // API may return an array or an object with a `data` field
        const payload = Array.isArray(data) ? data : (data.data || []);
        // map category name if provided by API
        this.products = payload.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          category_id: p.category_id,
          description: p.description,
          created_at: p.created_at,
          category_name: p.category_name // may be undefined
        }));
        // if some products lack category_name, try resolving from categories
        if (this.categories.length && this.products.length) {
          const map = new Map(this.categories.map(c => [c.id, c.name]));
          this.products = this.products.map(prod => ({
            ...prod,
            category_name: prod.category_name || (prod.category_id ? map.get(prod.category_id) : undefined)
          }));
        }
      },
      error: (err) => {
        console.error('Error loading products:', err);
        // Données de démo
        this.products = [
          { id: 1, name: 'Smartphone X1', price: 699.99, category_id: 1 },
          { id: 2, name: 'Laptop Pro', price: 1200, category_id: 1 },
          { id: 3, name: 'Tablette Ultra', price: 499.99, category_id: 1 },
          { id: 4, name: 'Chaise Ergonomique', price: 199.99, category_id: 3 }
        ];
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        const payload = Array.isArray(data) ? data : (data.data || []);
        this.categories = payload;
        // map category names into existing products if needed
        if (this.products.length) {
          const map = new Map(this.categories.map(c => [c.id, c.name]));
          this.products = this.products.map(prod => ({
            ...prod,
            category_name: prod.category_name || (prod.category_id ? map.get(prod.category_id) : undefined)
          }));
        }
      },
      error: (err) => {
        console.error('Error loading categories for products:', err);
      }
    });
  }

  openForm(): void {
    this.editingId = null;
    this.formData = { id: 0, name: '', price: 0, category_id: 0 };
    this.showForm = true;
  }

  editProduct(product: Product): void {
    this.editingId = product.id;
    this.formData = { ...product };
    this.showForm = true;
  }

  saveProduct(): void {
    if (this.editingId) {
      this.productService.updateProduct(this.editingId, this.formData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeForm();
        },
        error: (err) => console.error('Error updating product:', err)
      });
    } else {
      this.productService.createProduct(this.formData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeForm();
        },
        error: (err) => console.error('Error creating product:', err)
      });
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Êtes-vous sûr ?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => console.error('Error deleting product:', err)
      });
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }
}
