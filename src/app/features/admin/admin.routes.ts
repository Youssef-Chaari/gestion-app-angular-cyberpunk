import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardComponent
  },
  {
    path: 'products',
    loadChildren: () => import('./products/products.routes').then(m => m.PRODUCTS_ROUTES)
  },
  {
    path: 'categories',
    loadChildren: () => import('./categories/categories.routes').then(m => m.CATEGORIES_ROUTES)
  },
  {
    path: 'inventory',
    loadComponent: () => import('./admin-products.component').then(c => c.AdminProductsComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders-history.component').then(c => c.OrdersHistoryComponent)
  }
];
