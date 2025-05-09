import { Routes } from '@angular/router';
import { ShopComponent } from './shop/shop.component';
import { CartComponent } from './cart/cart.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { WishlistComponent } from './wishlist/wishlist.component';

export const routes: Routes = [
  { path: 'shop', component: ShopComponent },
  { path: 'cart', component: CartComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: '', redirectTo: 'shop', pathMatch: 'full' }
];
