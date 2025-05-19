import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from './cart.service';
import { Router } from '@angular/router';
import { PhoneListingService } from '../phonelisting.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(
    private cartService: CartService,
    private router: Router,
    private phonelistingService: PhoneListingService
  ) {}

  ngOnInit(): void {
    this.cartItems = this.cartService.getItems();
  }

  increase(phonelistingId: string): void {
    this.cartService.increaseQuantity(phonelistingId);
    this.cartItems = this.cartService.getItems();
  }

  decrease(phonelistingId: string): void {
    this.cartService.decreaseQuantity(phonelistingId);
    this.cartItems = this.cartService.getItems();
  }

  remove(phonelistingId: string): void {
    this.cartService.removeFromCart(phonelistingId);
    this.cartItems = this.cartService.getItems();
  }

  getTotalPrice(item: CartItem): number {
    return item.phonelisting.price * item.quantity;
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + item.phonelisting.price * item.quantity, 0);
  }  
  
  goToCheckout(): void {
    this.router.navigate(['/checkout']);
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