import { Injectable, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Phone } from './phone';

@Injectable({
  providedIn: 'root'
})
export class PhoneService {
  private url = 'http://localhost:3000/phones';
  
  bestSeller$ = signal<Phone[]>([]);
  soldOutSoon$ = signal<Phone[]>([]);
  searched$ = signal<Phone[]>([]);

  constructor(private httpClient:HttpClient) {}

  getBestSeller(){
    this.httpClient.get<Phone[]>(`${this.url}/bestSellers`).subscribe(phones =>{
      this.bestSeller$.set(phones);
    })
    return this.bestSeller$;
  }

  getSoldOutSoon(){
    this.httpClient.get<Phone[]>(`${this.url}/soldOutSoon`).subscribe(phones => {
      this.soldOutSoon$.set(phones);
    })
    return this.soldOutSoon$;
  }

  getAllBrand(){
    return this.httpClient.get<string[]>(`${this.url}/allBrands`);
  }

  getPhones(keyword:string, brand:string){
    return this.httpClient.get<Phone[]>(`${this.url}/search?keyword=${keyword}&brand=${brand}`)
  }
}
