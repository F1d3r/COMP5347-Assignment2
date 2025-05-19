import { Component, OnInit, computed } from '@angular/core';
import { RouterModule, Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl} from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { User } from '../user';
import { UserService } from '../user.service';
import { catchError, last, throwError } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [RouterModule, ReactiveFormsModule, RouterLink, CommonModule, MatIconModule],

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
    
    .profile-header {
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
    
    .profile-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    
    .profile-content {
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
    
    input {
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
    
    .btn-reset {
      background-color: var(--warning);
    }
    
    .btn-reset:hover {
      background-color: #e67e22;
    }
    
    .btn-change {
      background-color: var(--accent);
    }
    
    .btn-change:hover {
      background-color: #c0392b;
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
    <div class="profile-header">
      <div class="header-content">
        <h2 class="header-title">User Profile</h2>
      </div>
    </div>
    
    <button class="btn-back" [routerLink]="['']">
      <mat-icon>arrow_back</mat-icon> Back to Home
    </button>
    
    <div class="profile-container">
      <div class="profile-content">
        <form [formGroup]="profileForm" (ngSubmit)="updateUser()">
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
          
          <!-- Buttons -->
          <div class="btn-container">
            <button 
              type="submit" 
              class="btn-update" 
              [disabled]="!profileForm.valid"
            >
              <mat-icon>check</mat-icon> Update Profile
            </button>
            
            <button 
              type="button"
              class="btn-reset" 
              (click)="resetPassword()"
            >
              <mat-icon>lock_reset</mat-icon> Reset Password
            </button>
            
            <button 
              type="button" 
              class="btn-change" 
              [routerLink]="['changePassword']"
            >
              <mat-icon>key</mat-icon> Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit{
  // user = computed(() => this.userService.user$());

  profileForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    firstname: new FormControl(''),
    lastname: new FormControl(''),
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Initialize the user detail.
    const user = this.userService.user$();
    if(user){
      this.profileForm.patchValue({
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname
      })
    }
  }


  resetPassword(){
    this.userService.resetPassword(null).subscribe(user=>{
      console.log("New user:", user);
      if(!user){
        console.error("No user returned.");
      }else{
        alert("Reset link sent to your email. Click to reset your password.");
        this.userService.user$.set(user);
      }

    })
    
  }

  updateUser(){
    // Get input detail
    const email = this.userService.user$()?.email ?? '';
    const newEmail = this.profileForm.value.email ?? '';
    const firstname = this.profileForm.value.firstname ?? '';
    const lastname = this.profileForm.value.lastname ?? '';
    console.log("Old email:",email);
    console.log("New email:", newEmail);
    console.log("First name:", firstname)
    console.log("Last name:", lastname);

    this.userService.updateUser(email, newEmail, firstname, lastname).pipe(
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
      console.log("User updated:", user);

      if(!user || Object.keys(user).length === 0){
        console.log("Update failed");
        this.userService.user$.set(null);
        console.log(user);
      }else{
        console.log("Update Success");
        this.userService.user$.set(user);
        console.log(user);
        this.router.navigate(['']);
      }
    })
  }
}