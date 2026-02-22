import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';

interface ProductEdit {
  id: string | number;
  name: string;
  price: number;
  stock: number;
  description?: string;
  editing: boolean;
  originalStock: number;
  originalDescription?: string;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-products">
      <div class="header">
        <h2>Gestion des Produits</h2>
        <p>Modifiez le stock et autres propriétés des produits</p>
      </div>

      <div class="loading" *ngIf="loading">Chargement des produits...</div>

      <div class="products-list" *ngIf="!loading && products.length > 0">
        <table class="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of products" [class.editing]="product.editing">
              <td>{{ product.id }}</td>
              <td>{{ product.name }}</td>
              <td>{{ product.price | number:'1.2-2' }} TND</td>
              <td>
                <div class="stock-cell" [class.out-of-stock]="product.stock <= 0">
                  <input type="number" 
                         [(ngModel)]="product.stock" 
                         *ngIf="product.editing"
                         class="stock-input"
                         min="0">
                  <span *ngIf="!product.editing">{{ product.stock }}</span>
                </div>
              </td>
              <td>
                <div class="description-cell">
                  <textarea 
                    [(ngModel)]="product.description"
                    *ngIf="product.editing"
                    class="description-input"
                    placeholder="Entrez la description du produit"
                    rows="3"></textarea>
                  <span *ngIf="!product.editing" class="description-preview">
                    {{ product.description || 'Aucune description' }}
                  </span>
                </div>
              </td>
              <td>
                <div class="actions">
                  <button *ngIf="!product.editing" 
                          (click)="startEdit(product)"
                          class="btn btn-edit">
                    ✏️ Modifier
                  </button>
                  <div *ngIf="product.editing" class="edit-actions">
                    <button (click)="saveProduct(product)" class="btn btn-save">
                      💾 Sauver
                    </button>
                    <button (click)="cancelEdit(product)" class="btn btn-cancel">
                      ❌ Annuler
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty" *ngIf="!loading && products.length === 0">
        <p>Aucun produit trouvé</p>
      </div>

      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>
      <div *ngIf="errorMessage" class="alert alert-error">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .admin-products {
      padding: 2rem;
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.9) 0%, rgba(26, 26, 62, 0.9) 100%);
      border: 1px solid rgba(0, 255, 136, 0.3);
      border-radius: 12px;
      color: #00ff88;
    }

    .header {
      margin-bottom: 2rem;
    }

    .header h2 {
      margin: 0;
      font-family: 'Orbitron', sans-serif;
      color: #00ff88;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
      font-size: 1.8rem;
    }

    .header p {
      margin: 0.5rem 0 0 0;
      color: rgba(0, 255, 136, 0.7);
      font-family: 'Space Mono', monospace;
    }

    .loading {
      text-align: center;
      color: #00ff88;
      padding: 2rem;
    }

    .products-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;
    }

    .products-table thead {
      background: rgba(0, 255, 136, 0.1);
      border-bottom: 2px solid #00ff88;
    }

    .products-table th {
      padding: 1rem;
      text-align: left;
      color: #00ff88;
      font-weight: 600;
      font-family: 'Orbitron', sans-serif;
    }

    .products-table td {
      padding: 1rem;
      border-bottom: 1px solid rgba(0, 255, 136, 0.1);
      color: rgba(0, 255, 136, 0.8);
    }

    .products-table tr:hover {
      background: rgba(0, 255, 136, 0.05);
    }

    .products-table tr.editing {
      background: rgba(0, 255, 136, 0.1);
    }

    .stock-cell {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stock-cell.out-of-stock {
      color: #ff006e;
      font-weight: 600;
    }

    .stock-input {
      width: 100px;
      padding: 0.5rem;
      background: rgba(0, 255, 136, 0.1);
      border: 1px solid #00ff88;
      color: #00ff88;
      border-radius: 4px;
      font-family: 'Space Mono', monospace;
    }

    .stock-input:focus {
      outline: none;
      border-color: #ff006e;
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }

    .description-cell {
      max-width: 300px;
    }

    .description-input {
      width: 100%;
      padding: 0.5rem;
      background: rgba(0, 255, 136, 0.1);
      border: 1px solid #00ff88;
      color: #00ff88;
      border-radius: 4px;
      font-family: 'Space Mono', monospace;
      font-size: 0.85rem;
      resize: vertical;
    }

    .description-input:focus {
      outline: none;
      border-color: #ff006e;
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }

    .description-preview {
      display: block;
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 0.85rem;
      color: rgba(0, 255, 136, 0.7);
      max-height: 100px;
      overflow-y: auto;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .edit-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: 1px solid #00ff88;
      background: transparent;
      color: #00ff88;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.3s ease;
      font-weight: 600;
    }

    .btn:hover {
      background: rgba(0, 255, 136, 0.1);
      box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }

    .btn-edit {
      background: rgba(0, 255, 136, 0.2);
    }

    .btn-save {
      background: rgba(0, 200, 100, 0.2);
      border-color: #00c864;
      color: #00c864;
    }

    .btn-cancel {
      background: rgba(255, 0, 110, 0.2);
      border-color: #ff006e;
      color: #ff006e;
    }

    .alert {
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      border: 1px solid;
      font-family: 'Orbitron', sans-serif;
      text-transform: uppercase;
    }

    .alert-success {
      background: rgba(0, 200, 100, 0.1);
      color: #00c864;
      border-color: #00c864;
    }

    .alert-error {
      background: rgba(255, 0, 110, 0.1);
      color: #ff006e;
      border-color: #ff006e;
    }

    .empty {
      text-align: center;
      padding: 2rem;
      color: rgba(0, 255, 136, 0.5);
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  products: ProductEdit[] = [];
  loading = true;
  successMessage = '';
  errorMessage = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (data: any) => {
        const payload = Array.isArray(data) ? data : (data.data || []);
        this.products = payload.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          stock: Number(p.stock || 0),
          description: p.description || '',
          editing: false,
          originalStock: Number(p.stock || 0),
          originalDescription: p.description || ''
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.errorMessage = 'Erreur lors du chargement des produits';
        this.loading = false;
      }
    });
  }

  startEdit(product: ProductEdit): void {
    product.editing = true;
    product.originalStock = product.stock;
    product.originalDescription = product.description || '';
    this.clearMessages();
  }

  cancelEdit(product: ProductEdit): void {
    product.stock = product.originalStock;
    product.description = product.originalDescription || '';
    product.editing = false;
    this.clearMessages();
  }

  saveProduct(product: ProductEdit): void {
    const updates: any = {
      stock: product.stock,
      description: product.description || ''
    };
    
    this.productService.updateProduct(product.id, updates).subscribe({
      next: () => {
        product.editing = false;
        this.successMessage = `Produit "${product.name}" mis à jour avec succès`;
        setTimeout(() => this.clearMessages(), 3000);
      },
      error: (err) => {
        console.error('Error updating product:', err);
        this.errorMessage = 'Erreur lors de la mise à jour du produit';
        product.stock = product.originalStock;
        product.description = product.originalDescription || '';
      }
    });
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
