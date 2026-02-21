import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-left">
        <span class="navbar-icon">⚡</span>
        <div class="navbar-title">GESTION APP</div>
      </div>
      <div class="navbar-right">
        <div class="user-info">{{ currentUser?.username | uppercase }}</div>
        <button class="logout-btn" (click)="logout()">DÉCONNEXION</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(90deg, rgba(10, 14, 39, 0.95) 0%, rgba(26, 26, 62, 0.95) 50%, rgba(15, 15, 35, 0.95) 100%);
      border-bottom: 2px solid #00ff88;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 999;
      box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
      backdrop-filter: blur(10px);
    }

    .navbar::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #00ff88, transparent);
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .navbar-icon {
      font-size: 2rem;
      animation: float 3s ease-in-out infinite;
    }

    .navbar-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.8rem;
      font-weight: 900;
      letter-spacing: 3px;
      animation: glow 2s ease-in-out infinite;
      text-transform: uppercase;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .user-info {
      font-family: 'Orbitron', sans-serif;
      font-size: 0.9rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 0.5rem 1rem;
      border: 1px solid #00ff88;
      border-radius: 4px;
      background: rgba(0, 255, 136, 0.1);
    }

    .logout-btn {
      font-family: 'Orbitron', sans-serif;
      background: transparent;
      border: 2px solid #ff006e;
      color: #ff006e;
      padding: 0.6rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      transition: all 0.3s ease;
      box-shadow: 0 0 10px rgba(255, 0, 110, 0.3);
    }

    .logout-btn:hover {
      background: #ff006e;
      color: #0a0e27;
      box-shadow: 0 0 20px rgba(255, 0, 110, 0.8);
      text-shadow: 0 0 10px rgba(255, 0, 110, 0.5);
    }

    @media (max-width: 768px) {
      .navbar {
        flex-direction: column;
        gap: 1rem;
      }

      .navbar-right {
        width: 100%;
        justify-content: space-between;
      }

      .navbar-title {
        font-size: 1.3rem;
      }
    }
  `]
})
export class NavbarComponent {
  currentUser = this.authService.getCurrentUser();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
