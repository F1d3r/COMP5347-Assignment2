import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from './cart.service';
import { Router } from '@angular/router';

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
    private router: Router
  ) {}

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
  
  checkout(): void {
    this.cartService.createOrder().subscribe({
      next: () => {
        alert('✅ Order submitted successfully!');
        this.cartService.clearCart();
        this.cartItems = [];
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to submit order. Please try again.';
        alert(`❌ ${msg}`);
      }
    });
  }
  
  
  goBack(): void {
    this.router.navigate(['/shop']);
  }
  
}
