import { Component, OnInit, WritableSignal } from '@angular/core';
import { Phone } from '../phone';
import { PhoneService } from '../phone.service';
import { RouterModule } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-sold-out-soon',
  imports: [MatTableModule, MatCardModule, MatButtonModule, RouterModule],
  template: `
    <mat-card>
        <mat-card-header>
            <mat-card-title>Best Sellers</mat-card-title>
            <mat-card-subtitle>Top 5 Phones</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
            <table mat-table [dataSource]="soldOutSoonPhones$()">
              <!-- For image -->
              <ng-container matColumnDef="col-img">
                <th mat-header-cell *matHeaderCellDef>Phone Image</th>
                <td mat-cell *matCellDef="let element">
                  <img matCardImage [src]='getBrandImages(element.brand)' alt="Phone Img">
                </td>
              </ng-container>
              <!-- For rating -->
              <ng-container matColumnDef="col-rating">
                <th mat-header-cell *matHeaderCellDef>Price</th>
                <td mat-cell *matCellDef="let element">{{ element.price}}</td>
              </ng-container>

            </table>
        </mat-card-content>

        <mat-card-actions>
            <!-- <button mat-button (click)="onAction1">Action1</button> -->
            
        </mat-card-actions>
        <mat-card-footer>
            Footer
        </mat-card-footer>
    </mat-card>
  `,
  styles: ``
})
export class SoldOutSoonComponent { 
  soldOutSoonPhones$ = {} as WritableSignal<Phone[]>;
  private brandImageMap: { [key: string]: string } = {
    "Apple": "assets/images/Apple.jpeg",
    "BlackBerry": "assets/images/BlackBerry.jpeg",
    "HTC": "assets/images/HTC.jpeg",
    "Huawei": "assets/images/Huawei.jpeg",
    "LG": "assets/images/LG.jpeg",
    "Motorola": "assets/images/Motorola.jpeg",
    "Nokia": "assets/images/Nokia.jpeg",
    "Samsung": "assets/images/Samsung.jpeg",
    "Sony": "assets/images/Sopy.jpeg"
  };

  displayColumns:string[] = [
    'col-img',
    'col-price'
  ]

  // Get the image path for the brand.
  getBrandImages(brand: string){
    return this.brandImageMap[brand] || "assets/images/default.png";
  }

  constructor(private phoneService:PhoneService){}

  ngOnInit() {
    this.fetchSoldOutSoon();
  }

  private fetchSoldOutSoon(): void {
    this.soldOutSoonPhones$ = this.phoneService.soldOutSoonPhones$;
    this.phoneService.getSoldOutSoonPhones();
  }
}
