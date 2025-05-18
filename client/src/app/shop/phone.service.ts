// client/src/app/shop/phone.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Phone {
  _id: string;
  title: string;
  brand: string;
  image: string;
  price: number;
  stock: number;
}

@Injectable({
  providedIn: 'root'
})
export class PhoneService {
  private apiUrl = 'http://localhost:3000/api/phones';

  constructor(private http: HttpClient) {}

  getPhones(): Observable<Phone[]> {
    return this.http.get<Phone[]>(this.apiUrl);
  }
}
