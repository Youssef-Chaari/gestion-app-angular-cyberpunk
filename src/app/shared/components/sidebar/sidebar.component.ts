import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <nav class="sidebar-nav">
        <button class="nav-item" [routerLink]="['/dashboard']" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <span class="nav-icon">📊</span>
          <span>TABLEAU DE BORD</span>
        </button>
        <button class="nav-item" [routerLink]="['/products']" routerLinkActive="active">
          <span class="nav-icon">📦</span>
          <span>PRODUITS</span>
        </button>
        <button class="nav-item" [routerLink]="['/categories']" routerLinkActive="active">
          <span class="nav-icon">🏷️</span>
          <span>CATÉGORIES</span>
        </button>
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, rgba(10, 14, 39, 0.8) 0%, rgba(26, 26, 62, 0.8) 100%);
      border-right: 2px solid #00ff88;
      padding: 2rem 0;
      backdrop-filter: blur(10px);
      box-shadow: inset -2px 0 20px rgba(0, 255, 136, 0.1);
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.2rem 1.5rem;
      color: #00ff88;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      border-left: 3px solid transparent;
      background: none;
      border: none;
      font-family: 'Orbitron', sans-serif;
      font-size: 0.95rem;
      letter-spacing: 1px;
      width: 100%;
      text-align: left;
      text-transform: uppercase;
      position: relative;
      overflow: hidden;
    }

    .nav-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.2), transparent);
      transition: left 0.5s ease;
    }

    .nav-item:hover::before {
      left: 100%;
    }

    .nav-item:hover {
      background: rgba(0, 255, 136, 0.1);
      border-left-color: #00ff88;
      box-shadow: inset 0 0 20px rgba(0, 255, 136, 0.2);
      transform: translateX(5px);
    }

    .nav-item.active {
      background: rgba(0, 255, 136, 0.2);
      border-left-color: #00ff88;
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.4), inset 0 0 20px rgba(0, 255, 136, 0.2);
    }

    .nav-icon {
      font-size: 1.5rem;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        border-right: none;
        border-bottom: 2px solid #00ff88;
        padding: 1rem 0;
        display: flex;
        overflow-x: auto;
      }

      .sidebar-nav {
        flex-direction: row;
        width: 100%;
      }

      .nav-item {
        padding: 1rem;
        white-space: nowrap;
      }
    }
  `]
})
export class SidebarComponent {}
