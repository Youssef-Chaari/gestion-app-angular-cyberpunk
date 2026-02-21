import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-form">
        <h1>⚡ GESTION APP</h1>
        <div *ngIf="error" class="alert alert-error">{{ error }}</div>
        <form (ngSubmit)="login()">
          <div class="form-group">
            <label for="email">EMAIL</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              placeholder="admin@example.com"
              required
            >
          </div>
          <div class="form-group">
            <label for="password">MOT DE PASSE</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              required
            >
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'CONNEXION...' : 'CONNEXION' }}
          </button>
          <button type="button" class="btn btn-secondary" (click)="goToRegister()">
            CRÉER UN COMPTE
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 50%, #0f0f23 100%);
      position: relative;
      overflow: hidden;
    }

    .login-container::before {
      content: '';
      position: absolute;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, transparent 70%);
      border-radius: 50%;
      top: -100px;
      left: -100px;
      animation: float 6s ease-in-out infinite;
    }

    .login-container::after {
      content: '';
      position: absolute;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255, 0, 110, 0.2) 0%, transparent 70%);
      border-radius: 50%;
      bottom: -100px;
      right: -100px;
      animation: float 8s ease-in-out infinite reverse;
    }

    .login-form {
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.9) 0%, rgba(26, 26, 62, 0.9) 100%);
      padding: 3rem;
      border-radius: 8px;
      width: 100%;
      max-width: 450px;
      border: 2px solid #00ff88;
      box-shadow: 0 0 40px rgba(0, 255, 136, 0.3), inset 0 0 40px rgba(0, 255, 136, 0.1);
      backdrop-filter: blur(10px);
      position: relative;
      z-index: 10;
    }

    h1 {
      margin-bottom: 2rem;
      color: #00ff88;
      text-align: center;
      font-family: 'Orbitron', sans-serif;
      font-size: 2rem;
      letter-spacing: 3px;
      animation: glow 2s ease-in-out infinite;
      text-transform: uppercase;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.7rem;
      font-family: 'Orbitron', sans-serif;
      font-weight: 700;
      color: #00ff88;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-size: 0.85rem;
    }

    input {
      width: 100%;
      padding: 0.9rem;
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

    button {
      width: 100%;
      padding: 0.9rem;
      border: 2px solid;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
      color: #0a0e27;
      border-color: #00ff88;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #00ff88 0%, #00dd77 100%);
      box-shadow: 0 0 40px rgba(0, 255, 136, 0.8);
      transform: translateY(-2px);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: transparent;
      color: #00ff88;
      border-color: #00ff88;
      box-shadow: inset 0 0 20px rgba(0, 255, 136, 0.2);
    }

    .btn-secondary:hover {
      background: rgba(0, 255, 136, 0.1);
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.5), inset 0 0 20px rgba(0, 255, 136, 0.2);
    }

    .alert {
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      border: 1px solid;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-size: 0.85rem;
    }

    .alert-error {
      background: rgba(255, 0, 110, 0.1);
      color: #ff006e;
      border-color: #ff006e;
      box-shadow: 0 0 15px rgba(255, 0, 110, 0.3);
    }

    @keyframes glow {
      0%, 100% {
        text-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88, 0 0 30px #00ff88;
      }
      50% {
        text-shadow: 0 0 20px #00ff88, 0 0 30px #00ff88, 0 0 40px #00ff88, 0 0 50px #00ff88;
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-20px);
      }
    }
  `]
})
export class LoginComponent {
  email = 'admin@example.com';
  password = 'password';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          const user = this.authService.getCurrentUser();
          if (user && user.role === 'admin') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/shop']);
          }
        } else {
          this.error = response.message || 'Erreur de connexion';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Erreur de connexion. Veuillez réessayer.';
        console.error(err);
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}
