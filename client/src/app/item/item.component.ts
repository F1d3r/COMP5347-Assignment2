import { CartService } from './../cart/cart.service';
import { WishlistService } from './../wishlist/wishlist.service';
import { UserService } from './../user.service';
import { PhoneListingService } from './../phonelisting.service';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { computed } from '@angular/core';


import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { RatingComponent } from './rating.component';

import { PhoneListing } from '../phonelisting';


@Component({
  selector: 'app-item',
  imports: [ RatingComponent, ReactiveFormsModule, MatTableModule, MatButtonModule, MatCardModule, CommonModule, MatIconModule, RouterModule],

  styles: `
    .star-icon {
      color: gold;
    }

    mat-card-header{
      display:flex;
      align-items: center;
      justify-content: space-between;
    }

    .goBack{
      order: -1;
    }

    .flex-row{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    
    .flex-col{
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    img{
      margin: 10px;
    }

    div{
      margin: 5px;
    }

    button.showCompleteComment {
      width: 60px;
      height: 25px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
    }
    
    button{
      margin: 5px;
    }

  `,

  template: `
    <mat-card>
        <mat-card-header>
          <div class='goBack'>
            <button (click)='goBackHome()'>Back Home</button>
            <button [routerLink]="['/cart']">Cart</button>
          </div>
          <mat-card-title>{{this.selectedPhoneListing$()?.brand}} Phone</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class='flex-row'>
            <!-- Item image -->
            <img matCardImage [src]='getBrandImages(phonelistingBrand$())'>
            <div class='flex-col'>
              <!-- Title -->
              <label>\${{selectedPhoneListing$()?.title}}</label>
              <label>Seller: {{selectedPhoneListing$()?.seller?.firstname}} {{selectedPhoneListing$()?.seller?.lastname}}</label>

              <div class='flex-row'>
                <!-- Product details -->
                <div class='flex-col'>
                  <!-- Price -->
                  <label>\${{selectedPhoneListing$()?.price}}</label>
                  <!-- Stock -->
                  <label>{{this.selectedPhoneListing$()?.stock}} left in stock</label>
                  
                  <div>
                    <!-- Rating Stars -->
                    <span *ngFor="let star of getStars(selectedPhoneListing$()?.avgRating)">
                      <mat-icon class='star-icon' [ngStyle]="{'clip-path': 'inset(0 ' + (100 - star * 100) + '% 0 0)'}">star</mat-icon>
                    </span>
                    <!-- Rating -->
                    <Label>{{selectedPhoneListing$()?.avgRating}}</Label>
                    <!-- Number of reviews -->
                    <label>({{this.selectedPhoneListing$()?.reviews?.length}})</label>
                  </div>
                </div>

                <!-- Purchase form -->
                <form class='flex-col' [formGroup]="purchaseForm" (ngSubmit)="goCheckout()">
                  <!-- Purchase options -->
                  <button type='button' (click)="addToWishList()">Add to WishList</button>
                  
                  <label> {{currentQuantity}} added to cart</label>
                  <button type="button" (click)="addToCart()">Add to Cart</button>

                  <div class="flex-col" *ngIf="addedToCart">
                    <input formControlName="quantity" name="quantity" 
                    type="number" id="quantity" min="0" 
                    [max]="selectedPhoneListing$()?.stock!" step="1" placeholder="Quantity">
                    <button type="button" (click)="addToCart()">Confirm</button>
                  </div>

                  <button type="submit">Buy Now</button>
                </form>


              </div>
            </div>
          </div>

          <div *ngIf="selectedPhoneListing$()?.reviews?.length != 0">
            <!-- Comment table -->
            <table mat-table [dataSource]="(selectedPhoneListing$()?.reviews || []).slice(0, displayCount)">
              <!-- Rating -->
              <ng-container matColumnDef="col-rating">
                <th mat-header-cell *matHeaderCellDef>Rating</th>
                <td mat-cell *matCellDef="let review">
                  {{review.rating}}
                </td>
              </ng-container>
              <!-- Comment -->
              <ng-container matColumnDef="col-comment">
                <th mat-header-cell *matHeaderCellDef>Comment</th>
                <td mat-cell *matCellDef="let review">
                  <div class='flex-row'>
                    <!-- Not expanded -->
                    <div *ngIf="!review.expanded">
                      {{review.comment?.length > 200 ? 
                      review.comment.substring(0, 200) + '...' : review.comment}}
                    </div>
                    <!-- Expanded comment -->
                    <div *ngIf="review.expanded">
                      {{review.comment}}
                    </div>
                    
                    <div>
                      <button class="showCompleteComment" *ngIf="review.comment?.length > 200" 
                      (click)="review.expanded = !review.expanded">
                        {{review.expanded ? 'Hide' : 'Show'}}
                      </button>
                    </div>
                  </div>
                </td>
              </ng-container>
              <!-- Reviewer -->
              <ng-container matColumnDef="col-reviewer">
                <th mat-header-cell *matHeaderCellDef>Reviewer</th>
                <td mat-cell *matCellDef="let review">
                  {{review.reviewer.firstname}} {{review.reviewer.lastname}}
                </td>
              </ng-container>
              <!-- Add header and row definitions -->
              <tr mat-header-row *matHeaderRowDef="displayColumn">
                <!-- *ngFor="let review of selectedPhoneListing$()?.reviews | slice:0:initNumReview" -->
              </tr>
              <tr mat-row *matRowDef="let row; columns: displayColumn;"></tr>
            </table>

            <!-- Button to show all -->
            <button mat-button (click)="showAllReviews()">
              <span *ngIf="!showAll">
                Show All {{selectedPhoneListing$()?.reviews?.length}} reviews
              </span>
              <span *ngIf="showAll">
                Collapse Reviews
              </span>
            </button>

          </div>
          

          <!-- Leave review form -->
          <form class='flex-col' [formGroup]="reviewForm" (ngSubmit)="addReview()">
            <label>Leave a review</label>
            <textarea formControlName="comment" name="comment" 
            name="textInput" rows="5" cols="50" placeholder="Please leave a review."></textarea>
            <!-- Rating Starts -->
            <app-rating formControlName="rating" name="rating" require
            [rating]="reviewForm.controls['rating'].value ?? 0"></app-rating>
            
            <div>
              <button type="submit" [disabled]="!reviewForm.valid">Add comment</button>
              <button type='reset'>Clear</button>
            </div>
          </form>


        </mat-card-content>

        <mat-card-footer>
        </mat-card-footer>
    </mat-card>
  `
})
export class ItemComponent implements OnInit{
  phonelisting_id: string|null = null;
  selectedPhoneListing$ = inject(PhoneListingService).selected$;
  // Get the phonelisting brand.
  phonelistingBrand$ = computed(() => this.selectedPhoneListing$()?.brand);
  currentQuantity: number = 0;
  addedToCart: boolean = false;

