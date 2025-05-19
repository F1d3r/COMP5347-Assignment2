import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PhoneListing } from '../phonelisting';
import { Observable } from 'rxjs';

export interface CartItem {
  phonelisting: PhoneListing;
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

  addToCart(phonelisting: PhoneListing, quantity: number): void {
    this.items[phonelisting._id] = { phonelisting, quantity: quantity, max_quantity: quantity};
    console.log(`✅ Added to cart: ${phonelisting.title}`);
    this.saveToStorage();
  }

  getItems(): CartItem[] {
    const stored = localStorage.getItem(this.storageKey);
    const data: { [id: string]: CartItem } = stored ? JSON.parse(stored) : {};
    return Object.values(data);
  }
  
  getQuantity(phonelistingId: string): number {
    this.loadFromStorage();
    return this.items[phonelistingId]?.quantity || 0;
  }
  

  increaseQuantity(phonelistingId: string): void {
    if (this.items[phonelistingId]) {
      if(this.items[phonelistingId].quantity == this.items[phonelistingId].max_quantity){
        return;
      }
      this.items[phonelistingId].quantity += 1;
      this.saveToStorage();
    }
  }

  decreaseQuantity(phonelistingId: string): void {
    if (this.items[phonelistingId]) {
      this.items[phonelistingId].quantity -= 1;
      if (this.items[phonelistingId].quantity <= 0) {
        delete this.items[phonelistingId];
      }
      this.saveToStorage();
    }
  }

  removeFromCart(phonelistingId: string): void {
    delete this.items[phonelistingId];
    this.saveToStorage();
    console.log('🗑️ Removed from cart:', phonelistingId);
  }

  clearCart(): void {
    this.items = {};
    this.saveToStorage();
  }

  createOrder(userId: string): Observable<any> {
    const cartArray = Object.values(this.items);
  
    const orderPayload = {
      userId,
      items: cartArray.map((item: CartItem) => ({
        productId: item.phonelisting._id,
        title: item.phonelisting.title,
        price: item.phonelisting.price,
        quantity: item.quantity
      })),
      total: cartArray.reduce((sum, item) => sum + item.phonelisting.price * item.quantity, 0)
    };
  
    return this.http.post('/api/orders', orderPayload);
  }
  
  
}