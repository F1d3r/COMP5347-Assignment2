import { Component } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl } from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';

import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  imports: [ RouterModule, ReactiveFormsModule, CommonModule ],

  styles: 
  `
    .login-container {
      max-width: 500px;
      margin: 2rem auto;
      background-color: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .login-header {
      background-color: #2c3e50;
      color: white;
      padding: 1rem;
      margin: -2rem -2rem 2rem -2rem;
      border-radius: 8px 8px 0 0;
      text-align: center;
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
      color: #2c3e50;
      font-weight: 500;
    }
    
    input[type="email"], input[type="password"], input[type="text"] {
      padding: 0.75rem;
      border: 1px solid #e1e5e9;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }
    
    input[type="email"]:focus, input[type="password"]:focus, input[type="text"]:focus {
      border-color: #3498db;
      outline: none;
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
      margin-top: 0.5rem;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      font-weight: 500;
      border: none;
      flex: 1;
      min-width: 120px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .btn-primary {
      background-color: #3498db;
      color: white;
    }
    
    .btn-primary:hover {
      background-color: #2980b9;
      transform: translateY(-2px);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .btn-secondary {
      background-color: #95a5a6;
      color: white;
    }
    
    .btn-secondary:hover {
      background-color: #7f8c8d;
      transform: translateY(-2px);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .btn-outline {
      background-color: transparent;
      border: 1px solid #3498db;
      color: #3498db;
    }
    
    .btn-outline:hover {
      background-color: rgba(52, 152, 219, 0.1);
      transform: translateY(-2px);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .btn:disabled {
      background-color: #bdc3c7;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  `,

  template: `
    <div class="login-container">
      <div class="login-header">
        <h1>Login</h1>
      </div>
      
      <form [formGroup]="loginForm" (ngSubmit)="authenticateUser()">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email"
            formControlName="email" 
            name="email"
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input 
            [type]="showPassword ? 'text' : 'password'" 
            id="password"
            formControlName="password" 
            name="password" 
            placeholder="Enter your password"
            [ngClass]="{'invalid-input': loginForm.controls.password.invalid && loginForm.controls.password.touched}"
          />
          
          <div class="checkbox-wrapper">
            <input 
              type="checkbox" 
              id="showPassword" 
              (change)="togglePasswordShow()"
            >
            <label for="showPassword">Show Password</label>
          </div>
        </div>

        <div class="btn-container">
          <button 
            type="submit" 
            class="btn btn-primary" 
            [disabled]="!loginForm.valid"
          >Login</button>
          
          <button 
            type='button' 
            class="btn btn-outline" 
            [routerLink]="['forgot']"
          >Forgot Password</button>
          
          <button 
            type='button' 
            class="btn btn-secondary" 
            [routerLink]="['']"
          >Back to Home</button>
        </div>
      </form>
    </div>
  `,
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });
  showPassword = false;

  constructor(
    private userService: UserService, 
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  
  async authenticateUser() {
    console.log("Submit");
    const email = this.loginForm.value.email ?? '';
    const password = this.loginForm.value.password ?? '';
    
    this.userService.getUser(email, password).subscribe({
      next: (user) =>{
        console.log('User:',user);
        if(!user || Object.keys(user).length == 0){
          alert("Authentication failed");
          this.userService.user$.set(null);
          console.log(user);
        }else{
          console.log("Login Success");
          this.userService.user$.set(user);
          console.log(user);
          this.router.navigate(['']);
        }
      },
      // Handle error
      error: (error)=>{
        if(error.status === 401){
          alert("Password incorrect, please try again");
        }else if(error.status === 404){
          alert("User does not exist, please try again");
        }else{
          console.error("Unexpected error", error);
        }
        this.loginForm.reset();
      }
    })

  }

  togglePasswordShow(){
    this.showPassword = !this.showPassword;
  }
}
