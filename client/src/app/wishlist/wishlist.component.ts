import { UserService } from './../user.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistService } from './wishlist.service';
import { Phone } from '../phone';
import { PhoneService } from '../phone.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
    wishlistItems: Phone[] = [];
  
    constructor(
      private wishlistService: WishlistService,
      private phoneService: PhoneService,
      private userService: UserService,
      private router: Router
    ) {}
  
    ngOnInit(): void {
      this.wishlistService.getWishlist(this.userService.user$()?._id!).subscribe({
        next: (list) => {
          this.phoneService.getPhones('', 'All').subscribe((phones) => {
            this.wishlistItems = list
              .map((entry) => phones.find((p) => p._id === entry.productId))
              .filter((p): p is Phone => !!p);
          });
        },
        error: (err) => console.error('Failed to load wishlist', err)
      });
    }
  
    removeFromWishlist(phoneId: string): void {
      this.wishlistService.removeFromWishlist(this.userService.user$()?._id!, phoneId).subscribe(() => {
        this.wishlistItems = this.wishlistItems.filter(p => p._id !== phoneId);
      });
    }
  

    goBack(): void {
      window.history.back();
    }

    // Get the image path for the brand.
    getBrandImage(brand: string | null | undefined){
      if(!brand){
        return null;
      }
      return this.phoneService.brandImageMap[brand];
    }
}
