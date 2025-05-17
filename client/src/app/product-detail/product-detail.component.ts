import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PhoneService, Phone } from '../shop/phone.service';
import { CartService } from '../cart/cart.service';
import { Location } from '@angular/common';
import { WishlistService } from '../wishlist/wishlist.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  phone: Phone | null = null;
  showQuantityInput = false;
  currentQuantity: number = 0;
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private phoneService: PhoneService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.phoneService.getPhones().subscribe((phones) => {
        this.phone = phones.find(p => p._id === id) || null;
        if (this.phone) {
          this.currentQuantity = this.cartService.getQuantity(this.phone._id);
        }
      });
    }
  }

  triggerAddToCart(): void {
    this.showQuantityInput = true;
  }

  confirmAddToCart(): void {
    if (this.phone && this.quantity > 0) {
      for (let i = 0; i < this.quantity; i++) {
        this.cartService.addToCart(this.phone);
      }
      this.currentQuantity = this.cartService.getQuantity(this.phone._id); // 👈 update after add
      alert(`✅ ${this.quantity} x ${this.phone.title} added to cart!`);
      this.showQuantityInput = false;
      this.quantity = 1;
    }
  }

  cancelAdd(): void {
    this.showQuantityInput = false;
    this.quantity = 1;
  }
  
  addToWishlist(): void {
    if (this.phone) {
      const userId = 'demo-user-id';
      this.wishlistService.addToWishlist(userId, this.phone._id).subscribe(() => {
        alert('📌 Added to wishlist!');
      });
    }
  }
  

  goBack(): void {
    this.location.back();
  }
}
