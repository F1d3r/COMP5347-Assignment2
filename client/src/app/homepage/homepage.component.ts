import { Component, OnInit, WritableSignal, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';

import { TopSellerComponent } from './top-seller.component';
import { SoldOutSoonComponent } from './sold-out-soon.component';
import { SearchFormComponent } from '../search-form/search-form.component';

import { UserService } from './../user.service';
import { User } from '../user';

@Component({
  selector: 'app-homepage',
  imports: [CommonModule, RouterModule, MatToolbarModule,
    TopSellerComponent, SoldOutSoonComponent, SearchFormComponent],

  styles: [
    `
      .toolbar{
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    `
  ],
  
  template: `
    <mat-toolbar class='toolbar'>
      <div>
        <span span>Welcome to {{title}}</span>
      </div>
      <div>
        <ng-container *ngIf='!this.user()'>
          <button id='loginBtn' [routerLink]="['login']">Login</button>
          <button id='loginBtn' [routerLink]="['signup']">Sign Up</button>
        </ng-container>

        <ng-container *ngIf="this.user()">
          <span>Hello, {{ user()?.lastname }}</span>
          <button id="logoutBtn" (click)="logout()">Logout</button>
        </ng-container>
      </div>
    </mat-toolbar>

    <main>
      <!-- Constructed by the best seller component and sold out soon component -->
      <app-search-form></app-search-form>
      <app-top-seller></app-top-seller>
      <app-sold-out-soon></app-sold-out-soon>
    </main>
  `
})
export class HomepageComponent implements OnInit {
  title = 'OldPhoneDeals';
  // Use the signal to track the current user state.
  // Initialized as null, indicating a guest user.
  user = computed(() => this.userService.user$());

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    effect(() => {
      console.log('User Updated:', this.user());
      console.log('Lastname: ', this.user()?.lastname);
        console.log(Array.isArray(this.user()));
    });
  }

  ngOnInit() {
    this.user  = computed(() => this.userService.user$());
  }

  logout(){
    // this.user.set(null);
    // this.userService.clearUser();
  }
}
