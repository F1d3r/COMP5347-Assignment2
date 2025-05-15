import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl} from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';

import { User } from '../user';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],

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
          <input type="text" formControlName="password" name="password"/>
        </label>
      </div>

      <div>
        <button type="submit" [disabled]="!loginForm.valid">Submit</button>
        <button (click)="goBack()">Go Back</button>
      </div>
    </form>
  `,
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  constructor(private userService: UserService, private router:Router) {}

  async authenticateUser() {
    console.log("Submit");
    const email = this.loginForm.value.email ?? '';
    const password = this.loginForm.value.password ?? '';
    
    this.userService.getUser(email, password).subscribe(user =>{
      if(!user || Object.keys(user).length === 0){
        console.log("Authentication failed");
        this.userService.user$.set(null);
        console.log(user);
      }else{
        console.log("Login Success");
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
