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

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.cartItems = this.cartService.getItems();
  }

  increase(phoneId: string): void {
    this.cartService.increaseQuantity(phoneId);
    this.cartItems = this.cartService.getItems();
  }

  decrease(phoneId: string): void {
    this.cartService.decreaseQuantity(phoneId);
    this.cartItems = this.cartService.getItems();
  }

  remove(phoneId: string): void {
    this.cartService.removeFromCart(phoneId);
    this.cartItems = this.cartService.getItems();
  }

  getTotalPrice(item: CartItem): number {
    return item.phone.price * item.quantity;
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + item.phone.price * item.quantity, 0);
  }

  confirmOrder(): void {
    this.cartService.createOrder().subscribe({
      next: () => {
        alert('✅ Order placed successfully!');
        this.cartService.clearCart();
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
