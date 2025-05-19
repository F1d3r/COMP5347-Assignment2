import { UserService } from './../user.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistService } from './wishlist.service';
import { PhoneListing } from '../phonelisting';
import { PhoneListingService } from '../phonelisting.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
    wishlistItems: PhoneListing[] = [];
  
    constructor(
      private wishlistService: WishlistService,
      private phonelistingService: PhoneListingService,
      private userService: UserService,
      private router: Router
    ) {}
  
    ngOnInit(): void {
      this.wishlistService.getWishlist(this.userService.user$()?._id!).subscribe({
        next: (list) => {
          this.phonelistingService.getPhoneListings('', 'All').subscribe((phonelistings) => {
            this.wishlistItems = list
              .map((entry) => phonelistings.find((p) => p._id === entry.productId))
              .filter((p): p is PhoneListing => !!p);
          });
        },
        error: (err) => console.error('Failed to load wishlist', err)
      });
    }
  
    removeFromWishlist(phonelistingId: string): void {
      this.wishlistService.removeFromWishlist(this.userService.user$()?._id!, phonelistingId).subscribe(() => {
        this.wishlistItems = this.wishlistItems.filter(p => p._id !== phonelistingId);
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
      return this.phonelistingService.brandImageMap[brand];
    }
}