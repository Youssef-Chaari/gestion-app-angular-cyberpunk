import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile">
      <h2>Profil & Commandes</h2>
      <div *ngIf="orders.length; else none">
        <div *ngFor="let o of orders" class="order">
          <h3>Commande #{{ o.id }} - {{ o.created_at | date:'short' }}</h3>
          <div *ngFor="let it of o.items">
            {{ it.product.name }} x {{ it.quantity }} - {{ (it.product.price * it.quantity) | number:'1.2-2' }} TND
          </div>
          <div>Total: {{ o.total | number:'1.2-2' }} TND</div>
        </div>
      </div>
      <ng-template #none>
        <p>Aucune commande trouvée.</p>
      </ng-template>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  orders: any[] = [];

  ngOnInit(): void {
    const raw = localStorage.getItem('app_orders');
    this.orders = raw ? JSON.parse(raw) : [];
  }
}
