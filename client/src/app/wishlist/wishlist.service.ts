import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Phone } from '../phone';

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
  addToWishlist(userId: string, productId: string) {
    console.log("Adding the wish list record to server.");
    this.http.post(this.apiUrl, { userId, productId }).subscribe({
      next: response => console.log("Wish list added:",response),
      error: err => {
        alert("Item has been added to your wish list.");
      }
    })
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
