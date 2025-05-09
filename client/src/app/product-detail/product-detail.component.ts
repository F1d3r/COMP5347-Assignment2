import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PhoneService, Phone } from '../shop/phone.service';
import { CartService } from '../cart/cart.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  phone: Phone | null = null;

  constructor(
    private route: ActivatedRoute,
    private phoneService: PhoneService,
    private cartService: CartService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.phoneService.getPhones().subscribe((phones) => {
        this.phone = phones.find(p => p._id === id) || null;
      });
    }
  }

  addToCart(): void {
    if (this.phone) {
      this.cartService.addToCart(this.phone);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
