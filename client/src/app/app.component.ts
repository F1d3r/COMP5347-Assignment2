import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';

import { TopSellerComponent } from './top-seller/top-seller.component';
// import { SoldOutSoonComponent } from './sold-out-soon/sold-out-soon.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopSellerComponent, MatToolbarModule],
  template: `
    <mat-toolbar>
      <span>Welcome to {{title}}</span>
    </mat-toolbar>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [],
})
export class AppComponent {
  title = 'OldPhoneDeals';
}
