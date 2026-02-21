import { Routes } from '@angular/router';
import { ProductListComponent } from './product-list.component';
import { ProductDetailComponent } from './product-detail.component';
import { CartComponent } from './cart.component';
import { CheckoutComponent } from './checkout.component';
import { ProfileComponent } from './profile.component';
import { UserLayoutComponent } from './user-layout.component';

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: '', component: ProductListComponent },
      { path: 'product/:id', component: ProductDetailComponent },
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  }
];
