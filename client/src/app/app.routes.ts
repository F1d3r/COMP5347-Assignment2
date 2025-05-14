import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

export const routes: Routes = [
  { path: '', component:HomepageComponent, title: 'OldPhoneDeals' },
  { path: 'login', component:LoginComponent, title: 'Login' },
  { path: 'signup', component:SignupComponent, title: 'Signup' },
];