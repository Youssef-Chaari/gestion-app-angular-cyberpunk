import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-container">
      <app-navbar *ngIf="isAuthenticated$ | async"></app-navbar>
      <div class="app-main" *ngIf="isAuthenticated$ | async">
        <app-sidebar></app-sidebar>
        <main class="app-content">
          <router-outlet></router-outlet>
        </main>
      </div>
      <router-outlet *ngIf="!(isAuthenticated$ | async)"></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-main {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .app-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      background: linear-gradient(135deg, rgba(10, 14, 39, 0.5) 0%, rgba(26, 26, 62, 0.5) 100%);
    }

    @media (max-width: 768px) {
      .app-main {
        flex-direction: column;
      }

      .app-content {
        padding: 1rem;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  isAuthenticated$ = this.authService.isAuthenticated$;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.checkAuth();
  }
}
