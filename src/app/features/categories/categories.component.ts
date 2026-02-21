import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../core/services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="categories">
      <div class="list-header">
        <h2>🏷️ CATÉGORIES</h2>
        <button class="btn btn-primary" (click)="openForm()">+ AJOUTER</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>NOM</th>
            <th>PRODUITS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let category of categories">
            <td>{{ category.name | uppercase }}</td>
            <td>0</td>
            <td>
              <button class="btn btn-small btn-edit" (click)="editCategory(category)">MODIFIER</button>
              <button class="btn btn-small btn-delete" (click)="deleteCategory(category.id)">SUPPRIMER</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="showForm" class="modal active">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editingId ? 'MODIFIER' : 'AJOUTER' }} UNE CATÉGORIE</h2>
            <button class="close-btn" (click)="closeForm()">✕</button>
          </div>
          <form (ngSubmit)="saveCategory()">
            <div class="form-group">
              <label for="name">NOM DE LA CATÉGORIE</label>
              <input type="text" id="name" [(ngModel)]="formData.name" name="name" required>
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
    .categories {
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

    input {
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

    input:focus {
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
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  showForm = false;
  editingId: number | null = null;
  formData: Category = {
    id: 0,
    name: ''
  };

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        // API may return an array or an object with a `data` field
        this.categories = Array.isArray(data) ? data : (data.data || []);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        // Données de démo
        this.categories = [
          { id: 1, name: 'Électronique' },
          { id: 2, name: 'Vêtements' },
          { id: 3, name: 'Maison' }
        ];
      }
    });
  }

  openForm(): void {
    this.editingId = null;
    this.formData = { id: 0, name: '' };
    this.showForm = true;
  }

  editCategory(category: Category): void {
    this.editingId = category.id;
    this.formData = { ...category };
    this.showForm = true;
  }

  saveCategory(): void {
    if (this.editingId) {
      this.categoryService.updateCategory(this.editingId, this.formData).subscribe({
        next: () => {
          this.loadCategories();
          this.closeForm();
        },
        error: (err) => console.error('Error updating category:', err)
      });
    } else {
      this.categoryService.createCategory(this.formData).subscribe({
        next: () => {
          this.loadCategories();
          this.closeForm();
        },
        error: (err) => console.error('Error creating category:', err)
      });
    }
  }

  deleteCategory(id: number): void {
    if (confirm('Êtes-vous sûr ?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (err) => console.error('Error deleting category:', err)
      });
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.editingId = null;
  }
}
