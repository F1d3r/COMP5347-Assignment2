import { Component, OnInit, WritableSignal, computed, effect, signal } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';

import { UserService } from './../user.service';
import { User } from '../user';
import { PhoneListComponent } from "../phone-list/phone-list.component";
import { SearchFormComponent } from '../search-form/search-form.component';

@Component({
  selector: 'app-homepage',
  imports: [CommonModule, RouterModule, MatToolbarModule, PhoneListComponent, SearchFormComponent],

  styles: [
    `
      .toolbar{
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      #suggest{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
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
      <!-- The page framework for home state -->
      <div id='homeState' *ngIf="pageState() == 'home'">
        <app-search-form></app-search-form>
        <div id='suggest'>
          <app-phone-list [phoneSource]="'bestSeller'"></app-phone-list>
          <app-phone-list [phoneSource]="'soldOutSoon'"></app-phone-list>
        </div>
      </div>

      <!-- <div *ngIf="pageState() === 'home'">
        <app-search-form></app-search-form>
        <app-top-seller></app-top-seller>
        <app-sold-out-soon></app-sold-out-soon>
      </div>

      <div *ngIf="pageState() === 'search'">
        <app-search-form></app-search-form>
      </div>

      <div *ngIf="pageState() === 'item'">
        
      </div> -->
    </main>
  `
})
export class HomepageComponent implements OnInit {
  title = 'OldPhoneDeals';
  // Use the signal to track the current user state.
  // Initialized as null, indicating a guest user.
  user = computed(() => this.userService.user$());
  // State signal used to indicate the state of home page.
  // Initialized as home state.
  pageState: WritableSignal<'home'|'search'|'item'> = signal('home');

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit() {
    const storedToken = localStorage.getItem('authToken');
    if(storedToken){
      console.log(storedToken);
      this.userService.setUserFromToken(storedToken);
    }

    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if(token){
        localStorage.setItem('authToken', token);
        this.userService.setUserFromToken(token);
      }
    })

    this.user  = computed(() => this.userService.user$());
    console.log("Current user:",this.user());
  }

  logout(){
    localStorage.removeItem('authToken');
    this.userService.user$.set(null);
  }
}
