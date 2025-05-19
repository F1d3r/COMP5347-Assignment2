import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PhoneListing } from './phonelisting';


@Injectable({
  providedIn: 'root'
})
export class PhoneListingService {
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
  
  bestSeller$ = signal<PhoneListing[]>([]);
  soldOutSoon$ = signal<PhoneListing[]>([]);
  searched$ = signal<PhoneListing[]>([]);
  selected$ = signal<PhoneListing|null>(null);

  constructor(private httpClient:HttpClient) {}

  // Get the 5 best sellers.
  getBestSeller(){
    this.httpClient.get<PhoneListing[]>(`${this.url}/phonelisting/bestSeller`).subscribe(phonelistings =>{
      this.bestSeller$.set(phonelistings);
    })
    return this.bestSeller$;
  }

  // Get the 5 sold out soon.
  getSoldOutSoon(){
    this.httpClient.get<PhoneListing[]>(`${this.url}/phonelisting/soldOutSoon`).subscribe(phonelistings => {
      this.soldOutSoon$.set(phonelistings);
    })
    return this.soldOutSoon$;
  }
  
  // Get the phonelisting by id.
  getPhoneListing(phonelisting_id: string|null){
    if(!phonelisting_id){
      return console.error('The phonelisting id is not passed correctly');
    }
    this.httpClient.get<PhoneListing>(`${this.url}/phonelisting/${phonelisting_id}`).subscribe(phonelisting => {
      if(!phonelisting){
        return console.error("PhoneListing does not exist");
      }
      console.log("Got phonelisting:", phonelisting);
      this.selected$.set(phonelisting);
    })
    return this.selected$;
  }

  // Get all avialable brands in the database.
  getAllBrand(){
    return this.httpClient.get<string[]>(`${this.url}/phonelisting/allBrand`);
  }

  // Get phonelistings with title keyword and brand.
  getPhoneListings(keyword:string, brand:string){
    return this.httpClient.get<PhoneListing[]>(`${this.url}/phonelisting/search?keyword=${keyword}&brand=${brand}`);
  }

  // Add a review to current selected phonelisting.
  // And return the updated phonelisting.
  addReview(userId:string, comment: string, rating: number){
    return this.httpClient.post<PhoneListing>(`${this.url}/phonelisting/addReview`, {phonelisting_id: this.selected$()?._id, reviewer: userId, comment: comment, rating: rating});
  }

  hideReview(review_id: string, phone_id: string){
    this.httpClient.post<{ status: number, message: string, data: PhoneListing}>(`${this.url}/phonelisting/hideReview`, {review_id: review_id, phone_id:phone_id})
    .subscribe({
      next: (response) =>{
        if(response.status === 200){
          // Set the selected phone.
          this.selected$.set(response.data);
        }else{
          console.error("Got:",response.status);
        }
      },
      error: (err) => {
        console.error("The review does not exists.", err);
      }
    })
  }

  unhideReview(review_id: string, phone_id: string){
    this.httpClient.post<{ status: number, message: string, data: PhoneListing}>(`${this.url}/phonelisting/unhideReview`, {review_id: review_id, phone_id:phone_id})
    .subscribe({
      next: (response) =>{
        if(response.status === 200){
          // Set the selected phone.
          this.selected$.set(response.data);
        }else{
          console.error("Got:",response.status);
        }
      },
      error: (err) => {
        console.error("The review does not exists.", err);
      }
    })
  }


}