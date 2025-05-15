import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl} from '@angular/forms';
import { ReactiveFormsModule, Validators } from '@angular/forms';

import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],

  styles: `
    form{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap:10px;
    }
  `,

  template: `
    <form [formGroup]="changePwdForm" (ngSubmit)="changePassword()">
      <h1>
        Change Your Password
      </h1>
      <div>
        <label>New Password
          <input [type]="showPassword ? 'text' : 'password'" formControlName="newPassword" name="newPassword" required/>
          <label>
            <input type="checkbox" (change)="togglePasswordShow()"> Show Password
          </label>
        </label>
      </div>

      <div>
        <button type="submit" [disabled]="!changePwdForm.valid">Update</button>
      </div>
    </form>
  `
})
export class ChangePasswordComponent {
  showPassword: boolean = false;
  changePwdForm = new FormGroup({
    newPassword: new FormControl('', [Validators.required])
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
}
