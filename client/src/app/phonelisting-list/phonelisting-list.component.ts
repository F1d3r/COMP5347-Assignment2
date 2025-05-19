import { UserService } from './../user.service';
import { Component, OnInit, WritableSignal, Input, inject, signal } from '@angular/core';
import { computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhoneListingService } from '../phonelisting.service';
import { RouterModule, Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { PhoneListing } from '../phonelisting';

import { MatSelectModule } from '@angular/material/select';

import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-phonelisting-list',
  standalone: true,
  imports: [
    MatTableModule, 
    MatCardModule, 
    MatButtonModule, 
    RouterModule, 
    CommonModule, 
    MatSelectModule, 
    MatSliderModule,
    MatIconModule
  ],
  template: `
<mat-card class="listing-card">
    <mat-card-header *ngIf="phonelistingSource !== 'search'">
      <!-- The card title for best seller -->
      <span *ngIf="phonelistingSource === 'bestSeller'">
        <mat-card-title>Best Sellers</mat-card-title>
        <mat-card-subtitle>Highest Rating</mat-card-subtitle>
      </span>
      <!-- The card title for sold out soon -->
      <span *ngIf="phonelistingSource === 'soldOutSoon'">
        <mat-card-title>Sold Out Soon</mat-card-title>
        <mat-card-subtitle>Lowest stock</mat-card-subtitle>
      </span>
    </mat-card-header>
    
    <mat-card-content>
        <div *ngIf="phonelistingSource === 'search'" id='sort_slider'>
          <mat-form-field>
            <mat-select placeholder="Sort by:" (selectionChange)="onSortChange($event.value)">
              <mat-option value="titleAsc">Title: A -> Z</mat-option>
              <mat-option value="titleDesc">Title: Z -> A</mat-option>
              <mat-option value="priceAsc">Price: Low to High</mat-option>
              <mat-option value="priceDesc">Price: High to Low</mat-option>
              <mat-option value="stockAsc">Stock: Low to High</mat-option>
              <mat-option value="stockDesc">Stock: High to Low</mat-option>
            </mat-select>
          </mat-form-field>

          <label>Price: </label>
          <mat-slider discrete min=0 [max]="maxPrice$()" step=1>
            <input #startInput matSliderStartThumb [value]="priceMin$()" (input)="priceMin$.set($any($event.target).value || 0)" />
            <input #endInput matSliderEndThumb [value]="priceMax$()" (input)="priceMax$.set($any($event.target).value || 100)" />
          </mat-slider>
        </div>

        <div class="table-container">
          <table mat-table [dataSource]="filteredPhoneListingList$()" class="mat-elevation-z1">
            <!-- For image -->
            <ng-container matColumnDef="col-image">
              <th mat-header-cell *matHeaderCellDef>Image</th>
              <td mat-cell *matCellDef="let phonelisting">
                <img matCardImage [src]='getBrandImages(phonelisting.brand)' alt="Phone Img">
              </td>
            </ng-container>
            <!-- For title -->
            <ng-container matColumnDef="col-title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let phonelisting">{{phonelisting.title}}</td>
            </ng-container>
            <!-- For brand -->
            <ng-container matColumnDef="col-brand">
              <th mat-header-cell *matHeaderCellDef>Brand</th>
              <td mat-cell *matCellDef="let phonelisting">{{phonelisting.brand}}</td>
            </ng-container>
            <!-- For rating -->
            <ng-container matColumnDef="col-rating">
              <th mat-header-cell *matHeaderCellDef class="rating-header">Rating</th>
              <td mat-cell *matCellDef="let phonelisting" class="rating-cell">
                <div class="rating-display">
                  <span *ngFor="let star of getStars(phonelisting.avgRating)">
                    <mat-icon class='star-icon' [ngStyle]="{'clip-path': 'inset(0 ' + (100 - star * 100) + '% 0 0)'}">star</mat-icon>
                  </span>
                </div>
              </td>
            </ng-container>
            <!-- For price -->
            <ng-container matColumnDef="col-price">
              <th mat-header-cell *matHeaderCellDef class="price-header">Price</th>
              <td mat-cell *matCellDef="let phonelisting" class="price-cell">{{formatPrice(phonelisting.price)}}</td>
            </ng-container>
            <!-- For stock -->
            <ng-container matColumnDef="col-stock">
              <th mat-header-cell *matHeaderCellDef>Stock</th>
              <td mat-cell *matCellDef="let phonelisting">{{phonelisting.stock}}</td>
            </ng-container>
            <!-- For seller -->
            <ng-container matColumnDef="col-seller">
              <th mat-header-cell *matHeaderCellDef>Seller</th>
              <td mat-cell *matCellDef="let phonelisting">
                {{phonelisting.seller.firstname}} {{phonelisting.seller.lastname}}
              </td>
            </ng-container>
            <!-- For review -->
            <ng-container matColumnDef="col-reviews">
              <th mat-header-cell *matHeaderCellDef>Reviews</th>
              <td mat-cell *matCellDef="let phonelisting">{{phonelisting.reviews}}</td>
            </ng-container>

            <!-- Add header and row definitions -->
            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="itemClicked(row)"></tr>
          </table>
        </div>
    </mat-card-content>
</mat-card>
  `,
  styles: [`
    .table-container {
      width: 100%;
      max-width: 1800px;
      margin: 0 auto;
      overflow-x: auto;
    }

    table {
      width: 100%;
      table-layout: fixed;
      border-collapse: separate;
      border-spacing: 0;
    }

    img {
      width: 80px;
      height: auto;
      object-fit: contain;
    }
    
    th, td {
      padding: 12px 16px;
      text-align: left;
      white-space: nowrap;
    }
    
    th {
      font-weight: bold;
      color: rgba(0, 0, 0, 0.87);
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    
    .mat-mdc-header-row {
      height: 48px;
    }

    .mat-mdc-row {
      height: 110px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .mat-column-col-image {
      width: 100px;
    }
    
    .mat-column-col-title {
      width: 40%;
    }
    
    .mat-column-col-brand {
      width: 15%;
    }
    
    .mat-column-col-stock {
      width: 10%;
    }
    
    .mat-column-col-seller {
      width: 15%;
    }
    
    .mat-column-col-reviews {
      width: 10%;
    }
    
    .mat-column-col-rating {
      width: 12%;
      min-width: 100px;
    }
    
    .mat-column-col-price {
      width: 12%;
      min-width: 70px;
      text-align: right;
    }
    
    .rating-header, .price-header {
      padding-right: 24px;
    }
    
    .rating-cell, .price-cell {
      padding-right: 24px;
    }
    
    .price-cell {
      text-align: right;
    }

    #sort_slider{
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 16px;
      height: 40px;
      font-size: 0.85rem;
      margin-bottom: 16px;
    }

    .rating-display {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    
    .star-icon {
      color: gold;
      font-size: 18px;
    }
    
    .listing-card {
      margin-bottom: 16px;
      padding: 0;
    }
    
    mat-card-header {
      padding: 16px 16px 0 16px;
    }
    
    mat-card-content {
      padding: 16px;
    }
  `]
})
export class PhoneListingListComponent implements OnInit { 
  @Input() phonelistingSource?: string;

