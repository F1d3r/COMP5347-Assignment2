import { catchError } from 'rxjs';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl} from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, MatIconModule],

  styles: `
    :host {
      --primary-dark: #2c3e50;
      --primary-light: #3498db;
      --accent: #e74c3c;
      --success: #27ae60;
      --warning: #f39c12;
      --text-dark: #2c3e50;
      --text-light: #ecf0f1;
      --text-muted: #7f8c8d;
      --border-light: #e1e5e9;
      --bg-light: #f5f7fa;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
      --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
      display: block;
      background-color: var(--bg-light);
      padding: 1rem;
      font-family: 'Arial', sans-serif;
      min-height: 100vh;
    }
    
    .password-header {
      background-color: var(--primary-dark);
      color: white;
      width: 100%;
      box-shadow: var(--shadow-sm);
      padding: 1rem;
      border-radius: 8px 8px 0 0;
      margin-bottom: 1rem;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .header-title {
      font-size: 1.5rem;
      margin: 0;
    }
    
    .password-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    
    .password-content {
      padding: 2rem;
    }
    
    form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    label {
      color: var(--text-dark);
      font-weight: 500;
    }
    
    input[type="password"], input[type="text"] {
      padding: 0.75rem;
      border: 1px solid var(--border-light);
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    
    input:focus {
      border-color: var(--primary-light);
      outline: none;
    }
    
    .invalid-input {
      border: 2px solid var(--accent) !important;
      background-color: rgba(231, 76, 60, 0.1);
    }
    
    .error-message {
      color: var(--accent);
      font-size: 0.85rem;
      margin-top: 0.5rem;
      max-width: 100%;
    }
    
    .checkbox-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    
    .checkbox-wrapper input {
      margin: 0;
    }
    
    .btn-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    
    button {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
      background-color: var(--primary-light);
      color: white;
    }
    
    button:hover {
      background-color: #2980b9;
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }
    
    .btn-back {
      background-color: #95a5a6;
      margin-bottom: 1.5rem;
    }
    
    .btn-back:hover {
      background-color: #7f8c8d;
    }
    
    .btn-update {
      background-color: var(--success);
    }
    
    .btn-update:hover {
      background-color: #219653;
    }
    
    button:disabled {
      background-color: #bdc3c7;
      cursor: not-allowed;
      transform: none;
    }
    
    @media (max-width: 768px) {
      .btn-container {
        flex-direction: column;
      }
      
      button {
        width: 100%;
      }
    }
  `,

  template: `
    <div class="password-header">
      <div class="header-content">
        <h2 class="header-title">Change Password</h2>
      </div>
    </div>
    
    <button class="btn-back" (click)="goBack()">
      <mat-icon>arrow_back</mat-icon> Back to Profile
    </button>
    
    <div class="password-container">
      <div class="password-content">
        <form [formGroup]="changePwdForm" (ngSubmit)="changePassword()">
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input 
              [type]="showPassword ? 'text' : 'password'" 
              id="newPassword"
              formControlName="newPassword" 
              name="newPassword" 
              require
              [ngClass]="{'invalid-input': changePwdForm.controls.newPassword.invalid && changePwdForm.controls.newPassword.touched}"
              placeholder="Enter your new password"
            />
            
            <div class="checkbox-wrapper">
              <input 
                type="checkbox" 
                id="showPassword" 
                (change)="togglePasswordShow()"
              >
              <label for="showPassword">Show Password</label>
            </div>
            
            <div class='error-message' *ngIf="changePwdForm.controls.newPassword.invalid && changePwdForm.controls.newPassword.touched">
              Password must have at least 8 characters, one uppercase letter, one lowercase letter, and a symbol.
            </div>
          </div>
  
          <div class="btn-container">
            <button 
              type="submit" 
              class="btn-update" 
              [disabled]="!changePwdForm.valid"
            >
              <mat-icon>check</mat-icon> Update Password
            </button>
            
            <button 
              type="button"
              class="btn-back" 
              (click)="goBack()"
            >
              <mat-icon>cancel</mat-icon> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ChangePasswordComponent {
  showPassword: boolean = false;
  changePwdForm = new FormGroup({
    newPassword: new FormControl('', 
      [ Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
      ])
  });

  constructor(private userService: UserService,
              private router: Router
  ){}

  togglePasswordShow(){
    this.showPassword = !this.showPassword;
  }

  changePassword(){
    const _id = this.userService.user$()?._id ?? '';
    const newPwd = this.changePwdForm.value.newPassword ?? '';
    this.userService.changeUserPwd(_id, newPwd).subscribe(user =>{
      if(!user){
        console.error("Failed to change password");
        return;
      }
      // Update the details of user and return to homepage.
      this.userService.user$.set(user);
      this.router.navigate(['']);
    })
  }

  goBack(){
    this.router.navigate(['profile']);
  }
}