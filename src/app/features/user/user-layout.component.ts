import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="user-layout">
      <header class="cyber-header">
        <div class="header-content">
          <div class="brand-section">
            <div class="brand-logo">
              <span class="brand-icon">🛒</span>
              <span class="brand-text">CYBER SHOP</span>
            </div>
            <div class="brand-tagline">Votre boutique high-tech</div>
          </div>

          <nav class="main-nav">
            <a [routerLink]="['/shop']"
               routerLinkActive="active"
               class="nav-link">
              <span class="nav-icon">📦</span>
              <span class="nav-text">Catalogue</span>
            </a>
            <a [routerLink]="['/shop/cart']"
               routerLinkActive="active"
               class="nav-link cart-link">
              <span class="nav-icon">🛒</span>
              <span class="nav-text">Panier</span>
              <span class="cart-count" *ngIf="cartItemCount > 0">{{ cartItemCount }}</span>
            </a>
            <a [routerLink]="['/shop/profile']"
               routerLinkActive="active"
               class="nav-link">
              <span class="nav-icon">👤</span>
              <span class="nav-text">Profil</span>
            </a>
          </nav>

          <div class="user-actions">
            <div class="user-info">
              <span class="user-greeting">Bienvenue, {{ getUserDisplayName() }}</span>
            </div>
          </div>
        </div>

        <!-- Animated border -->
        <div class="header-border">
          <div class="border-line"></div>
        </div>
      </header>

      <main class="shop-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .user-layout {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0a0e27 100%);
      color: #00ff88;
    }

    .cyber-header {
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(26, 26, 62, 0.95) 100%);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(0, 255, 136, 0.3);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }

    .brand-section {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-icon {
      font-size: 2rem;
      filter: drop-shadow(0 0 10px #00ff88);
    }

    .brand-text {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: #00ff88;
      text-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
      letter-spacing: 2px;
    }

    .brand-tagline {
      font-size: 0.8rem;
      color: rgba(0, 255, 136, 0.7);
      font-family: 'Space Mono', monospace;
      letter-spacing: 1px;
    }

    .main-nav {
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      color: rgba(0, 255, 136, 0.8);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s ease;
      font-family: 'Orbitron', sans-serif;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-size: 0.85rem;
      position: relative;
      overflow: hidden;
    }

    .nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.1), transparent);
      transition: left 0.5s;
    }

    .nav-link:hover::before,
    .nav-link.active::before {
      left: 100%;
    }

    .nav-link:hover,
    .nav-link.active {
      color: #00ff88;
      background: rgba(0, 255, 136, 0.1);
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
      transform: translateY(-1px);
    }

    .cart-link {
      position: relative;
    }

    .cart-count {
      position: absolute;
      top: -8px;
      right: -8px;
      background: linear-gradient(135deg, #ff006e, #cc0055);
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 700;
      box-shadow: 0 0 10px rgba(255, 0, 110, 0.5);
      animation: pulse 2s infinite;
    }

    .user-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .user-greeting {
      font-size: 0.9rem;
      color: rgba(0, 255, 136, 0.9);
      font-family: 'Space Mono', monospace;
    }

    .logout-btn {
      background: linear-gradient(135deg, rgba(255, 0, 110, 0.2) 0%, rgba(255, 0, 110, 0.1) 100%);
      border: 1px solid rgba(255, 0, 110, 0.3);
      border-radius: 6px;
      padding: 0.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #ff006e;
    }

    .logout-btn:hover {
      background: rgba(255, 0, 110, 0.3);
      box-shadow: 0 0 15px rgba(255, 0, 110, 0.5);
      transform: scale(1.05);
    }

    .header-border {
      height: 2px;
      background: linear-gradient(90deg, #00ff88, #ff006e, #00ff88);
      animation: borderGlow 3s ease-in-out infinite;
    }

    .shop-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      animation: fadeInUp 0.6s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
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

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
      }

      .main-nav {
        gap: 1rem;
      }

      .nav-link {
        padding: 0.5rem 1rem;
        font-size: 0.75rem;
      }

      .brand-text {
        font-size: 1.2rem;
      }

      .shop-content {
        padding: 1rem;
      }
    }

    @media (max-width: 480px) {
      .main-nav {
        flex-wrap: wrap;
        justify-content: center;
      }

      .user-actions {
        flex-direction: column;
        gap: 0.5rem;
      }

      .user-info {
        align-items: center;
      }
    }
  `]
})
export class UserLayoutComponent {
  currentUser: User | null = null;
  cartItemCount = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.cartService.items$.subscribe(items => {
      this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
    });
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'Utilisateur';
    
    const firstName = (this.currentUser as any).firstName || '';
    const lastName = (this.currentUser as any).lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return fullName || this.currentUser.email || 'Utilisateur';
  }
}
