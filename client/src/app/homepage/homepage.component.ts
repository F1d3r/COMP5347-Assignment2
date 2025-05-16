import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Injectable } from '@angular/core';

import { UserService } from './../user.service';
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
        justify-content: center;
        gap: 0px;
      }

      app-phone-list{
        margin: 10px;
        border: 2px, solid #000;
      }

      button{
        margin: 5px;
      }

      #search-bar-container {
        width: fit-content;
        margin: 0 auto;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 50px;
      }

      #form-wrapper {
        display: inline-block;
      }
    `
  ],
  
  template: `
    <mat-toolbar class='toolbar'>
      <div (click)="backHome()">
        <span span>Welcome to {{title}}</span>
      </div>

      <div>
        <!-- If the user is not logged in -->
        <ng-container *ngIf='!this.user$()'>
          <button id='loginBtn' [routerLink]="['login']">Login</button>
          <button id='loginBtn' [routerLink]="['signup']">Sign Up</button>
        </ng-container>

        <!-- If the user logged in -->
        <ng-container *ngIf="this.user$()">
          <span>Hello, {{ user$()?.lastname }}</span>
          <button id='profileBtn' [routerLink]="['profile']">Profile</button>
          <button id="logoutBtn" (click)="logout()">Logout</button>
        </ng-container>
      </div>
    </mat-toolbar>

    <main>
        <div id='search-bar-container'>
          <div id="form-wrapper">
            <app-search-form></app-search-form>
          </div>
        </div>
        

      <!-- The page framework for home state -->
      <div id='homeState' *ngIf="pageState() == 'home'">
        
        <div id='suggest'>
          <app-phone-list [phoneSource]="'bestSeller'"></app-phone-list>
          <app-phone-list [phoneSource]="'soldOutSoon'"></app-phone-list>
        </div>
      </div>
      <!-- The page framework for search state -->
      <div id='searchState' *ngIf="pageState() == 'search'">
        <app-phone-list [phoneSource]="'search'"></app-phone-list>
      </div>
    </main>
  `
})
@Injectable({
  providedIn: 'root'
})
export class HomepageComponent implements OnInit {
  title = 'OldPhoneDeals';
  // Use the signal to track the current user state.
  // Initialized as null, indicating a guest user.
  // user = computed(() => this.userService.user$());
  user$ = inject(UserService).user$;

  // State signal used to indicate the state of home page.
  // Initialized as home state.
  pageState = inject(UserService).homeState$;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit() {
    console.log("Current user:",this.user$());
  }

  logout(){
    this.userService.logOut();
  }

  backHome(){
    this.pageState.set('home');
  }
}
