import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { TopSellerComponent } from './homepage/top-seller.component';
import { SoldOutSoonComponent } from './homepage/sold-out-soon.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

export const routes: Routes = [
  { path: '', component:HomepageComponent, title: 'OldPhoneDeals' },
  { path: 'login', component:LoginComponent, title: 'Login' },
  { path: 'sign', component:SignupComponent, title: 'Signup' },
];