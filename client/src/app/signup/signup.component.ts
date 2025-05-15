import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormGroup, FormControl} from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';

import { User } from '../user';
import { UserService } from '../user.service';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule],

  styles: 
  `
    form{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap:10px;
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
    <form [formGroup]="signupForm" (ngSubmit)="createUser()">
      <h1>
        Signup
      </h1>
      <div>
        <label>Email
          <input type="email" formControlName="email" name="email" 
            [ngClass]="{'invalid-input': signupForm.controls.email.invalid 
            && signupForm.controls.email.touched}"/>
        </label>
        <div class='error-message' *ngIf="signupForm.controls.email.invalid 
          && signupForm.controls.email.touched">
          This field must be a valid email address.
        </div>
      </div>

      
      <div>
        <label>First Name
          <input type="text" formControlName="firstname" name="firstname"/>
        </label>
      </div>

      <div>
        <label>Last Name
          <input type="text" formControlName="lastname" name="lastname"/>
        </label>
      </div>

      <div>
        <label>Password
          <input type="text" formControlName="password" name="password" 
            [ngClass]="{'invalid-input': signupForm.controls.password.invalid 
            && signupForm.controls.email.touched}"/>
        </label>
        <div class='error-message' *ngIf="signupForm.controls.password.invalid 
          && signupForm.controls.password.touched">
          The password must contain at least 8 characters, at least one uppercase letter, one lowercase letter, and a symbol. 
        </div>
      </div>

      <div>
        <button type="submit" [disabled]="!signupForm.valid">Submit</button>
        <button (click)="goBack()">Go Back</button>
      </div>
    </form>
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
}
