import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PhoneService, Phone } from './phone.service';
import { CartService } from '../cart/cart.service';
import { WishlistService } from '../wishlist/wishlist.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  phones: Phone[] = []; // store the good data

  constructor(
    private router: Router,
    private phoneService: PhoneService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.phoneService.getPhones().subscribe({
      next: (data) => {
        console.log('📦 Phones fetched:', data);//test
        this.phones = data;
      },
      error: (err) => {
        console.error('Error fetching phones:', err);
      }
    });
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  addToCart(phone: Phone): void {
    this.cartService.addToCart(phone);
  }

  goToDetail(phoneId: string): void {
    this.router.navigate(['/product', phoneId]);
  }
  
  goToWishlist(): void {
    this.router.navigate(['/wishlist']);
  }
  
  addToWishlist(phone: Phone): void {
    const userId = 'demo-user-id';
    this.wishlistService.addToWishlist(userId, phone._id).subscribe(() => {
      console.log('📌 Added to wishlist:', phone.title);
    });
  }
  
}
