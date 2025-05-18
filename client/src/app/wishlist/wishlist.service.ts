import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Phone } from '../shop/phone.service';

export interface WishlistItem {
  userId: string;
  productId: string;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private apiUrl = 'http://localhost:3000/api/wishlist';

  constructor(private http: HttpClient) {}

  // Add
  addToWishlist(userId: string, productId: string): Observable<any> {
    return this.http.post(this.apiUrl, { userId, productId });
  }

  // Get
  getWishlist(userId: string): Observable<WishlistItem[]> {
    return this.http.get<WishlistItem[]>(`${this.apiUrl}/${userId}`);
  }

  // Delete
  removeFromWishlist(userId: string, productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/${productId}`);
  }
}
