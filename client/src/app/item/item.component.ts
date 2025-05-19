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
    /* Global Variables */
    :host {
      --primary-dark: #2c3e50;
      --primary-light: #3498db;
      --accent: #e74c3c;
      --success: #27ae60;
      --warning: #f39c12;
      --text-dark: #2c3e50;
      --text-light: #ecf0f1;
      --text-muted: #7f8c8d;
      --border-light: #e1e5e9;
      --bg-light: #f5f7fa;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
      --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
      display: block;
      background-color: var(--bg-light);
      padding: 1rem;
      font-family: 'Arial', sans-serif;
      min-height: 100vh;
    }
    
    .star-icon {
      color: gold;
    }

    /* Header Styling */
    .item-header {
      background-color: var(--primary-dark);
      color: white;
      width: 100%;
      box-shadow: var(--shadow-sm);
      padding: 1rem;
      border-radius: 8px 8px 0 0;
      margin-bottom: 1rem;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .header-title {
      font-size: 1.5rem;
      margin: 0;
    }

    /* Card Styling */
    mat-card {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      margin-bottom: 2rem;
      background-color: white;
    }

    mat-card-header {
      background-color: var(--primary-dark);
      color: white;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    mat-card-title {
      margin: 0;
      color: white;
      font-size: 1.25rem;
    }

    mat-card-content {
      padding: 1.5rem;
    }
    
    /* Navigation */
    .goBack {
      order: -1;
      display: flex;
      gap: 0.75rem;
    }

    /* Layout Helpers */
    .flex-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      gap: 1.5rem;
    }
    
    .flex-col {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 0.75rem;
    }

    /* Image Styling */
    .product-image {
      width: 200px;
      height: 200px;
      object-fit: contain;
      background-color: white;
      border-radius: 8px;
      padding: 1rem;
      box-shadow: var(--shadow-sm);
    }

    /* Information Sections */
    .product-info {
      padding: 1rem;
      border-radius: 8px;
      background-color: white;
      box-shadow: var(--shadow-sm);
    }
    
    .product-title {
      font-size: 1.5rem;
      color: var(--primary-dark);
      margin: 0 0 0.5rem 0;
    }
    
    .seller-info {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
    
    .price {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--primary-dark);
    }
    
    .stock {
      color: var(--text-muted);
      margin-bottom: 1rem;
    }
    
    .rating-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Button Styling */
    button {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
      background-color: var(--primary-light);
      color: white;
      margin: 0.5rem 0;
    }
    
    button:hover {
      background-color: #2980b9;
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }
    
    .btn-back {
      background-color: #95a5a6;
    }
    
    .btn-back:hover {
      background-color: #7f8c8d;
    }
    
    .btn-cart {
      background-color: var(--primary-light);
    }
    
    .btn-wishlist {
      background-color: var(--accent);
    }
    
    .btn-buy {
      background-color: var(--success);
      width: 100%;
    }
    
    .btn-buy:hover {
      background-color: #219653;
    }
    
    button:disabled {
      background-color: #bdc3c7;
      cursor: not-allowed;
      transform: none;
    }

    /* Purchase Form */
    .purchase-form {
      padding: 1rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      width: 250px;
    }
    
    .quantity-input {
      padding: 0.5rem;
      border: 1px solid var(--border-light);
      border-radius: 4px;
      width: 100%;
      margin-bottom: 0.5rem;
    }

    /* Reviews Section */
    .reviews-section {
      margin-top: 2rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    
    .section-header {
      padding: 1rem;
      background-color: var(--primary-dark);
      color: white;
    }
    
    .section-title {
      margin: 0;
      font-size: 1.25rem;
    }
    
    .table-container {
      padding: 1rem;
      overflow-x: auto;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th {
      background-color: #f8f9fa;
      color: var(--primary-dark);
      font-weight: 600;
      text-align: left;
      padding: 0.75rem;
      border-bottom: 1px solid var(--border-light);
    }
    
    td {
      padding: 0.75rem;
      border-bottom: 1px solid var(--border-light);
      vertical-align: top;
    }
    
    tr:hover {
      background-color: #f8f9fa;
    }

    .review-comment {
      white-space: pre-wrap;
      word-break: break-word;
      max-width: 100%;
      line-height: 1.5;
    }
    
    .hidden-comment {
      color: var(--text-muted);
    }

    /* Review Form */
    .review-form {
      margin-top: 2rem;
      padding: 1.5rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
    }
    
    .form-title {
      font-size: 1.25rem;
      color: var(--primary-dark);
      margin: 0 0 1rem 0;
    }
    
    textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-light);
      border-radius: 4px;
      resize: vertical;
      font-family: inherit;
      margin-bottom: 1rem;
    }
    
    textarea:focus {
      border-color: var(--primary-light);
      outline: none;
    }
    
    .form-actions {
      display: flex;
      gap: 0.75rem;
    }
    
    .btn-submit {
      background-color: var(--primary-light);
    }
    
    .btn-reset {
      background-color: #95a5a6;
    }

    button.showCompleteComment {
      min-width: 110px;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
      background-color: var(--primary-light);
      color: white;
      border-radius: 4px;
      font-size: 0.85rem;
      padding: 0 12px;
    }

    button.hideReview {
      height: 36px;
      width: 36px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
      background-color: var(--warning);
      color: white;
      margin-left: 10px;
      border-radius: 50%;
      min-width: 0;
      padding: 0;
    }

    button.unhideReview {
      height: 36px;
      width: 36px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
      background-color: var(--success);
      color: white;
      margin-left: 10px;
      border-radius: 50%;
      min-width: 0;
      padding: 0;
    }

    /* Responsive Adjustments */
    @media (max-width: 768px) {
      .flex-row {
        flex-direction: column;
      }
      
      .product-image {
        width: 100%;
        max-width: 300px;
        margin: 0 auto;
      }
      
      .purchase-form {
        width: 100%;
      }
    }
  `,

  template: `
    <div class="item-header">
      <div class="header-content">
        <h2 class="header-title">Phone Details</h2>
      </div>
    </div>
    
    <mat-card>
      <mat-card-header>
        <div class='goBack'>
          <button class="btn-back" (click)='goBackHome()'>
            <mat-icon>arrow_back</mat-icon> Back Home
          </button>
          <button class="btn-cart" [routerLink]="['/cart']">
            <mat-icon>shopping_cart</mat-icon> Cart
          </button>
        </div>
        <mat-card-title>{{this.selectedPhoneListing$()?.brand}} Phone</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <div class='flex-row'>
          <!-- Item image -->
          <img class="product-image" [src]='getBrandImages(phonelistingBrand$())' alt="{{selectedPhoneListing$()?.title}}">
          
          <div class='flex-col product-info'>
            <!-- Title and seller info -->
            <h3 class="product-title">{{selectedPhoneListing$()?.title}}</h3>
            <div class="seller-info">Seller: {{selectedPhoneListing$()?.seller?.firstname}} {{selectedPhoneListing$()?.seller?.lastname}}</div>

            <div class='flex-row'>
              <!-- Product details -->
              <div class='flex-col'>
                <!-- Price -->
                <div class="price">{{formatPrice(selectedPhoneListing$()?.price)}}</div>
                <!-- Stock -->
                <div class="stock">{{this.selectedPhoneListing$()?.stock}} left in stock</div>
                
                <div class="rating-display">
                  <!-- Rating Stars -->
                  <span *ngFor="let star of getStars(selectedPhoneListing$()?.avgRating)">
                    <mat-icon class='star-icon' [ngStyle]="{'clip-path': 'inset(0 ' + (100 - star * 100) + '% 0 0)'}">star</mat-icon>
                  </span>
                  <!-- Number of reviews -->
                  <span>({{this.selectedPhoneListing$()?.reviews?.length}} reviews)</span>
                </div>
              </div>

              <!-- Purchase form -->
              <form class='flex-col purchase-form' [formGroup]="purchaseForm" (ngSubmit)="goCheckout()">
                <!-- Purchase options -->
                <button type='button' class="btn-wishlist" (click)="addToWishList()">
                  <mat-icon>favorite</mat-icon> Add to Wishlist
                </button>
                
                <div *ngIf="currentQuantity > 0" class="stock">{{currentQuantity}} added to cart</div>
                
                <button type="button" class="btn-cart" (click)="addToCartClicked()">
                  <mat-icon>add_shopping_cart</mat-icon> Add to Cart
                </button>

                <div class="flex-col" *ngIf="addedToCart">
                  <input 
                    class="quantity-input"
                    formControlName="quantity" 
                    name="quantity" 
                    type="number" 
                    id="quantity" 
                    min="0" 
                    [max]="selectedPhoneListing$()?.stock!" 
                    step="1" 
                    placeholder="Quantity"
                  >
                  <button type="button" class="btn-cart" (click)="addToCart(null)">
                    <mat-icon>check</mat-icon> Confirm
                  </button>
                </div>

                <button type="submit" class="btn-buy">
                  <mat-icon>shopping_bag</mat-icon> Buy Now
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Reviews section -->
        <div class="reviews-section" *ngIf="selectedPhoneListing$()?.reviews?.length != 0">
          <div class="section-header">
            <h3 class="section-title">Customer Reviews</h3>
          </div>
          
          <div class="table-container">
            <!-- Comment table -->
            <table mat-table [dataSource]="(selectedPhoneListing$()?.reviews || []).slice(0, displayCount)">
              <!-- Rating -->
              <ng-container matColumnDef="col-rating">
                <th mat-header-cell *matHeaderCellDef>Rating</th>
                <td mat-cell *matCellDef="let review">
                  <div class="rating-display">
                    <span *ngFor="let star of getStars(review.rating)">
                      <mat-icon class='star-icon' [ngStyle]="{'clip-path': 'inset(0 ' + (100 - star * 100) + '% 0 0)'}">star</mat-icon>
                    </span>
                  </div>
                </td>
              </ng-container>
              
              <!-- Comment -->
              <ng-container matColumnDef="col-comment">
                <th mat-header-cell *matHeaderCellDef>Comment</th>
                <td class='comment' mat-cell *matCellDef="let review">
                  <!-- Display hidden reviews as gray text for seller/reviewer, hide for everyone else -->
                  <ng-container *ngIf="!review.hidden || (review.hidden && (review.reviewer._id === this.currentUser$?._id || this.currentUser$?._id === this.selectedPhoneListing$()?.seller?._id))">
                    <!-- Not expanded -->
                    <span *ngIf="!review.expanded" [class.hidden-comment]="review.hidden">
                      {{review.comment?.length > 200 ? 
                      review.comment.substring(0, 200) + '...' : review.comment}}
                    </span>
                    <!-- Expanded comment -->
                    <span *ngIf="review.expanded" [class.hidden-comment]="review.hidden">
                      {{review.comment}}
                    </span>
                    <button class="showCompleteComment" *ngIf="review.comment?.length > 200" 
                    (click)="review.expanded = !review.expanded">
                      <mat-icon>{{review.expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}}</mat-icon>
                      {{review.expanded ? 'Hide' : 'Show All'}}
                    </button>

                    <!-- Button to hide or unhide this review if the user is the reviewer/seller -->
                    <button class="hideReview" 
                    *ngIf="(review.reviewer._id === this.currentUser$?._id
                    || this.currentUser$?._id === this.selectedPhoneListing$()?.seller?._id) && !review.hidden" 
                    (click)="hideReview(review._id)">
                      <mat-icon>visibility_off</mat-icon>
                    </button>
                    <button class="unhideReview" 
                    *ngIf="(review.reviewer._id === this.currentUser$?._id
                    || this.currentUser$?._id === this.selectedPhoneListing$()?.seller?._id) && review.hidden" 
                    (click)="unhideReview(review._id)">
                      <mat-icon>visibility</mat-icon>
                    </button>
                  </ng-container>
                  
                  <!-- Message when review is hidden and current user can't see it -->
                  <div *ngIf="review.hidden && !(review.reviewer._id === this.currentUser$?._id || this.currentUser$?._id === this.selectedPhoneListing$()?.seller?._id)">
                    <em>This review has been hidden</em>
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
              <tr mat-header-row *matHeaderRowDef="displayColumn"></tr>
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
        </div>

        <!-- Leave review form -->
        <form class='review-form' [formGroup]="reviewForm" (ngSubmit)="addReview()">
          <h3 class="form-title">Leave a Review</h3>
          <textarea 
            formControlName="comment" 
            name="comment" 
            rows="5" 
            placeholder="Please share your experience with this product..."
          ></textarea>
          
          <!-- Rating Stars -->
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: var(--text-dark);">Rating</label>
            <app-rating 
              formControlName="rating" 
              name="rating" 
              require
              [rating]="reviewForm.controls['rating'].value ?? 0"
            ></app-rating>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-submit" [disabled]="!reviewForm.valid">
              <mat-icon>send</mat-icon> Submit Review
            </button>
            <button type='reset' class="btn-reset">
              <mat-icon>clear</mat-icon> Clear
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class ItemComponent implements OnInit{
  phonelisting_id: string|null = null;
  selectedPhoneListing$ = inject(PhoneListingService).selected$;
  currentUser$ = inject(UserService).user$();
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
    public phonelistingService: PhoneListingService,
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

  // Removed duplicate method
  formatPrice(price: any): string {
    if (price === undefined || price === null) return 'N/A';
    return `$${parseFloat(price).toFixed(2)}`;
  }
  // Get the image path for the brand.
  getBrandImages(brand: string | null | undefined){
    if(!brand){
      return null;
    }
    return this.phonelistingService.brandImageMap[brand];
  }


  addToCartClicked(){
    this.addedToCart = true;
  }


  addToCart(quantity: number | null){
    console.log("Got quantity:",quantity, this.purchaseForm.value.quantity);
    if(!this.userService.user$()){
      this.goLogin();
      return;
    }
    // Check stock.
    if(this.phonelistingService.selected$()?.stock == 0){
      return alert("Not enough stock.");
    }

    const actualQuantity = quantity !== null ? quantity : this.purchaseForm.value.quantity!;
    
    if (actualQuantity <= 0) {
      return alert("Please select a valid quantity.");
    }
    
    this.cartService.addToCart(this.phonelistingService.selected$() as PhoneListing, actualQuantity);
    
    // Update the displayed quantity in the UI
    this.currentQuantity = this.cartService.getQuantity(this.selectedPhoneListing$()?._id || '');
    
    // Hide the quantity input after adding to cart
    this.addedToCart = false;
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


  goCheckout(){
    if(!this.userService.user$()){
      console.log("Not logged in.");
      return alert("Login to buy things.");
    }
    // If the user has not add this into cart.
    if(this.cartService.getQuantity(this.phonelistingService.selected$()?._id ?? '') == 0){
      // If the stock of current phone is empty.
      if(this.phonelistingService.selected$()?.stock == 0){
        return alert("The stock is not enough.");
      }else{
        // Add 
        this.addToCart(1);
      }
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
      console.log(phonelisting);
      // Update the selected phonelisting with the latest data including reviews
      this.phonelistingService.getPhoneListing(phonelisting._id);
      // Reset form after adding review success.
      this.reviewForm.reset();
      // Ensure all reviews are displayed after adding a new one
      this.displayCount = this.showAll ? (phonelisting.reviews?.length || 3) : 3;
    })
  }


  hideReview(review_id: string){
    this.phonelistingService.hideReview(review_id, this.phonelistingService.selected$()?._id!);
  }

  unhideReview(review_id: string){
    this.phonelistingService.unhideReview(review_id, this.phonelistingService.selected$()?._id!);
  }


  goLogin(){
    this.userService.homeState$.set('home');
    this.router.navigate(['login']);
  }

}