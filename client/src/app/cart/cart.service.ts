import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Phone } from '../phone';
import { Observable } from 'rxjs';

export interface CartItem {
  phone: Phone;
  quantity: number;
  max_quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: { [id: string]: CartItem } = {};
  private storageKey = 'cartItems';

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  private saveToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.storageKey);
    this.items = stored ? JSON.parse(stored) : {};
  }

  addToCart(phone: Phone, quantity: number): void {
    this.items[phone._id] = { phone, quantity: quantity, max_quantity: quantity};
    console.log(`✅ Added to cart: ${phone.title}`);
    this.saveToStorage();
  }

  getItems(): CartItem[] {
    const stored = localStorage.getItem(this.storageKey);
    const data: { [id: string]: CartItem } = stored ? JSON.parse(stored) : {};
    return Object.values(data);
  }
  
  getQuantity(phoneId: string): number {
    this.loadFromStorage();
    return this.items[phoneId]?.quantity || 0;
  }
  

  increaseQuantity(phoneId: string): void {
    if (this.items[phoneId]) {
      if(this.items[phoneId].quantity == this.items[phoneId].max_quantity){
        return;
      }
      this.items[phoneId].quantity += 1;
      this.saveToStorage();
    }
  }

  decreaseQuantity(phoneId: string): void {
    if (this.items[phoneId]) {
      this.items[phoneId].quantity -= 1;
      if (this.items[phoneId].quantity <= 0) {
        delete this.items[phoneId];
      }
      this.saveToStorage();
    }
  }

  removeFromCart(phoneId: string): void {
    delete this.items[phoneId];
    this.saveToStorage();
    console.log('🗑️ Removed from cart:', phoneId);
  }

  clearCart(): void {
    this.items = {};
  }

  createOrder(userId: string): Observable<any> {
    const cartArray = Object.values(this.items);
  
    const orderPayload = {
      userId,
      items: cartArray.map((item: CartItem) => ({
        productId: item.phone._id,
        quantity: item.quantity
      })),
      total: cartArray.reduce((sum, item) => sum + item.phone.price * item.quantity, 0)
    };
  
    return this.http.post('http://localhost:3000/api/orders', orderPayload);
  }
  
  
}
