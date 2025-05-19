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
  selector: 'app-phone-list',
  imports: [MatTableModule, MatCardModule, MatButtonModule, RouterModule, CommonModule, MatSelectModule, MatSliderModule, MatIconModule],

  styles: [
    `
      :host {
        --primary-dark: #2c3e50;
        --primary-light: #3498db;
        --text-muted: #7f8c8d;
        --border-light: #e1e5e9;
      }
      
      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
      }

      img {
        width: 100px;
        height: 100px;
        object-fit: contain;
        margin: 0 auto;
        display: block;
      }
      
      th, td {
        padding: 12px 16px;
        text-align: left;
        vertical-align: middle;
        border-bottom: 1px solid var(--border-light);
      }
      
      th {
        background-color: #f8f9fa;
        color: var(--primary-dark);
        font-weight: 600;
      }
      
      tr:hover {
        background-color: #f5f7fa;
        cursor: pointer;
      }

      #sort_slider {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 16px;
        height: 40px;
        font-size: 0.85rem;
      }
      
      .star-icon {
        color: gold;
      }
      
      .rating-display {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .seller-info {
        display: flex;
        flex-direction: column;
      }
      
      .seller-name {
        font-weight: 500;
        color: var(--primary-dark);
      }
      
      .seller-email {
        font-size: 0.85rem;
        color: var(--text-muted);
      }
      
      mat-card {
        box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        margin-bottom: 1rem;
        border-radius: 8px;
        overflow: hidden;
      }
      
      mat-card-header {
        background-color: var(--primary-dark);
        color: white;
        padding: 1rem;
      }
      
      mat-card-title {
        margin: 0 !important;
        font-size: 1.25rem !important;
      }
      
      mat-card-subtitle {
        color: rgba(255, 255, 255, 0.8) !important;
        margin: 0.5rem 0 0 0 !important;
      }
      
      mat-card-content {
        padding: 1rem;
      }
      
      .price-display {
        font-weight: 600;
        color: var(--primary-dark);
      }
    `,
  ],

  template: `
    <mat-card>
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
                  <mat-option value="titleAsc">Title: A → Z</mat-option>
                  <mat-option value="titleDesc">Title: Z → A</mat-option>
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

            <table mat-table [dataSource]="filteredPhoneListingList$()">
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
              <!-- For price -->
              <ng-container matColumnDef="col-price">
                <th mat-header-cell *matHeaderCellDef>Price</th>
                <td mat-cell *matCellDef="let phonelisting">
                  <div class="price-display">${{phonelisting.price.toFixed(2)}}</div>
                </td>
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
                  <div class="seller-info">
                    <span class="seller-name">{{phonelisting.seller.firstname}} {{phonelisting.seller.lastname}}</span>
                    <span class="seller-email">{{phonelisting.seller.email}}</span>
                  </div>
                </td>
              </ng-container>
              <!-- For review -->
              <ng-container matColumnDef="col-reviews">
                <th mat-header-cell *matHeaderCellDef>Reviews</th>
                <td mat-cell *matCellDef="let phonelisting">{{phonelisting.reviews?.length || 0}}</td>
              </ng-container>
              <!-- For rating -->
              <ng-container matColumnDef="col-rating">
                <th mat-header-cell *matHeaderCellDef>Rating</th>
                <td mat-cell *matCellDef="let phonelisting">
                  <div class="rating-display">
                    <span *ngFor="let star of getStars(phonelisting.avgRating)">
                      <mat-icon class='star-icon' [ngStyle]="{'clip-path': 'inset(0 ' + (100 - star * 100) + '% 0 0)'}">star</mat-icon>
                    </span>
                    <span>({{phonelisting.reviews?.length || 0}})</span>
                  </div>
                </td>
              </ng-container>

              <!-- Add header and row definitions -->
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="itemClicked(row)"></tr>
            </table>
        </mat-card-content>
    </mat-card>
  `
})
export class PhoneListComponent implements OnInit { 
  @Input() phonelistingSource?: string;

  priceMin$ = signal(0);
  priceMax$ = signal(10000);
  phonelistingList$ = {} as WritableSignal<PhoneListing[]>;
  maxPrice$: any;
  filteredPhoneListingList$: any;
  displayedColumns:string[] = [];

  allPhoneListings: PhoneListing[] = []; // completed phonelisting list

  constructor(
    private phonelistingService:PhoneListingService,
    private userService: UserService,
    private router: Router
  ){}

  ngOnInit(): void {
    console.log("PhoneListing Source:",this.phonelistingSource);
    if(this.phonelistingSource === 'bestSeller'){
      this.phonelistingService.getBestSeller();
      this.phonelistingList$ = this.phonelistingService.bestSeller$;
      this.displayedColumns = [
        'col-image',
        'col-title',
        'col-rating',
        'col-price'
      ]
    }else if(this.phonelistingSource === 'soldOutSoon'){
      this.phonelistingService.getSoldOutSoon();
      this.phonelistingList$ = this.phonelistingService.soldOutSoon$;
      this.displayedColumns = [
        'col-image',
        'col-title',
        'col-rating',
        'col-price'
      ]
    }else if(this.phonelistingSource === 'search'){
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
      this.phonelistingList$().filter(phonelisting => phonelisting.price >= this.priceMin$() && phonelisting.price <= this.priceMax$())
    );
    // Compute maxPrice dynamically.
    this.maxPrice$ = computed(() => {
      const phonelistings = this.phonelistingList$();
      return phonelistings.length ? Math.max(...phonelistings.map(phonelisting => phonelisting.price)) : 100;
    });
  }

  // Get the image path for the brand.
  getBrandImages(brand: string){
    return this.phonelistingService.brandImageMap[brand] || "assets/images/default.png";
  }
  
  // Get the integer and fraction part for star ratings
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

  // Handle click on selected phonelisting.
  itemClicked(phonelisting: any): void{
    console.log("The phonelisting is selected:",phonelisting._id);
    this.userService.homeState$.set('item');
    this.router.navigate(['item', phonelisting._id]);
  }

  // sort differently when select different options
  onSortChange(sortKey: string){
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