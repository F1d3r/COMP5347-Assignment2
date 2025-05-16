import { Component, OnInit, WritableSignal, Input, inject, signal, effect} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhoneService } from '../phone.service';
import { RouterModule } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Phone } from '../phone';

import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-phone-list',
  imports: [MatTableModule, MatCardModule, MatButtonModule, RouterModule, CommonModule, MatSelectModule],

  styles: [
    `
      table{
        width: 100%;
      }
      img{
        width: 100px;
        height: auto;
      }
    `,
  ],

  template: `
    <div *ngIf="phoneSource === 'search'">
      <mat-select placeholder="Sort by:" (selectionChange)="onSortChange($event.value)">
        <mat-option value="titleAsc">Title: A -> Z</mat-option>
        <mat-option value="titleDesc">Title: Z -> A</mat-option>
        <mat-option value="priceAsc">Price: Low to High</mat-option>
        <mat-option value="priceDesc">Price: High to Low</mat-option>
        <mat-option value="stockAsc">Stock: Low to High</mat-option>
        <mat-option value="stockDesc">Stock: High to Low</mat-option>
      </mat-select>
    </div>
    <mat-card>
        <mat-card-header>
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
            <table mat-table [dataSource]="phoneSource === 'search' ? sortedPhoneList$() : phoneList$()">
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
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
        </mat-card-content>
    </mat-card>
  `
})
export class PhoneListComponent implements OnInit { 
  @Input() phoneSource?: string;
  
  phoneList$ = {} as WritableSignal<Phone[]>;
  sortedPhoneList$ = signal<Phone[]>([]); // list storing sorted phones
  displayedColumns:string[] = [];

  private brandImageMap: { [key: string]: string } = {
    "Apple": "assets/images/Apple.jpeg",
    "BlackBerry": "assets/images/BlackBerry.jpeg",
    "HTC": "assets/images/HTC.jpeg",
    "Huawei": "assets/images/Huawei.jpeg",
    "LG": "assets/images/LG.jpeg",
    "Motorola": "assets/images/Motorola.jpeg",
    "Nokia": "assets/images/Nokia.jpeg",
    "Samsung": "assets/images/Samsung.jpeg",
    "Sony": "assets/images/Sony.jpeg"
  };

  constructor(private phoneService:PhoneService){
    effect(() => {
      const list = this.phoneList$(); // monitor change of phoneList$
      if (list) {
        this.sortedPhoneList$.set([...list]); // update sortedPhoneList$ (a copy) when phoneList$ changes
      }
    });
  }

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
  }

  // Get the image path for the brand.
  getBrandImages(brand: string){
    return this.brandImageMap[brand] || "assets/images/default.png";
  }

  // sort differently when select different options
  onSortChange(sortKey: string){
    const list = [...this.sortedPhoneList$()];

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

    this.sortedPhoneList$.set(list);
  }
}
