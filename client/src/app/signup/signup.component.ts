import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl} from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';

import { User } from '../user';
import { UserService } from '../user.service';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-signup',
  imports: [RouterModule, ReactiveFormsModule, CommonModule],

  styles: 
  `
    .signup-container {
      max-width: 500px;
      margin: 2rem auto;
      background-color: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .signup-header {
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
    
    .invalid-input {
      border: 2px solid red;
      background-color: #ffe6e6;
    }
    
    .error-message {
      color: red;
      font-size: 12px;
      margin-top: 4px;
      max-width: 300px;
      white-space: normal;
    }
  `,

  template: `
    <div class="signup-container">
      <div class="signup-header">
        <h1>Sign Up</h1>
      </div>
      
      <form [formGroup]="signupForm" (ngSubmit)="createUser()">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email"
            formControlName="email" 
            name="email"
            placeholder="Enter your email"
            [ngClass]="{'invalid-input': signupForm.controls.email.invalid && signupForm.controls.email.touched}"
          />
          <div class='error-message' *ngIf="signupForm.controls.email.invalid && signupForm.controls.email.touched">
            This field must be a valid email address.
          </div>
        </div>

        <div class="form-group">
          <label for="firstname">First Name</label>
          <input 
            type="text" 
            id="firstname"
            formControlName="firstname" 
            name="firstname"
            placeholder="Enter your first name"
          />
        </div>

        <div class="form-group">
          <label for="lastname">Last Name</label>
          <input 
            type="text" 
            id="lastname"
            formControlName="lastname" 
            name="lastname"
            placeholder="Enter your last name"
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
            [ngClass]="{'invalid-input': signupForm.controls.password.invalid && signupForm.controls.password.touched}"
          />
          <div class='error-message' *ngIf="signupForm.controls.password.invalid && signupForm.controls.password.touched">
            The password must contain at least 8 characters, at least one uppercase letter, one lowercase letter, and a symbol. 
          </div>
          
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
            [disabled]="!signupForm.valid"
          >Sign Up</button>
          
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
export class SignupComponent {
  signupForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    firstname: new FormControl(''),
    lastname: new FormControl(''),
    password: new FormControl('',
      [ Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
      ]),
  });
  showPassword = false;

  constructor(private userService: UserService, private router:Router) {}

  async createUser() {
    console.log("Submit");
    const email = this.signupForm.value.email ?? '';
    const firstname = this.signupForm.value.firstname ?? '';
    const lastname = this.signupForm.value.lastname ?? '';
    const password = this.signupForm.value.password ?? '';
    
    this.userService.createUser(email, firstname, lastname, password).pipe(
      catchError(error => {
        if(error.status === 409) {
          console.error("User already exists");
          alert("User exists, please login or signup with other email.")
        }else if(error.status === 500) {
          console.error("The server error", error);
          alert("The server has some error.")
        }
        return throwError(() => error)
      })
    )
    .subscribe(user =>{
      console.log("User created:", user);

      if(!user || Object.keys(user).length === 0){
        console.log("Signup failed");
        this.userService.user$.set(null);
        console.log(user);
      }else{
        console.log("Signup Success");
        this.userService.user$.set(user);
        console.log(user);
        this.router.navigate(['']);
      }
    })

  }

  goBack(){
    this.router.navigate(['']);
  }
  
  togglePasswordShow(){
    this.showPassword = !this.showPassword;
  }
}
