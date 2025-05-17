import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileComponent } from './profile/profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ItemComponent } from './item/item.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

export const routes: Routes = [
  { path: '', component:HomepageComponent, title: 'OldPhoneDeals' },
  { path: 'login', component:LoginComponent, title: 'Login' },
  { path: 'signup', component:SignupComponent, title: 'Signup' },
  { path: 'profile', component:ProfileComponent, title: 'Profile' },
  { path: 'item/:id', component:ItemComponent, title: 'Item' },
  { path: 'login/forgot', component:ForgotPasswordComponent, title: 'Forgot' },
  { path: 'profile/changePassword', component:ChangePasswordComponent, title: 'ChangePassword' },
];