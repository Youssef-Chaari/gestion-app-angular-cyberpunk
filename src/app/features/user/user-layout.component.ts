import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="user-layout">
      <header class="shop-header">
        <div class="brand">GESTION SHOP</div>
        <nav>
          <a routerLink="/shop">Catalogue</a>
          <a routerLink="/shop/cart">Panier</a>
          <a routerLink="/shop/profile">Profil</a>
        </nav>
      </header>
      <main class="shop-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .shop-header { display:flex; justify-content:space-between; align-items:center; padding:1rem; border-bottom:1px solid rgba(0,0,0,0.05); }
    .shop-header .brand { font-weight:700; color:#00ff88; }
    .shop-header nav a { margin-left:1rem; color:#00ff88; text-decoration:none; }
    .shop-content { padding:1.5rem; }
  `]
})
export class UserLayoutComponent {}
