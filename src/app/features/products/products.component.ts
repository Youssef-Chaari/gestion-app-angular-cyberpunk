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
      <div class="products-header">
        <div class="header-content">
          <h1 class="page-title">⚡ GESTION DES PRODUITS</h1>
          <p class="page-subtitle">Administration des articles et inventaire</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary btn-add" (click)="openForm()">
            <span class="btn-icon">➕</span>
            <span class="btn-text">NOUVEAU PRODUIT</span>
          </button>
        </div>
      </div>

      <div class="products-stats">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <h3>{{ products.length }}</h3>
            <p>Produits actifs</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏷️</div>
          <div class="stat-info">
            <h3>{{ categories.length }}</h3>
            <p>Catégories</p>
          </div>
        </div>
      </div>

      <div class="products-table-container">
        <table class="products-table">
          <thead>
            <tr>
              <th class="col-product">
                <span class="col-icon">📦</span>
                PRODUIT
              </th>
              <th class="col-category">
                <span class="col-icon">🏷️</span>
                CATÉGORIE
              </th>
              <th class="col-price">
                <span class="col-icon">💰</span>
                PRIX
              </th>
              <th class="col-stock">
                <span class="col-icon">📦</span>
                STOCK
              </th>
              <th class="col-actions">
                <span class="col-icon">⚙️</span>
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of products; trackBy: trackByProductId"
                class="product-row"
                [class.even]="products.indexOf(product) % 2 === 0">
              <td class="col-product">
                <div class="product-info">
                  <div class="product-thumbnail-container" *ngIf="product.image" (click)="viewProductImage(product)">
                    <img [src]="product.image" alt="{{ product.name }}" class="product-thumbnail" title="Cliquer pour agrandir">
                    <div class="thumbnail-hover">🔍</div>
                  </div>
                  <div class="product-name">{{ product.name | uppercase }}</div>
                </div>
              </td>
              <td class="col-category">
                <span class="category-badge">
                  {{ product.category_name | uppercase }}
                </span>
              </td>
              <td class="col-price">
                <div class="price-display">
                  <span class="price-amount">TND{{ product.price | number: '1.2-2' }}</span>
                  <span class="price-currency">TND</span>
                </div>
              </td>
              <td class="col-stock">
                <div class="stock-display" [class.low-stock]="product.stock <= 0">
                  <span class="stock-amount">{{ product.stock || 0 }}</span>
                  <span class="stock-label">unités</span>
                </div>
              </td>
              <td class="col-actions">
                <div class="action-buttons">
                  <button class="btn-action btn-edit" (click)="editProduct(product)"
                          title="Modifier le produit">
                    <span class="btn-icon">✏️</span>
                    <span class="btn-text">ÉDITER</span>
                  </button>
                  <button class="btn-action btn-delete" (click)="deleteProduct(product.id)"
                          title="Supprimer le produit">
                    <span class="btn-icon">🗑️</span>
                    <span class="btn-text">SUPPRIMER</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="products.length === 0" class="empty-row">
              <td colspan="5" class="empty-state">
                <div class="empty-content">
                  <div class="empty-icon">📦</div>
                  <h3>Aucun produit trouvé</h3>
                  <p>Commencez par ajouter votre premier produit</p>
                  <button class="btn btn-primary" (click)="openForm()">
                    <span class="btn-icon">➕</span>
                    AJOUTER UN PRODUIT
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Enhanced Modal -->
      <div *ngIf="showForm" class="modal-overlay" (click)="closeForm()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title">
              <span class="modal-icon">{{ editingId ? '✏️' : '➕' }}</span>
              <h2>{{ editingId ? 'MODIFIER LE PRODUIT' : 'NOUVEAU PRODUIT' }}</h2>
            </div>
            <button class="modal-close" (click)="closeForm()" title="Fermer">
              <span class="close-icon">✕</span>
            </button>
          </div>

          <form class="product-form" (ngSubmit)="saveProduct()">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">
                  <span class="label-icon">📦</span>
                  NOM DU PRODUIT
                </label>
                <input type="text"
                       class="form-input"
                       [(ngModel)]="formData.name"
                       name="name"
                       placeholder="Entrez le nom du produit"
                       required>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="label-icon">💰</span>
                  PRIX (TND)
                </label>
                <input type="number"
                       class="form-input"
                       [(ngModel)]="formData.price"
                       name="price"
                       placeholder="0.00"
                       step="0.01"
                       min="0"
                       required>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="label-icon">📦</span>
                  STOCK
                </label>
                <input type="number"
                       class="form-input"
                       [(ngModel)]="formData.stock"
                       name="stock"
                       placeholder="0"
                       min="0"
                       required>
              </div>

              <div class="form-group form-group-full">
                <label class="form-label">
                  <span class="label-icon">🏷️</span>
                  CATÉGORIE
                </label>
                <select class="form-select"
                        [(ngModel)]="formData.category_id"
                        name="category_id"
                        required>
                  <option value="">Sélectionnez une catégorie</option>
                  <option *ngFor="let category of categories" [value]="category.id.toString()">
                    {{ category.name | uppercase }}
                  </option>
                </select>
              </div>

              <div class="form-group form-group-full">
                <label class="form-label">
                  <span class="label-icon">📝</span>
                  DESCRIPTION DU PRODUIT
                </label>
                <textarea class="form-textarea"
                          [(ngModel)]="formData.description"
                          name="description"
                          placeholder="Entrez la description détaillée du produit..."
                          rows="5"></textarea>
              </div>

              <div class="form-group form-group-full">
                <label class="form-label">
                  <span class="label-icon">🖼️</span>
                  IMAGE DU PRODUIT
                </label>
                <div class="image-input-group">
                  <div class="image-option">
                    <label class="file-input-label">
                      <span class="upload-icon">📁</span>
                      <span class="upload-text">Télécharger une image</span>
                      <input type="file" 
                             accept="image/*" 
                             (change)="onFileSelected($event)"
                             class="file-input"
                             style="display: none;">
                    </label>
                  </div>
                  <div class="image-divider">OU</div>
                  <div class="image-option">
                    <input type="text"
                           class="form-input"
                           [(ngModel)]="formData.image"
                           name="image"
                           placeholder="https://example.com/image.jpg"
                           (change)="onImageChange()">
                  </div>
                </div>
                <div class="image-preview" *ngIf="formData.image">
                  <img [src]="formData.image" alt="Aperçu du produit" class="preview-img">
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="closeForm()" [disabled]="isSaving">
                <span class="btn-icon">❌</span>
                <span class="btn-text">ANNULER</span>
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="isSaving">
                <span class="btn-icon">{{ isSaving ? '⏳' : (editingId ? '💾' : '➕') }}</span>
                <span class="btn-text">{{ isSaving ? (editingId ? 'MISE À JOUR...' : 'CRÉATION...') : (editingId ? 'METTRE À JOUR' : 'CRÉER LE PRODUIT') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Image View Modal -->
      <div class="image-modal-overlay" *ngIf="selectedProductImage" (click)="closeImageView()">
        <div class="image-modal-content" (click)="$event.stopPropagation()">
          <button class="image-modal-close" (click)="closeImageView()" title="Fermer">✕</button>
          <div class="image-modal-body">
            <img [src]="selectedProductImage.image" [alt]="selectedProductImage.name" class="modal-image">
            <div class="image-info">
              <h3>{{ selectedProductImage.name | uppercase }}</h3>
              <p class="category">{{ selectedProductImage.category_name | uppercase }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .products {
      animation: fadeInUp 0.6s ease-out;
      padding: 0;
    }

    /* Header Section */
    .products-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 2rem;
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 255, 136, 0.02) 100%);
      border-radius: 12px;
      border: 1px solid rgba(0, 255, 136, 0.2);
      position: relative;
      overflow: hidden;
    }

    .products-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #00ff88, #ff006e, #00ff88);
      animation: borderGlow 3s ease-in-out infinite;
    }

    .header-content h1 {
      font-family: 'Orbitron', sans-serif;
      font-size: 2.5rem;
      color: #00ff88;
      margin: 0 0 0.5rem 0;
      letter-spacing: 3px;
      text-transform: uppercase;
      animation: textGlow 2s ease-in-out infinite;
      text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
    }

    .page-subtitle {
      color: rgba(0, 255, 136, 0.7);
      font-size: 1rem;
      margin: 0;
      font-family: 'Space Mono', monospace;
      letter-spacing: 1px;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-add {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .btn-add::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .btn-add:hover::before {
      left: 100%;
    }

    /* Stats Cards */
    .products-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
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
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #00ff88, #ff006e);
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 255, 136, 0.2);
      border-color: #00ff88;
    }

    .stat-icon {
      font-size: 2rem;
      opacity: 0.8;
    }

    .stat-info h3 {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.8rem;
      color: #00ff88;
      margin: 0;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
    }

    .stat-info p {
      color: rgba(0, 255, 136, 0.7);
      margin: 0.25rem 0 0 0;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Table Container */
    .products-table-container {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.02) 0%, rgba(0, 255, 136, 0.01) 100%);
      border-radius: 12px;
      border: 1px solid rgba(0, 255, 136, 0.2);
      overflow: hidden;
      position: relative;
    }

    .products-table-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #00ff88, #ff006e, #00ff88);
      animation: borderGlow 3s ease-in-out infinite;
    }

    /* Table Styles */
    .products-table {
      width: 100%;
      border-collapse: collapse;
      background: transparent;
    }

    .products-table thead {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.05) 100%);
    }

    .products-table th {
      padding: 1.25rem 1rem;
      text-align: left;
      font-weight: 700;
      color: #00ff88;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-size: 0.8rem;
      border-bottom: 1px solid rgba(0, 255, 136, 0.3);
      position: relative;
    }

    .col-icon {
      margin-right: 0.5rem;
      opacity: 0.8;
    }

    .product-row {
      transition: all 0.3s ease;
      border-bottom: 1px solid rgba(0, 255, 136, 0.1);
    }

    .product-row:hover {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.08) 0%, rgba(0, 255, 136, 0.04) 100%);
      transform: scale(1.01);
      box-shadow: inset 0 0 20px rgba(0, 255, 136, 0.1);
    }

    .product-row.even {
      background: rgba(0, 255, 136, 0.02);
    }

    .col-product {
      min-width: 200px;
    }

    .product-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .product-thumbnail {
      width: 50px;
      height: 50px;
      border-radius: 6px;
      object-fit: cover;
      border: 2px solid rgba(0, 255, 136, 0.3);
      flex-shrink: 0;
      background: rgba(0, 255, 136, 0.05);
    }

    .product-thumbnail-container {
      position: relative;
      cursor: pointer;
      display: inline-block;
    }

    .thumbnail-hover {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.2rem;
      opacity: 0;
      transition: all 0.3s ease;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
    }

    .product-thumbnail-container:hover .thumbnail-hover {
      opacity: 1;
    }

    .product-thumbnail-container:hover .product-thumbnail {
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
      border-color: #00ff88;
    }

    .product-name {
      font-weight: 600;
      color: #00ff88;
      font-size: 1rem;
      text-shadow: 0 0 5px rgba(0, 255, 136, 0.3);
    }

    .product-id {
      font-size: 0.75rem;
      color: rgba(0, 255, 136, 0.6);
      font-family: 'Space Mono', monospace;
    }

    .category-badge {
      background: linear-gradient(135deg, rgba(255, 0, 110, 0.2) 0%, rgba(255, 0, 110, 0.1) 100%);
      color: #ff006e;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      border: 1px solid rgba(255, 0, 110, 0.3);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-block;
    }

    .price-display {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .price-amount {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.1rem;
      color: #00ff88;
      font-weight: 600;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
    }

    .price-currency {
      font-size: 0.7rem;
      color: rgba(0, 255, 136, 0.7);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .col-actions {
      min-width: 180px;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-start;
    }

    .btn-action {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: 1px solid;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.3s ease;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 600;
      position: relative;
      overflow: hidden;
    }

    .btn-action::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }

    .btn-action:hover::before {
      left: 100%;
    }

    .btn-edit {
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 136, 0.1) 100%);
      color: #00ff88;
      border-color: #00ff88;
    }

    .btn-edit:hover {
      background: #00ff88;
      color: #0a0e27;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
      transform: translateY(-1px);
    }

    .btn-delete {
      background: linear-gradient(135deg, rgba(255, 0, 110, 0.2) 0%, rgba(255, 0, 110, 0.1) 100%);
      color: #ff006e;
      border-color: #ff006e;
    }

    .btn-delete:hover {
      background: #ff006e;
      color: #0a0e27;
      box-shadow: 0 0 20px rgba(255, 0, 110, 0.6);
      transform: translateY(-1px);
    }

    /* Empty State */
    .empty-row {
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.5) 0%, rgba(26, 26, 62, 0.5) 100%);
    }

    .empty-state {
      padding: 3rem 1rem;
      text-align: center;
    }

    .empty-content {
      max-width: 400px;
      margin: 0 auto;
    }

    .empty-icon {
      font-size: 4rem;
      opacity: 0.5;
      margin-bottom: 1rem;
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
      font-size: 1rem;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
      animation: fadeIn 0.3s ease-out;
    }

    .modal-container {
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(26, 26, 62, 0.95) 100%);
      border-radius: 16px;
      border: 2px solid #00ff88;
      box-shadow: 0 0 50px rgba(0, 255, 136, 0.4), inset 0 0 50px rgba(0, 255, 136, 0.1);
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      animation: modalSlideIn 0.4s ease-out;
    }

    .modal-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #00ff88, #ff006e, #00ff88);
      animation: borderGlow 2s ease-in-out infinite;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem;
      border-bottom: 1px solid rgba(0, 255, 136, 0.2);
      position: relative;
    }

    .modal-title {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .modal-icon {
      font-size: 1.5rem;
    }

    .modal-header h2 {
      margin: 0;
      color: #00ff88;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-size: 1.5rem;
      text-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #ff006e;
      transition: all 0.3s ease;
      padding: 0.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-close:hover {
      background: rgba(255, 0, 110, 0.1);
      color: #00ff88;
      transform: rotate(90deg);
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
    }

    .close-icon {
      line-height: 1;
    }

    /* Form Styles */
    .product-form {
      padding: 2rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .form-group-full {
      grid-column: 1 / -1;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-family: 'Orbitron', sans-serif;
      font-weight: 700;
      color: #00ff88;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-size: 0.85rem;
    }

    .label-icon {
      opacity: 0.8;
    }

    .form-input, .form-select {
      width: 100%;
      padding: 1rem;
      border: 2px solid rgba(0, 255, 136, 0.3);
      border-radius: 8px;
      font-size: 1rem;
      background: rgba(0, 255, 136, 0.05);
      color: #00ff88;
      font-family: 'Space Mono', monospace;
      transition: all 0.3s ease;
      position: relative;
    }

    .form-textarea {
      width: 100%;
      padding: 1rem;
      border: 2px solid rgba(0, 255, 136, 0.3);
      border-radius: 8px;
      font-size: 1rem;
      background: rgba(0, 255, 136, 0.05);
      color: #00ff88;
      font-family: 'Space Mono', monospace;
      transition: all 0.3s ease;
      resize: vertical;
      min-height: 120px;
    }

    .form-textarea::placeholder {
      color: rgba(0, 255, 136, 0.5);
    }

    .form-textarea:focus {
      outline: none;
      border-color: #00ff88;
      box-shadow: 0 0 25px rgba(0, 255, 136, 0.3), inset 0 0 25px rgba(0, 255, 136, 0.1);
      background: rgba(0, 255, 136, 0.1);
      transform: translateY(-1px);
    }

    .form-input::placeholder {
      color: rgba(0, 255, 136, 0.5);
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #00ff88;
      box-shadow: 0 0 25px rgba(0, 255, 136, 0.3), inset 0 0 25px rgba(0, 255, 136, 0.1);
      background: rgba(0, 255, 136, 0.1);
      transform: translateY(-1px);
    }

    .form-select {
      cursor: pointer;
    }

    .form-select option {
      background: #0a0e27;
      color: #00ff88;
    }

    /* Image Upload */
    .image-input-group {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .image-option {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .file-input-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem;
      border: 2px dashed rgba(0, 255, 136, 0.4);
      border-radius: 8px;
      background: rgba(0, 255, 136, 0.05);
      cursor: pointer;
      transition: all 0.3s ease;
      color: #00ff88;
      font-family: 'Space Mono', monospace;
      font-weight: 600;
    }

    .file-input-label:hover {
      border-color: #00ff88;
      background: rgba(0, 255, 136, 0.1);
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
    }

    .upload-icon {
      font-size: 1.5rem;
    }

    .upload-text {
      font-size: 0.9rem;
    }

    .image-divider {
      padding: 0 0.5rem;
      color: rgba(0, 255, 136, 0.5);
      font-weight: 600;
      font-family: 'Space Mono', monospace;
    }

    /* Image Preview */
    .image-preview {
      margin-top: 1rem;
      padding: 1rem;
      border: 2px dashed rgba(0, 255, 136, 0.3);
      border-radius: 8px;
      background: rgba(0, 255, 136, 0.05);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 150px;
      overflow: hidden;
    }

    .preview-img {
      max-width: 100%;
      max-height: 200px;
      border-radius: 4px;
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
      object-fit: contain;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid rgba(0, 255, 136, 0.2);
    }

    .form-actions .btn {
      flex: 1;
      max-width: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      border-radius: 8px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .form-actions .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .form-actions .btn:hover::before {
      left: 100%;
    }

    .btn-primary {
      background: linear-gradient(135deg, #00ff88, #00cc6a);
      color: #0a0e27;
      border: 2px solid #00ff88;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #00cc6a, #00ff88);
      box-shadow: 0 0 25px rgba(0, 255, 136, 0.6);
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: transparent;
      color: #ff006e;
      border: 2px solid #ff006e;
    }

    .btn-secondary:hover {
      background: rgba(255, 0, 110, 0.1);
      box-shadow: 0 0 25px rgba(255, 0, 110, 0.5);
      transform: translateY(-2px);
    }

    /* Animations */
    /* Image Modal */
    .image-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
      backdrop-filter: blur(5px);
      animation: fadeInUp 0.3s ease-out;
    }

    .image-modal-content {
      position: relative;
      max-width: 90%;
      max-height: 90vh;
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(26, 26, 62, 0.95) 100%);
      border: 2px solid rgba(0, 255, 136, 0.4);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 0 50px rgba(0, 255, 136, 0.3);
      backdrop-filter: blur(10px);
    }

    .image-modal-close {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(0, 255, 136, 0.2);
      border: 1px solid rgba(0, 255, 136, 0.4);
      color: #00ff88;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .image-modal-close:hover {
      background: rgba(0, 255, 136, 0.3);
      border-color: #00ff88;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
      transform: scale(1.1);
    }

    .image-modal-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      max-height: 85vh;
      overflow-y: auto;
    }

    .modal-image {
      max-width: 100%;
      max-height: 70vh;
      border-radius: 8px;
      box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
      object-fit: contain;
      margin-bottom: 1.5rem;
    }

    .image-info {
      text-align: center;
      color: #00ff88;
      font-family: 'Space Mono', monospace;
      width: 100%;
    }

    .image-info h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }

    .image-info .category {
      margin: 0;
      color: rgba(0, 255, 136, 0.7);
      font-size: 0.9rem;
    }

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

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes textGlow {
      0%, 100% {
        text-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88;
      }
      50% {
        text-shadow: 0 0 20px #00ff88, 0 0 30px #00ff88, 0 0 40px #00ff88;
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
      .products-header {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
      }

      .header-content h1 {
        font-size: 2rem;
      }

      .products-stats {
        grid-template-columns: 1fr;
      }

      .products-table-container {
        overflow-x: auto;
      }

      .products-table {
        min-width: 600px;
      }

      .action-buttons {
        flex-direction: column;
        gap: 0.25rem;
      }

      .btn-action {
        padding: 0.5rem 0.75rem;
        font-size: 0.7rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions .btn {
        max-width: none;
      }

      .modal-container {
        width: 95%;
        margin: 1rem;
      }

      .modal-header {
        padding: 1.5rem;
      }

      .product-form {
        padding: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .products-header {
        padding: 1.5rem;
      }

      .header-content h1 {
        font-size: 1.5rem;
      }

      .stat-card {
        padding: 1rem;
      }

      .stat-info h3 {
        font-size: 1.5rem;
      }

      .modal-header h2 {
        font-size: 1.2rem;
      }
    }

    /* Stock Display Styles */
    .stock-display {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.9rem;
      text-align: center;
      background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.05) 100%);
      color: #00ff88;
      border: 1px solid rgba(0, 255, 136, 0.3);
      transition: all 0.3s ease;
    }

    .stock-display.low-stock {
      background: linear-gradient(135deg, rgba(255, 0, 110, 0.1) 0%, rgba(255, 0, 110, 0.05) 100%);
      color: #ff006e;
      border-color: rgba(255, 0, 110, 0.3);
      box-shadow: inset 0 0 10px rgba(255, 0, 110, 0.1);
    }

    .col-stock {
      min-width: 100px;
    }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  showForm = false;
  editingId: string | null = null;
  isSaving = false;
  selectedProductImage: Product | null = null;
  originalImage: string = '';
  imageChanged: boolean = false;
  formData: Product = {
    id: '',
    name: '',
    price: 0,
    category_id: '',
    stock: 0,
    description: '',
    image: ''
  };

  constructor(private productService: ProductService, private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProductsWithCategories().subscribe({
      next: (data: { products: any[], categories: any[] }) => {
        this.products = data.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          category_id: String(p.categoryId || p.category_id || ''),
          description: p.description,
          created_at: p.created_at,
          stock: Number(p.stock || 0),
          category_name: p.category_name
        }));
        // Ensure categories have proper string IDs
        this.categories = data.categories.map(c => ({
          ...c,
          id: String(c.id)
        }));
        console.log('Loaded products:', this.products.map(p => ({ id: p.id, category_id: p.category_id, category_name: p.category_name })));
        console.log('Loaded categories:', this.categories);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        // Données de démo
        this.products = [
          { id: 1, name: 'Smartphone X1', price: 699.99, category_id: '1', category_name: 'Électronique' },
          { id: 2, name: 'Laptop Pro', price: 1200, category_id: '1', category_name: 'Électronique' },
          { id: 3, name: 'Tablette Ultra', price: 499.99, category_id: '1', category_name: 'Électronique' },
          { id: 4, name: 'Chaise Ergonomique', price: 199.99, category_id: '3', category_name: 'Maison' }
        ];
        this.categories = [
          { id: '1', name: 'Électronique' },
          { id: '2', name: 'Vêtements' },
          { id: '3', name: 'Maison' }
        ];
      }
    });
  }

  openForm(): void {
    this.editingId = null;
    this.originalImage = '';
    this.imageChanged = false;
    this.formData = { id: 0, name: '', price: 0, category_id: '', stock: 0, image: '', description: '' };
    // Use already-loaded categories; don't reload
    this.showForm = true;
  }

  editProduct(product: Product): void {
    this.editingId = String(product.id ?? '');
    this.originalImage = product.image || '';
    this.imageChanged = false;
    this.formData = { 
      ...product, 
      category_id: String(product.category_id || ''),
      price: Number(product.price),
      stock: Number(product.stock || 0),
      image: product.image || '',
      description: product.description || ''
    };
    // Use already-loaded categories; don't reload
    this.showForm = true;
  }

  saveProduct(): void {
    if (this.isSaving) return;

    // Validate required fields
    if (!this.formData.name?.trim() || !this.formData.category_id) {
      return;
    }

    this.isSaving = true;

    // Determine which image to save
    let imageToSave = this.formData.image || this.originalImage;
    
    // When editing a product - ALWAYS use original if not explicitly changed
    if (this.editingId && !this.imageChanged) {
      imageToSave = this.originalImage;
    }

    // Create clean payload with proper field mapping for Firestore
    const payload: any = {
      name: this.formData.name,
      price: Number(this.formData.price),
      stock: Number(this.formData.stock),
      categoryId: String(this.formData.category_id),  // Map to categoryId for Firestore
      description: this.formData.description || ''
    };

    // Only include image in payload if we have one
    if (imageToSave) {
      payload.image = imageToSave;
    }

    console.log('Saving product:', { 
      editingId: this.editingId, 
      imageChanged: this.imageChanged,
      formDataImage: this.formData.image,
      originalImage: this.originalImage,
      finalImageToSave: imageToSave,
      payload,
      selectedCategory: this.categories.find(c => String(c.id) === String(this.formData.category_id)) 
    });

    if (this.editingId) {
      this.productService.updateProduct(this.editingId, payload).subscribe({
        next: () => {
          console.log('Product updated successfully with image:', imageToSave);
          this.loadProducts();
          this.isSaving = false;
          this.closeForm();
        },
        error: (err) => {
          console.error('Error updating product:', err);
          this.isSaving = false;
        }
      });
    } else {
      // For new products, set image to empty string if not provided
      payload.image = imageToSave || '';
      this.productService.createProduct(payload as Product).subscribe({
        next: () => {
          console.log('Product created successfully');
          this.loadProducts();
          this.isSaving = false;
          this.closeForm();
        },
        error: (err) => {
          console.error('Error creating product:', err);
          this.isSaving = false;
        }
      });
    }
  }

  deleteProduct(id: string | number): void {
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
    this.originalImage = '';
    this.imageChanged = false;
    this.isSaving = false;
  }

  getTotalValue(): number {
    return this.products.reduce((total, product) => total + product.price, 0);
  }

  trackByProductId(index: number, product: Product): any {
    return product.id;
  }

  onImageChange(): void {
    // Image URL is being updated, mark as changed
    this.imageChanged = true;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image valide');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('L\'image doit faire moins de 5MB');
        return;
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.formData.image = e.target.result;
        this.imageChanged = true;
        console.log('Image selected and converted to base64');
      };
      reader.readAsDataURL(file);
    }
  }

  viewProductImage(product: Product): void {
    this.selectedProductImage = product;
  }

  closeImageView(): void {
    this.selectedProductImage = null;
  }
}