  displayCount = 3;
  showAll: boolean = false;
  displayColumn = [
    'col-rating',
    'col-comment',
    'col-reviewer'
  ]
  
  purchaseForm = new FormGroup({
    quantity: new FormControl(0, [Validators.required]),
  });

  reviewForm = new FormGroup({
    comment: new FormControl('', [Validators.required]),
    rating: new FormControl(5, [Validators.required]),
  });


  constructor(
    private route: ActivatedRoute,
    private phonelistingService: PhoneListingService,
    private userService: UserService,
    private router: Router,
    private wishlistService: WishlistService,
    private cartService: CartService
  ){}

  ngOnInit(): void {
    this.phonelisting_id = this.route.snapshot.paramMap.get('id');
    // Update the selected phonelisting.
    this.phonelistingService.getPhoneListing(this.phonelisting_id);
  }

  // Get the image path for the brand.
  getBrandImages(brand: string | null | undefined){
    if(!brand){
      return null;
    }
    return this.phonelistingService.brandImageMap[brand];
  }

  addToCart(){
    if(!this.userService.user$()){
      this.goLogin();
    }
    if(!this.addedToCart){
      this.addedToCart = !this.addedToCart;
      return;
    }
    this.cartService.addToCart(this.phonelistingService.selected$() as PhoneListing, this.purchaseForm.value.quantity!);
  }

  addToWishList(){
    console.log("Adding to wish list.");
    // If not logged in.
    if(!this.userService.user$()){
      console.log("No user logged in");
      this.goLogin();
      return;
    }
    this.wishlistService.addToWishlist(this.userService.user$()?._id!, this.selectedPhoneListing$()?._id!);
  }

  // TODO Add function here
  goCheckout(){
    if(!this.userService.user$()){
      console.log("Not logged in.");
      
    }
    this.router.navigate(['/checkout']);
  }

  // Get the integer and fraction part.
  getStars(rating: number | null | undefined): number[]{
    if(!rating){
      return [0];
    }
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1;
    const stars = Array(fullStars).fill(1);
    if(halfStar>0){
      stars.push(halfStar);
    }
    return stars;
  }

  goBackHome(){
    this.userService.homeState$.set('home');
    this.router.navigate(['']);
  }


  showAllReviews(){
    if(this.showAll){
      this.displayCount = 3;
    }else{
      this.displayCount = this.selectedPhoneListing$()?.reviews?.length || 3;

    }
    this.showAll = !this.showAll
  }


  addReview(){
    // If the user is not logged in.
    if(!this.userService.user$()){
      return alert("You can only leave a review after login.");
    }
    console.log("A review adding:", this.reviewForm.value.comment, this.reviewForm.value.rating);
    this.phonelistingService.addReview(this.userService.user$()?._id!, this.reviewForm.value.comment!, this.reviewForm.value.rating!)
    .subscribe(phonelisting => {
      this.phonelistingService.getPhoneListing(phonelisting._id);
      // Reset form after adding review success.
      this.reviewForm.reset();
    })

  }

  goLogin(){
    this.userService.homeState$.set('home');
    this.router.navigate(['login']);
  }

}