import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PhoneListing } from '../phonelisting';
import { Observable } from 'rxjs';

import { signal } from '@angular/core';

import { NotificationService } from '../notification.service';


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

  allQuantity$ = signal(0);

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {
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
    
    // Add notification for item added to cart
    let notifications: any[] = [];
    this.notificationService.notifications$.subscribe(currentNotifications => {
      notifications = currentNotifications;
    }).unsubscribe();
    
    const newNotification = {
      _id: new Date().getTime().toString(),
      type: 'ADMIN_ALERT' as 'ORDER_PLACED' | 'ORDER_DELIVERED' | 'ADMIN_ALERT',
      content: `Added ${quantity} × ${phonelisting.title} to your cart`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedItem: phonelisting._id
    };
    this.notificationService.updateNotifications([newNotification, ...notifications]);
    
    this.saveToStorage();
    this.allQuantity$.set(this.getAllQuantity());
    return;
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

  getAllQuantity(){
    let allQuantity = 0;
    const data = this.getItems();
    data.forEach((cartItem) =>{
      allQuantity += this.getQuantity(cartItem.phonelisting._id);
    })
    return allQuantity;
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