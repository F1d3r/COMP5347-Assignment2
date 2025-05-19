import { UserService } from './../user.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PhoneService } from '../phone.service';
import { CartService, CartItem } from './cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(
    private cartService: CartService, 
    private router: Router,
    private userService: UserService,
    private phoneService: PhoneService
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
  
  getTaxAmount(): number {
    return this.getTotal() * 0.05;
  }
  
  getFinalTotal(): number {
    return this.getTotal() + this.getTaxAmount();
  }

  confirmOrder(): void {
    // Get current user ID
    const userId = this.userService.user$()?._id;
    
    if (!userId) {
      alert('❌ You must be logged in to place an order.');
      return;
    }
    
    // Make sure there are items in cart
    if (this.cartItems.length === 0) {
      alert('❌ Your cart is empty.');
      return;
    }
    
    this.cartService.createOrder(userId).subscribe({
      next: () => {
        alert('✅ Order placed successfully!');
        this.userService.homeState$.set('home');
        this.cartService.clearCart();
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Order error:', error);
        alert('❌ Failed to place order. Please try again.');
      }
    });
  }

  goBack(): void {
    window.history.back();
  }

  getBrandImage(brand: string): string {
    return this.phoneService.brandImageMap[brand] || 'assets/images/default.png';
  }
}
