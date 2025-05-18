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
    form{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap:10px;
    }
  `,

  template: `
    <form [formGroup]="loginForm" (ngSubmit)="authenticateUser()">
      <h1>
        Login
      </h1>
      <div>
        <label>Email
          <input type="email" formControlName="email" name="email"/>
        </label>
      </div>

      <div>
        <label>Password
          <input [type]="showPassword?'text':'password'" 
          formControlName="password" name="paswword" require
          [ngClass]="{'invalid-input': loginForm.controls.password.invalid 
          && loginForm.controls.password.touched}"/>
        </label>
        <label>
          <input type="checkbox" (change)="togglePasswordShow()">
          Show Password
        </label>
      </div>

      <div>
        <button type="submit" [disabled]="!loginForm.valid">Submit</button>
        <button type='button' [routerLink]="['forgot']">Forgot Password</button>
        <button type='button' [routerLink]="['']">Go Back</button>
      </div>
    </form>
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
