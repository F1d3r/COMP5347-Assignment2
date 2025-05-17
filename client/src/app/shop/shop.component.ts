import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PhoneService, Phone } from './phone.service';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  phones: Phone[] = []; // store the good data

  constructor(
    private router: Router,
    private phoneService: PhoneService
  ) {}

  ngOnInit(): void {
    this.phoneService.getPhones().subscribe({
      next: (data) => {
        console.log('📦 Phones fetched:', data);//test
        this.phones = data;
      },
      error: (err) => {
        console.error('Error fetching phones:', err);
      }
    });
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToDetail(phoneId: string): void {
    this.router.navigate(['/product', phoneId]);
  }
  
  goToWishlist(): void {
    this.router.navigate(['/wishlist']);
  }
  
}
