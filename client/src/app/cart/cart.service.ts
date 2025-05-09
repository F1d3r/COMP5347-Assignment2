import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Phone } from '../shop/phone.service';
import { Observable } from 'rxjs';

export interface CartItem {
  phone: Phone;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: { [id: string]: CartItem } = {};

  constructor(private http: HttpClient) {}

  addToCart(phone: Phone): void {
    if (this.items[phone._id]) {
      this.items[phone._id].quantity += 1;
    } else {
      this.items[phone._id] = { phone, quantity: 1 };
    }
    console.log(`✅ Added to cart: ${phone.title}`);
  }

  getItems(): CartItem[] {
    return Object.values(this.items);
  }

  increaseQuantity(phoneId: string): void {
    if (this.items[phoneId]) {
      this.items[phoneId].quantity += 1;
    }
  }

  decreaseQuantity(phoneId: string): void {
    if (this.items[phoneId]) {
      this.items[phoneId].quantity -= 1;
      if (this.items[phoneId].quantity <= 0) {
        delete this.items[phoneId];
      }
    }
  }

  removeFromCart(phoneId: string): void {
    delete this.items[phoneId];
    console.log('🗑️ Removed from cart:', phoneId);
  }

  clearCart(): void {
    this.items = {};
  }

  createOrder(): Observable<any> {
    const cartArray = Object.values(this.items);  // ✅ 转换为数组
  
    const orderPayload = {
      items: cartArray.map((item: CartItem) => ({
        productId: item.phone._id,
        quantity: item.quantity
      })),
      total: cartArray.reduce((sum, item) => sum + item.phone.price * item.quantity, 0)
    };
  
    return this.http.post('http://localhost:3000/api/orders', orderPayload);
  }
  
}
