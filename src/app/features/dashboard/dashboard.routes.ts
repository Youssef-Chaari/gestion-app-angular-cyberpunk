import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'products',
    loadComponent: () => import('./admin-products.component').then(c => c.AdminProductsComponent)
  }
];
