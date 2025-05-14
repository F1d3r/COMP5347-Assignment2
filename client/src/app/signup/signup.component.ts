import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl} from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';

import { User } from '../user';
import { UserService } from '../user.service';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-signup',
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
    <form [formGroup]="signupForm" (ngSubmit)="createUser()">
      <h1>
        Signup
      </h1>
      <div>
        <label>Email
          <input type="email" formControlName="email" name="email"/>
        </label>
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
          <input type="text" formControlName="password" name="password"/>
        </label>
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
    password: new FormControl('', Validators.required),
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
        }
        return throwError(() => error)
      })
    )
    .subscribe(user =>{
      console.log("User created:", user);

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