  priceMin$ = signal(0);
  priceMax$ = signal(10000);
  phonelistingList$ = {} as WritableSignal<PhoneListing[]>;
  maxPrice$: any;
  filteredPhoneListingList$: any;
  displayedColumns: string[] = [];

  allPhoneListings: PhoneListing[] = []; // completed phonelisting list

  constructor(
    private phonelistingService: PhoneListingService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log("PhoneListing Source:", this.phonelistingSource);
    if (this.phonelistingSource === 'bestSeller') {
      this.phonelistingService.getBestSeller();
      this.phonelistingList$ = this.phonelistingService.bestSeller$;
      this.displayedColumns = [
        'col-image',
        'col-title',
        'col-rating',
        'col-price'
      ];
    } else if (this.phonelistingSource === 'soldOutSoon') {
      this.phonelistingService.getSoldOutSoon();
      this.phonelistingList$ = this.phonelistingService.soldOutSoon$;
      this.displayedColumns = [
        'col-image',
        'col-title',
        'col-rating',
        'col-price'
      ];
    } else if (this.phonelistingSource === 'search') {
      this.phonelistingList$ = this.phonelistingService.searched$;
      this.displayedColumns = [
        'col-image',
        'col-title',
        'col-brand',
        'col-rating',
        'col-price',
        'col-stock',
        'col-seller'
      ];
    }
    
    // Compute filteredPhoneList dynamically.
    this.filteredPhoneListingList$ = computed(() =>
      this.phonelistingList$().filter(phonelisting => 
        phonelisting.price >= this.priceMin$() && 
        phonelisting.price <= this.priceMax$()
      )
    );
    
    // Compute maxPrice dynamically.
    this.maxPrice$ = computed(() => {
      const phonelistings = this.phonelistingList$();
      return phonelistings.length ? Math.max(...phonelistings.map(phonelisting => phonelisting.price)) : 100;
    });
  }

  // Get the image path for the brand.
  getBrandImages(brand: string): string {
    return this.phonelistingService.brandImageMap[brand] || "assets/images/default.png";
  }
  
  // Format price to show 2 decimal places
  formatPrice(price: number): string {
    return '$' + price.toFixed(2);
  }
  
  // Get the integer and fraction part for star ratings
  getStars(rating: number | null | undefined): number[] {
    if(!rating) {
      return [0];
    }
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1;
    const stars = Array(fullStars).fill(1);
    if(halfStar > 0) {
      stars.push(halfStar);
    }
    return stars;
  }

  // Handle click on selected phonelisting.
  itemClicked(phonelisting: any): void {
    console.log("The phonelisting is selected:", phonelisting._id);
    this.userService.homeState$.set('item');
    this.router.navigate(['item', phonelisting._id]);
  }

  // sort differently when select different options
  onSortChange(sortKey: string): void {
    const list = [...this.phonelistingList$()];

    if (sortKey === 'priceAsc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortKey === 'priceDesc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortKey === 'titleAsc') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortKey === 'titleDesc') {
      list.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortKey === 'stockAsc') {
      list.sort((a, b) => a.stock - b.stock);
    } else if (sortKey === 'stockDesc') {
      list.sort((a, b) => b.stock - a.stock);
    }

    this.phonelistingList$.set(list);
  }
}