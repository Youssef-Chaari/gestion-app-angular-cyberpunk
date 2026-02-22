import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FirebaseAuthService } from '../../../core/services/firebase-auth.service';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-form">
        <h1>⚡ CRÉER UN COMPTE</h1>
        <p class="subtitle">Rejoignez notre plateforme</p>
        
        <div *ngIf="error" class="alert alert-error">{{ error }}</div>
        <div *ngIf="success" class="alert alert-success">{{ success }}</div>
        
        <div *ngIf="emailVerificationSent" class="alert alert-info">
          <div class="verification-message">
            <p>📧 {{ emailVerificationMessage }}</p>
            <p style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">
              Un lien de vérification a été envoyé à votre adresse email. Cliquez sur le lien pour vérifier votre compte.
            </p>
            <p style="margin-top: 0.5rem; font-size: 0.85rem; opacity: 0.7;">
              ⏳ Vérification en cours... Vous serez redirigé automatiquement une fois votre email confirmé.
            </p>
          </div>
        </div>

        <form (ngSubmit)="register()" *ngIf="!emailVerificationSent">
          <div class="form-group">
            <label for="firstName">PRÉNOM</label>
            <input
              type="text"
              id="firstName"
              [(ngModel)]="firstName"
              name="firstName"
              placeholder="Jean"
              required
            >
          </div>

          <div class="form-group">
            <label for="lastName">NOM</label>
            <input
              type="text"
              id="lastName"
              [(ngModel)]="lastName"
              name="lastName"
              placeholder="Dupont"
              required
            >
          </div>

          <div class="form-group">
            <label for="email">EMAIL</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              placeholder="votre.email@example.com"
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
            <small>Au minimum 6 caractères</small>
          </div>

          <div class="form-group">
            <label for="confirmPassword">CONFIRMER MOT DE PASSE</label>
            <input
              type="password"
              id="confirmPassword"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              required
            >
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="loading">
            {{ loading ? 'CRÉATION...' : 'CRÉER UN COMPTE' }}
          </button>

          <button type="button" class="btn btn-secondary" (click)="goToLogin()" [disabled]="loading">
            RETOUR À LA CONNEXION
          </button>
        </form>

        <div *ngIf="emailVerificationSent" class="verification-actions">
          <button type="button" class="btn btn-primary" (click)="goToLogin()">
            ALLER À LA CONNEXION
          </button>
        </div>

        <div class="login-link" *ngIf="!emailVerificationSent">
          Vous avez déjà un compte? 
          <a routerLink="/auth/login">Connectez-vous</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(26, 26, 62, 0.95) 100%);
      position: relative;
      overflow: hidden;
    }

    .register-container::before {
      content: '';
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      top: -100px;
      right: -100px;
      z-index: 0;
    }

    .register-form {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 500px;
      padding: 2.5rem;
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.9) 0%, rgba(26, 26, 62, 0.9) 100%);
      border: 2px solid rgba(0, 255, 136, 0.3);
      border-radius: 15px;
      box-shadow: 0 0 50px rgba(0, 255, 136, 0.2), inset 0 0 50px rgba(0, 255, 136, 0.05);
      animation: slideInUp 0.6s ease-out;
      margin: 0 1rem;
    }

    .register-form::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #00ff88, #ff006e, #00ff88);
      border-radius: 15px 15px 0 0;
      animation: borderGlow 3s ease-in-out infinite;
    }

    h1 {
      text-align: center;
      font-family: 'Orbitron', sans-serif;
      font-size: 2rem;
      color: #00ff88;
      margin: 0 0 0.5rem 0;
      text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
      letter-spacing: 2px;
    }

    .subtitle {
      text-align: center;
      color: rgba(0, 255, 136, 0.6);
      margin: 0 0 2rem 0;
      font-size: 0.95rem;
      font-family: 'Space Mono', monospace;
    }

    .form-group {
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
    }

    label {
      color: #00ff88;
      margin-bottom: 0.5rem;
      font-weight: 600;
      font-family: 'Space Mono', monospace;
      font-size: 0.85rem;
      letter-spacing: 1px;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }

    input {
      padding: 0.875rem;
      background: rgba(0, 255, 136, 0.05);
      border: 2px solid rgba(0, 255, 136, 0.2);
      border-radius: 8px;
      color: #00ff88;
      font-family: 'Space Mono', monospace;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      outline: none;
    }

    input::placeholder {
      color: rgba(0, 255, 136, 0.3);
    }

    input:focus {
      border-color: #00ff88;
      background: rgba(0, 255, 136, 0.1);
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
    }

    small {
      color: rgba(0, 255, 136, 0.5);
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .btn {
      padding: 0.875rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-family: 'Space Mono', monospace;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 1px;
      margin-bottom: 0.75rem;
      width: 100%;
    }

    .btn-primary {
      background: linear-gradient(135deg, #00ff88, #00cc6a);
      color: #0a0e27;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
    }

    .btn-secondary {
      background: transparent;
      color: rgba(0, 255, 136, 0.8);
      border: 2px solid rgba(0, 255, 136, 0.3);
    }

    .btn-secondary:hover:not(:disabled) {
      border-color: #00ff88;
      color: #00ff88;
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .alert {
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      border-left: 4px solid;
      font-family: 'Space Mono', monospace;
      font-size: 0.9rem;
    }

    .alert-error {
      background: rgba(255, 0, 110, 0.1);
      color: #ff006e;
      border-color: #ff006e;
      box-shadow: 0 0 15px rgba(255, 0, 110, 0.3);
    }

    .alert-success {
      background: rgba(0, 255, 136, 0.1);
      color: #00ff88;
      border-color: #00ff88;
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
    }

    .alert-info {
      background: rgba(0, 150, 255, 0.1);
      color: #00aaff;
      border: 2px solid #00aaff;
      box-shadow: 0 0 15px rgba(0, 170, 255, 0.3);
    }

    .verification-message {
      padding: 1rem;
      text-align: center;
    }

    .verification-message p {
      margin: 0;
      line-height: 1.5;
    }

    .verification-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .verification-actions .btn {
      flex: 1;
    }

    .login-link {
      text-align: center;
      color: rgba(0, 255, 136, 0.6);
      font-family: 'Space Mono', monospace;
      margin-top: 1.5rem;
      font-size: 0.9rem;
    }

    .login-link a {
      color: #00ff88;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .login-link a:hover {
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes borderGlow {
      0%, 100% {
        box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
      }
      50% {
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
      }
    }

    @media (max-width: 600px) {
      .register-form {
        padding: 1.5rem;
      }

      h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class RegisterComponent implements OnInit, OnDestroy {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';
  success = '';
  emailVerificationSent = false;
  emailVerificationMessage = '';
  private destroy$ = new Subject<void>();
  private registeredEmail = '';

  constructor(
    private firebaseAuthService: FirebaseAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is already logged in and verified, redirect to shop
    const currentUser = this.firebaseAuthService.getCurrentFirebaseUser();
    if (currentUser) {
      this.router.navigate(['/shop']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startVerificationCheck(): void {
    if (!this.registeredEmail) return;

    // Check every 3 seconds if email is verified
    interval(3000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.firebaseAuthService.checkEmailVerification().subscribe({
          next: (isVerified) => {
            if (isVerified) {
              this.emailVerificationSent = false;
              this.success = '✓ Email vérifié! Redirection vers la connexion...';
              setTimeout(() => {
                this.router.navigate(['/auth/login']);
              }, 1500);
            }
          },
          error: (err) => {
            console.log('Vérification en attente...');
          }
        });
      });
  }

  register(): void {
    // Validation
    if (!this.firstName.trim()) {
      this.error = 'Le prénom est requis';
      return;
    }

    if (!this.lastName.trim()) {
      this.error = 'Le nom est requis';
      return;
    }

    if (!this.email.trim()) {
      this.error = 'L\'email est requis';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';
    this.emailVerificationSent = false;

    this.firebaseAuthService.register(this.email, this.password, {
      firstName: this.firstName,
      lastName: this.lastName
    }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.emailVerificationSent) {
          this.emailVerificationSent = true;
          this.registeredEmail = this.email;
          this.emailVerificationMessage = response.message;
          this.success = '';
          // Clear form
          this.firstName = '';
          this.lastName = '';
          this.email = '';
          this.password = '';
          this.confirmPassword = '';
          // Start checking for email verification
          this.startVerificationCheck();
        } else {
          this.success = 'Compte créé avec succès! Redirection...';
          setTimeout(() => {
            this.router.navigate(['/shop']);
          }, 2000);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Register error:', err);
        if (err.code === 'auth/email-already-in-use') {
          this.error = 'Cet email est déjà utilisé';
        } else if (err.code === 'auth/invalid-email') {
          this.error = 'Email invalide';
        } else if (err.code === 'auth/weak-password') {
          this.error = 'Le mot de passe est trop faible';
        } else {
          this.error = err.message || 'Erreur lors de la création du compte';
        }
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
