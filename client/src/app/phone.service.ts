import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Phone } from './phone';


@Injectable({
  providedIn: 'root'
})
export class PhoneService {
  private url = 'http://localhost:3000';
  brandImageMap: { [key: string]: string } = {
    "Apple": "assets/images/Apple.jpeg",
    "BlackBerry": "assets/images/BlackBerry.jpeg",
    "HTC": "assets/images/HTC.jpeg",
    "Huawei": "assets/images/Huawei.jpeg",
    "LG": "assets/images/LG.jpeg",
    "Motorola": "assets/images/Motorola.jpeg",
    "Nokia": "assets/images/Nokia.jpeg",
    "Samsung": "assets/images/Samsung.jpeg",
    "Sony": "assets/images/Sony.jpeg"
  };
  
  bestSeller$ = signal<Phone[]>([]);
  soldOutSoon$ = signal<Phone[]>([]);
  searched$ = signal<Phone[]>([]);
  selected$ = signal<Phone|null>(null);

  constructor(private httpClient:HttpClient) {}

  getBestSeller(){
    this.httpClient.get<Phone[]>(`${this.url}/phone/bestSeller`).subscribe(phones =>{
      this.bestSeller$.set(phones);
    })
    return this.bestSeller$;
  }

  getSoldOutSoon(){
    this.httpClient.get<Phone[]>(`${this.url}/phone/soldOutSoon`).subscribe(phones => {
      this.soldOutSoon$.set(phones);
    })
    return this.soldOutSoon$;
  }
  
  getPhone(phone_id: string|null){
    if(!phone_id){
      return console.error('The phone id is not passed correctly');
    }
    this.httpClient.get<Phone>(`${this.url}/phone/${phone_id}`).subscribe(phone => {
      if(!phone){
        return console.error("Phone does not exist");
      }
      this.selected$.set(phone);
    })
    return this.selected$;
  }

  getAllBrand(){
    return this.httpClient.get<string[]>(`${this.url}/phone/allBrand`);
  }

  getPhones(keyword:string, brand:string){
    return this.httpClient.get<Phone[]>(`${this.url}/phone/search?keyword=${keyword}&brand=${brand}`);
  }


}
