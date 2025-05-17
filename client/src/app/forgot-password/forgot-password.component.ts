import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterModule, CommonModule ],
  template: `

  <div>
    <button [routerLink]="['']">Go Home</button>
  </div>

  <div class="content">
    <div *ngIf="!this.success">
      <form [formGroup]="forgotForm" (ngSubmit)="resetPassword()">
        <div>
          <input type="text" formControlName="email" name="email" placeholder="Input Email"/>
        </div>

        <div>
          <button type="submit" [disabled]="!forgotForm.valid">Reset Password</button>
        </div>

      </form>
    </div>
    
    <div *ngIf="this.success">
      <h2>The password link is sent to your emial, please click the link to reset your password.</h2>
    </div>
  </div>

    

  `,
  styles: `
  .content{
    display: grid;
    place-items: center;
    text-align: center;
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  div{
    margin: 10px;
  }

  `
})
export class ForgotPasswordComponent {
  forgotForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
  });
  success: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ){}



  resetPassword(){
    console.log("email:",this.forgotForm.value.email);
    this.userService.resetPassword(this.forgotForm.value.email!).subscribe(user=>{
      console.log(user);
      // Handle request fail.
      if(!user){
        alert("The user does not exist. Please try again.");
        this.forgotForm.reset();
        return;
      }
      // If a user is returned.
      this.success = true;
    })
  }

}
