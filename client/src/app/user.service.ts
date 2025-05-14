import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {User} from './user'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url = 'http://localhost:3000';
  // user$ = signal<User|null>(null);
  user$ : WritableSignal<User | null> = signal(null);

  constructor(private httpClient: HttpClient) { }

  getUser(email:string, password:string){
    // Encrypt the password and valid user using email and encryped password.
    return this.httpClient.post<User>(`${this.url}/user`, {email, password});
  }

  createUser(email: string, firstname: string, 
    lastname:string, password:string){
      return this.httpClient.post<User>(`${this.url}/user/create`, {email, firstname, lastname, password});
  }

  // Check if the user loggedin by checking if the user$ is null.
  isUserLoggedIn(): boolean{
    return this.user$ !== null;
  }
}
