import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Phone } from './phone';

@Injectable({
  providedIn: 'root'
})
export class PhoneService {
  private url = 'http://localhost:3000';
  

  topPhones$ = signal<Phone[]>([]);
  soldOutSoonPhones$ = signal<Phone[]>([]);

  constructor(private httpClient:HttpClient) { }

  private refreshTopSeller(){
    console.log("Updating top sellers");
    this.httpClient.get<Phone[]>(`${this.url}/bestSeller`)
      .subscribe(result =>{
        this.topPhones$.set(result);
      })
  }

  private refreshSoldout(){
    this.httpClient.get<Phone[]>(`${this.url}/bestSeller`)
      .subscribe(result =>{
        this.soldOutSoonPhones$.set(result);
      })
  }

  getBestSellerPhones(){
    this.refreshTopSeller();
    return this.topPhones$;
  }

  getSoldOutSoonPhones(){
    this.refreshSoldout();
    return this.soldOutSoonPhones$;
  }
}
