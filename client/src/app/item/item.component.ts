import { UserService } from './../user.service';
import { PhoneService } from './../phone.service';
import { Component, inject, OnInit, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';


import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { Phone } from '../phone';


@Component({
  selector: 'app-item',
  imports: [ReactiveFormsModule, MatTableModule, MatButtonModule, MatCardModule, CommonModule, MatIconModule, RouterModule],

  styles: `
    .star-icon {
      color: gold;
    }

    mat-card-header{
      display:flex;
      align-items: center;
      justify-content: space-between;
    }

    #goBack{
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

  `,

  template: `
    <mat-card>
        <mat-card-header>
          <button id='goBack' (click)='goBack()'>Back</button>
          <mat-card-title>{{this.selectedPhone$()?.brand}} Phone</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <!-- Item image -->
          <div class='flex-row'>
            <img matCardImage [src]='getBrandImages(selectedPhone$()?.brand)'>
            <div class='flex-col'>
              <!-- Title -->
              <label>\${{selectedPhone$()?.title}}</label>

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
            <ng-container matColumnDef="col-rating">
              <th mat-header-cell *matHeaderCellDef>Rating</th>
              <td mat-cell *matCellDef="let review">
                {{review.rating}}
              </td>
            </ng-container>
            
            <ng-container matColumnDef="col-comment">
              <th mat-header-cell *matHeaderCellDef>Comment</th>
              <td class='comment' mat-cell *matCellDef="let review">
                {{review.comment}}
              </td>
            </ng-container>
            <!-- Add header and row definitions -->
            <tr mat-header-row *matHeaderRowDef="['col-rating', 'col-comment']">
              <!-- *ngFor="let review of selectedPhone$()?.reviews | slice:0:initNumReview" -->
            </tr>
            <tr mat-row *matRowDef="let row; columns: ['col-rating', 'col-comment'];"></tr>
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
  displayCount = 3;
  showAll: boolean = false;
  
  purchaseForm = new FormGroup({
    keyword: new FormControl('', [Validators.required]),
    brand: new FormControl('', Validators.required),
  });


  constructor(
    private route: ActivatedRoute,
    private phoneService: PhoneService,
    private userService: UserService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.phone_id = this.route.snapshot.paramMap.get('id');
    this.phoneService.getPhone(this.phone_id);
    console.log("Got phone id:", this.phone_id);
  }

  // Get the image path for the brand.
  getBrandImages(brand: string | null | undefined){
    if(!brand){
      return null;
    }
    console.log("Brand:",brand);
    return this.phoneService.brandImageMap[brand];
  }

  goCheckout(){

  }

  addToCartBtnClicked(){
    this.addCartClicked = true;
  }

  // 
  addToCart(){

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


  goBack(){
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

}
