import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';

import {UserService} from './user.service'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule],

  styles: [
    `
    `
  ],

  template: `
    <mat-toolbar>
      <span>OldPhoneDeals</span>
    </mat-toolbar>
    <main>
      <!-- Show the component given by the router -->
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {
  title = 'OldPhoneDeals';

}
