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
  
  goToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
  
  
  goBack(): void {
    window.history.back();
  }
  
}
