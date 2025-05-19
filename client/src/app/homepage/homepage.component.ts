import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Injectable } from '@angular/core';

import { UserService } from './../user.service';
import { PhoneListingListComponent } from "../phonelisting-list/phonelisting-list.component";
import { SearchFormComponent } from '../search-form/search-form.component';

import { PhoneListing } from '../phonelisting';
import { CartService } from '../cart/cart.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatToolbarModule, 
    MatIconModule,
    FormsModule,
    PhoneListingListComponent, 
    SearchFormComponent
  ],
  styleUrls: ['./homepage.component.css'],
  templateUrl: './homepage.component.html',
})
@Injectable({
  providedIn: 'root'
})
export class HomepageComponent implements OnInit {
  title = 'OldPhoneListingDeals';
  user$ = inject(UserService).user$;
  pageState$ = inject(UserService).homeState$;
  cartQuantity$ = inject(CartService).allQuantity$;
  searchQuery: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit() {
    console.log("Current user:", this.user$());
    console.log("Homepage state:", this.pageState$());
  }

  logout() {
    this.userService.logOut();
  }

  backHome() {
    this.pageState$.set('home');
  }
}