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
  searchedPhones$ = signal<Phone[]>([]);

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

  getAllBrand(){
    return this.httpClient.get<string[]>(`${this.url}/allBrand`);
  }

  getPhones(keyword:string, brand:string){
    return this.httpClient.get<Phone[]>(`${this.url}/search?keyword=${keyword}&brand=${brand}`)
  }

}
