import { Component, OnInit, computed } from '@angular/core';
import { RouterModule, Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl} from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';

import { User } from '../user';
import { UserService } from '../user.service';
import { catchError, last, throwError } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [RouterModule, ReactiveFormsModule, RouterLink],

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
    <form [formGroup]="profileForm" (ngSubmit)="updateUser()">
      <h1>
        User Profile
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

      <!-- Buttons -->
      <div>
        <button type="submit" [disabled]="!profileForm.valid">Update</button>
        <button (click)="resetPassword()">Reset Password</button>
        <button type = 'button' [routerLink]="['changePassword']">Change Password</button>
        <button (click)="goBack()">Go Back</button>
      </div>
    </form>
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
    this.userService.resetPassword().subscribe(user=>{
      console.log("New user:", user);
      if(!user){
        console.error("No user returned.");
      }else{
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

  goBack(){
    this.router.navigate(['']);
  }
}
