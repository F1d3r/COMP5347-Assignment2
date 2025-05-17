import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';


import { jwtDecode } from 'jwt-decode';

import {User} from './user'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url = 'http://localhost:3000';
  // Using the signal to track the login state of the user.
  // Initialized as null as guest.
  user$ : WritableSignal<User | null> = signal(null);
  homeState$: WritableSignal<'home'|'search'|'item'> = signal('home');

  constructor(private httpClient: HttpClient) { }

  getUser(email:string, password:string){
    // Encrypt the password and valid user using email and encryped password.
    return this.httpClient.post<User>(`${this.url}/user`, {email, password});
  }


  logOut(){
    console.log("Logging out.");
    this.httpClient.post(`${this.url}/user/logout`, {userId: this.user$()?._id}, { observe: 'response' }).subscribe(response =>{
      if(response.status == 200){
        console.log('logout success.')
        this.user$.set(null);
      }else{
        console.error("Server error");
      }
    })
  }


  createUser(email: string, firstname: string, 
    lastname:string, password:string){
      return this.httpClient.post<User>(`${this.url}/user/create`, {email, firstname, lastname, password});
  }


  // Check if the user loggedin by checking if the user$ is null.
  isUserLoggedIn(): boolean{
    return this.user$ !== null;
  }


  updateUser(email: string, newEmail: string, firstname: string, lastname:string){
    // console.log("Old email:",email);
    // console.log("New email:", newEmail);
    // console.log("First name:", firstname)
    // console.log("Last name:", lastname);
    return this.httpClient.post<User>(`${this.url}/user/update`, {email, newEmail, firstname, lastname});
  }


  changeUserPwd(_id: string, newPassword: string){
    return this.httpClient.post<User>(`${this.url}/user/changePassword`, {_id, newPassword});
  }


  resetPassword(email: string|null){
    if(email){
      console.log(email);
      return this.httpClient.post<User>(`${this.url}/user/resetRequest`, {email:email});
    }
    const userId = this.user$()?._id;
    return this.httpClient.post<User>(`${this.url}/user/resetRequest`, {_id:userId});
  }

}
