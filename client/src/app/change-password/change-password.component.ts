import { catchError } from 'rxjs';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl} from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';

import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, CommonModule],

  styles: `
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
    <form [formGroup]="changePwdForm" (ngSubmit)="changePassword()">
      <h1>
        Change Your Password
      </h1>
      <div>
        <label>New Password
          <input [type]="showPassword?'text':'password'" 
          formControlName="newPassword" name="newPassword" require
          [ngClass]="{'invalid-input': changePwdForm.controls.newPassword.invalid 
          && changePwdForm.controls.newPassword.touched}"/>

          <label>
            <input type="checkbox" (change)="togglePasswordShow()">
            Show Password
          </label>
        </label>
      </div>
      <div class='error-message' *ngIf="changePwdForm.controls.newPassword.invalid 
        && changePwdForm.controls.newPassword.touched">
        The password must contain at least 8 characters, at least one uppercase letter, one lowercase letter, and a symbol. 
      </div>

      <div>
        <button type="submit" [disabled]="!changePwdForm.valid">Update</button>
        <button (click)="goBack()">Go Back</button>
      </div>
    </form>
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
    this.router.navigate(['']);
  }
}
