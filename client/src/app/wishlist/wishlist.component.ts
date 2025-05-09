import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistService } from './wishlist.service';
import { Phone, PhoneService } from '../shop/phone.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
    userId: string = 'demo-user-id';
    wishlistItems: Phone[] = [];
  
    constructor(
      private wishlistService: WishlistService,
      private phoneService: PhoneService,
      private router: Router
    ) {}
  
    ngOnInit(): void {
      this.wishlistService.getWishlist(this.userId).subscribe({
        next: (list) => {
          this.phoneService.getPhones().subscribe((phones) => {
            this.wishlistItems = list
              .map((entry) => phones.find((p) => p._id === entry.productId))
              .filter((p): p is Phone => !!p);
          });
        },
        error: (err) => console.error('Failed to load wishlist', err)
      });
    }
  
    removeFromWishlist(phoneId: string): void {
      this.wishlistService.removeFromWishlist(this.userId, phoneId).subscribe(() => {
        this.wishlistItems = this.wishlistItems.filter(p => p._id !== phoneId);
      });
    }
  

    goBack(): void {
        this.router.navigate(['/shop']);
    }
}
