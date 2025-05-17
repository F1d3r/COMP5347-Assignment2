import { UserService } from './../user.service';
import { Component, OnInit, WritableSignal, Input, inject, signal } from '@angular/core';
import { computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhoneService } from '../phone.service';
import { RouterModule, Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Phone } from '../phone';

import { MatSelectModule } from '@angular/material/select';

import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-phone-list',
  imports: [MatTableModule, MatCardModule, MatButtonModule, RouterModule, CommonModule, MatSelectModule, MatSliderModule],

  styles: [
    `
      table{
        width: 100%;
      }
      img{
        width: 35%;
        height: auto;
      }

      #sort_slider{
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 16px;
        height: 40px;
        font-size: 0.85rem;
      }

    `,
  ],

  template: `
    <mat-card>
        <mat-card-header *ngIf="phoneSource !== 'search'">
          <!-- The card title for best seller -->
          <span *ngIf="phoneSource === 'bestSeller'">
            <mat-card-title>Best Sellers</mat-card-title>
            <mat-card-subtitle>Highest Rating</mat-card-subtitle>
          </span>
          <!-- The card title for sold out soon -->
          <span *ngIf="phoneSource === 'soldOutSoon'">
            <mat-card-title>Sold Out Soon</mat-card-title>
            <mat-card-subtitle>Lowest stock</mat-card-subtitle>
          </span>
        </mat-card-header>
        
        <mat-card-content>
            <div *ngIf="phoneSource === 'search'" id='sort_slider'>
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
                <!-- <input #startInput matSliderStartThumb (input)="onInputChange(startInput.value, endInput.value)" />
                <input #endInput matSliderEndThumb (input)="onInputChange(startInput.value, endInput.value)" /> -->
                
                <input #startInput matSliderStartThumb [value]="priceMin$()" (input)="priceMin$.set($any($event.target).value || 0)" />
                <input #endInput matSliderEndThumb [value]="priceMax$()" (input)="priceMax$.set($any($event.target).value || 100)" />
              </mat-slider>
            </div>

            <table mat-table [dataSource]="filteredPhoneList$()">
              <!-- For image -->
              <ng-container matColumnDef="col-image">
                <th mat-header-cell *matHeaderCellDef>Image</th>
                <td mat-cell *matCellDef="let phone">
                  <img matCardImage [src]='getBrandImages(phone.brand)' alt="Phone Img">
                </td>
              </ng-container>
              <!-- For title -->
              <ng-container matColumnDef="col-title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let phone">{{phone.title}}</td>
              </ng-container>
              <!-- For brand -->
              <ng-container matColumnDef="col-brand">
                <th mat-header-cell *matHeaderCellDef>Brand</th>
                <td mat-cell *matCellDef="let phone">{{phone.brand}}</td>
              </ng-container>
              <!-- For price -->
              <ng-container matColumnDef="col-price">
                <th mat-header-cell *matHeaderCellDef>Price</th>
                <td mat-cell *matCellDef="let phone">{{phone.price}}</td>
              </ng-container>
              <!-- For stock -->
              <ng-container matColumnDef="col-stock">
                <th mat-header-cell *matHeaderCellDef>Stock</th>
                <td mat-cell *matCellDef="let phone">{{phone.stock}}</td>
              </ng-container>
              <!-- For seller -->
              <ng-container matColumnDef="col-seller">
                <th mat-header-cell *matHeaderCellDef>Seller</th>
                <td mat-cell *matCellDef="let phone">{{phone.seller}}</td>
              </ng-container>
              <!-- For review -->
              <ng-container matColumnDef="col-reviews">
                <th mat-header-cell *matHeaderCellDef>Reviews</th>
                <td mat-cell *matCellDef="let phone">{{phone.reviews}}</td>
              </ng-container>
              <!-- For rating -->
              <ng-container matColumnDef="col-rating">
                <th mat-header-cell *matHeaderCellDef>Rating</th>
                <td mat-cell *matCellDef="let phone">{{phone.avgRating}}</td>
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
  @Input() phoneSource?: string;

  priceMin$ = signal(0);
  priceMax$ = signal(10000);
  phoneList$ = {} as WritableSignal<Phone[]>;
  maxPrice$: any;
  filteredPhoneList$: any;
  displayedColumns:string[] = [];

  allPhones: Phone[] = []; // completed phone list

  constructor(
    private phoneService:PhoneService,
    private userService: UserService,
    private router: Router
  ){}

  ngOnInit(): void {
    console.log("Phone Source:",this.phoneSource);
    if(this.phoneSource === 'bestSeller'){
      this.phoneService.getBestSeller();
      this.phoneList$ = this.phoneService.bestSeller$;
      this.displayedColumns = [
        'col-image',
        'col-rating'
      ]
    }else if(this.phoneSource === 'soldOutSoon'){
      this.phoneService.getSoldOutSoon();
      this.phoneList$ = this.phoneService.soldOutSoon$;
      this.displayedColumns = [
        'col-image',
        'col-price'
      ]
    }else if(this.phoneSource === 'search'){
      this.phoneList$ = this.phoneService.searched$;
      this.displayedColumns = [
        'col-image',
        'col-title',
        'col-brand',
        'col-stock',
        'col-seller',
        'col-price'
      ];
    }
    // Compute filteredPhoneList dynamically.
    this.filteredPhoneList$ = computed(() =>
      this.phoneList$().filter(phone => phone.price >= this.priceMin$() && phone.price <= this.priceMax$())
    );
    // Compute maxPrice dynamically.
    this.maxPrice$ = computed(() => {
      const phones = this.phoneList$();
      return phones.length ? Math.max(...phones.map(phone => phone.price)) : 100;
    });
  }

  // Get the image path for the brand.
  getBrandImages(brand: string){
    return this.phoneService.brandImageMap[brand] || "assets/images/default.png";
  }


  // Handle click on selected phone.
  itemClicked(phone: any): void{
    console.log("The phone is selected:",phone._id);
    this.userService.homeState$.set('item');
    this.router.navigate(['item', phone._id]);
  }

  // sort differently when select different options
  onSortChange(sortKey: string){
    const list = [...this.phoneList$()];

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

    this.phoneList$.set(list);
  }

  // // filter phones under max price
  // onInputChange(startVal: string, endVal: string) {
  //   console.log('Start:', startVal, 'End:', endVal);
  //   this.currentMin = Number(startVal);
  //   this.currentMax = Number(endVal);
  // }
  

}
