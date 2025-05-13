import { Routes } from '@angular/router';
import { TopSellerComponent } from './top-seller/top-seller.component';
import { SoldOutSoonComponent } from './sold-out-soon/sold-out-soon.component';

export const routes: Routes = [
  { path: '', component: TopSellerComponent, title: 'Employees List' },
];