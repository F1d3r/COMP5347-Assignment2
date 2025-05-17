import { UserService } from './../user.service';
import { PhoneService } from './../phone.service';
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

    td.comment{
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }

    button.showCompleteComment {
      width: 60px;
      height: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 80px;
      height: 30px;
      flex-shrink: 0;
    }

  `,

  template: `
    <mat-card>
        <mat-card-header>
          <button class='goBack' (click)='goBackHome()'>Back Home</button>
          <mat-card-title>{{this.selectedPhone$()?.brand}} Phone</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <!-- Item image -->
          <div class='flex-row'>
            <img matCardImage [src]='getBrandImages(phoneBrand$())'>
            <div class='flex-col'>
              <!-- Title -->
              <label>\${{selectedPhone$()?.title}}</label>
              <label>Seller: {{selectedPhone$()?.seller?.firstname}} {{selectedPhone$()?.seller?.lastname}}</label>

              <div class='flex-row'>
                <!-- Product details -->
                <div class='flex-col'>
                  <!-- Price -->
                  <label>\${{selectedPhone$()?.price}}</label>
                  <!-- Stock -->
                  <label>{{this.selectedPhone$()?.stock}} left in stock</label>
                  
                  <div>
                    <!-- Rating Stars -->
                    <span *ngFor="let star of getStars(selectedPhone$()?.avgRating)">
                      <mat-icon class='star-icon' [ngStyle]="{'clip-path': 'inset(0 ' + (100 - star * 100) + '% 0 0)'}">star</mat-icon>
                    </span>
                    <!-- Rating -->
                    <Label>{{selectedPhone$()?.avgRating}}</Label>
                    <!-- Number of reviews -->
                    <label>({{this.selectedPhone$()?.reviews?.length}})</label>
                  </div>
                </div>

                <!-- Purchase form -->
                <form class='flex-col' [formGroup]="purchaseForm" (ngSubmit)="goCheckout()">
                  <!-- Purchase options -->
                  <button (click)="addToCartBtnClicked()">Add to Cart</button>

                  <div class="flex-col" *ngIf="addCartClicked">
                    <input type="number" name="quantity" id="quantity" min="0" [max]="selectedPhone$()?.stock" step="1" placeholder="Quantity">
                    <button (click)="addToCart()">Confirm</button>
                  </div>

                  <button type="submit">Buy Now</button>
                </form>

              </div>
            </div>
          </div>

          <!-- Comment table -->
          <table mat-table [dataSource]="(selectedPhone$()?.reviews || []).slice(0, displayCount)">
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
              <td class='comment' mat-cell *matCellDef="let review">
                <!-- Not expanded -->
                <span *ngIf="!review.expanded">
                  {{review.comment?.length > 200 ? 
                  review.comment.substring(0, 200) + '...' : review.comment}}
                </span>
                <!-- Expanded comment -->
                <span *ngIf="review.expanded">
                  {{review.comment}}
                </span>
                <button class="showCompleteComment" *ngIf="review.comment?.length > 200" 
                (click)="review.expanded = !review.expanded">
                  {{review.expanded ? 'Hide' : 'Show'}}
                </button>
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
              <!-- *ngFor="let review of selectedPhone$()?.reviews | slice:0:initNumReview" -->
            </tr>
            <tr mat-row *matRowDef="let row; columns: displayColumn;"></tr>
          </table>

          <!-- Button to show all -->
          <button mat-button (click)="showAllReviews()">
            <span *ngIf="!showAll">
              Show All {{selectedPhone$()?.reviews?.length}} reviews
            </span>
            <span *ngIf="showAll">
              Collapse Reviews
            </span>
          </button>

          <!-- Leave review -->
          <form class='flex-col' [formGroup]="reviewForm" (ngSubmit)="addReview()">
            <label>Leave a review</label>
            <textarea formControlName="comment" name="comment" 
            name="textInput" rows="5" cols="50" placeholder="Please leave a review."></textarea>
            <!-- Rating Starts -->
            <app-rating formControlName="rating" name="rating" require
            [rating]="reviewForm.controls['rating'].value ?? 0"></app-rating>
            
            <div>
              <button type="submit">Add comment</button>
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
  phone_id: string|null = null;
  addCartClicked: boolean = false;
  selectedPhone$ = inject(PhoneService).selected$;
  // Get the phone brand.
  phoneBrand$ = computed(() => this.selectedPhone$()?.brand);

  displayCount = 3;
  showAll: boolean = false;
  displayColumn = [
    'col-rating',
    'col-comment',
    'col-reviewer'
  ]
  
  purchaseForm = new FormGroup({
    keyword: new FormControl('', [Validators.required]),
    brand: new FormControl('', Validators.required),
  });

  reviewForm = new FormGroup({
    comment: new FormControl('', [Validators.required]),
    rating: new FormControl(0, [Validators.required]),
  });


  constructor(
    private route: ActivatedRoute,
    private phoneService: PhoneService,
    private userService: UserService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.phone_id = this.route.snapshot.paramMap.get('id');
    // Update the selected phone.
    this.phoneService.getPhone(this.phone_id);
  }

  // Get the image path for the brand.
  getBrandImages(brand: string | null | undefined){
    if(!brand){
      return null;
    }
    return this.phoneService.brandImageMap[brand];
  }

  addToCartBtnClicked(){
    this.addCartClicked = true;
  }

  // TODO Add function here
  addToCart(){

  }

  // TODO Add function here
  goCheckout(){

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
      this.displayCount = this.selectedPhone$()?.reviews?.length || 3;

    }
    this.showAll = !this.showAll
  }


  addReview(){
    // If the user is not logged in.
    if(!this.userService.user$()){
      return alert("You can only leave a review after login.");
    }
    console.log("A review adding:", this.reviewForm.value.comment, this.reviewForm.value.rating);
    this.phoneService.addReview(this.userService.user$()?._id!, this.reviewForm.value.comment!, this.reviewForm.value.rating!)
    .subscribe(phone => {
      this.phoneService.getPhone(phone._id);
      // Reset form after adding review success.
      this.reviewForm.reset();
    })

  }

}