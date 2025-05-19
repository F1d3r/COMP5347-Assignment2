import { UserService } from './../user.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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
    private userService: UserService
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

  confirmOrder(): void {
    this.cartService.createOrder(this.userService.user$()?._id!).subscribe({
      next: () => {
        alert('✅ Order placed successfully!');
        this.userService.homeState$.set('home');
        this.cartService.clearCart();
        console.log("Cart cleaned");
        console.log("Cart:", this.cartService.getItems);
        this.router.navigate(['/']);
      },
      error: () => {
        alert('❌ Failed to place order. Please try again.');
      }
    });
  }

  goBack(): void {
    window.history.back();
  }
}
