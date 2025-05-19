import { catchError } from 'rxjs';
import { WidthType } from './../../../node_modules/get-east-asian-width/index.d';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } 
from '@angular/forms';
import { Router } from '@angular/router';

import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { PhoneListingService } from '../phonelisting.service';
import { UserService } from '../user.service';


@Component({
  selector: 'app-search-form',
  imports: [ReactiveFormsModule, MatSelectModule, CommonModule, MatIconModule],

  styles: `
    form {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 20px;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 0.75rem;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .search-input {
      flex-grow: 2;
      position: relative;
    }
    
    input[type="text"] {
      width: 100%;
      padding: 0.75rem;
      padding-left: 2.5rem;
      box-sizing: border-box;
      border: 1px solid #e1e5e9;
      border-radius: 4px;
      font-size: 1rem;
      transition: all 0.3s;
    }
    
    input[type="text"]:focus {
      border-color: #3498db;
      outline: none;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
    
    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #7f8c8d;
    }

    #selectBrand {
      display: flex;
      flex-direction: row;
      flex-grow: 1;
      min-width: 150px;
    }

    mat-select {
      width: 150px;
      background-color: #f5f7fa;
      padding: 0.5rem;
      border-radius: 4px;
      border: 1px solid #e1e5e9;
    }

    .mat-select-trigger {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .fixed-width-panel {
      min-width: 150px !important;
      max-width: 150px !important;
    }
    
    button {
      flex-grow: 1;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
      background-color: #3498db;
      color: white;
    }
    
    button:hover {
      background-color: #2980b9;
      transform: translateY(-2px);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    button:disabled {
      background-color: #bdc3c7;
      cursor: not-allowed;
      transform: none;
    }

    /* The style applied when the page width is less than 768. */
    @media (max-width: 768px) {
      form {
        flex-direction: column;
        gap: 1rem;
        width: 100%;
      }
      
      #selectBrand {
        width: 100%;
      }
      
      mat-select {
        width: 100%;
      }
      
      button {
        width: 100%;
      }
      
      .search-input {
        width: 100%;
      }

      #searchInput{
        width: 100%;
      }
    }
  `,

  template: `
    <form [formGroup]="searchForm" (ngSubmit)="searchPhoneListings()">
      <div class="search-input">
        <mat-icon class="search-icon">search</mat-icon>
        <input 
          id="searchInput"
          type="text" 
          formControlName="keyword" 
          name="keyword" 
          placeholder="Search phones"
        />
      </div>

      <div id='selectBrand' *ngIf="this.pageState() == 'search'">
        <mat-select 
          formControlName="brand" 
          placeholder="Select Brand" 
          panelClass="fixed-width-panel"
        >
          <mat-option *ngFor='let brand of phonelistingBrands' [value]="brand">
            {{brand}}
          </mat-option>
        </mat-select>
      </div>

      <button type="submit" [disabled]="!searchForm.valid">
        <mat-icon>search</mat-icon> Search
      </button>
    </form>
  `
})
export class SearchFormComponent implements OnInit {
  searchForm = new FormGroup({
    keyword: new FormControl(''),
    brand: new FormControl('All'),
  });
  
  phonelistingBrands:string[] = [];
  pageState = inject(UserService).homeState$;


  constructor(
    private phonelistingService: PhoneListingService, 
    private router: Router, 
    private userService: UserService
  ){}

  ngOnInit(){
    // Get all brand info through the service.
    this.phonelistingService.getAllBrand().subscribe(
      (data) => {
        // this.phonelistingBrands = data;
        // this.phonelistingBrands.push('All');
        this.phonelistingBrands = ['All', ...data];
      },
      (error)=>{
        console.log(error);
      }
    )
  }


  sanitizeInput(inputText: string): string {
    return inputText.replace(/[$\{\}\[\]\(\)\*\+\?\|\^\.\-]/g, '\\$&');
  }

  // On submit of the form.
  searchPhoneListings(){
    let keyword = this.searchForm.value.keyword ?? '';
    const brand = this.searchForm.value.brand ?? 'All';

    // Handle input. Replace '(' and ')' to escape character.
    keyword = this.sanitizeInput(keyword);
    
    console.log("Got keyword:", keyword);
    console.log("Got brand:", brand);


    this.phonelistingService.getPhoneListings(keyword, brand).subscribe(phonelistings =>{
      this.userService.homeState$.set('search');
      if(!phonelistings || phonelistings.length === 0){
        // Not found result, set saerched result to empty.
        alert("No result found");
        this.phonelistingService.searched$.set([]);
        // this.userService.homeState$.set('home');
      }else{
        // Result found.
        console.log("Found Result");
        this.phonelistingService.searched$.set(phonelistings);
        console.log(phonelistings);
        this.router.navigate(['']);
        // Set the home state to search.
        this.userService.homeState$.set('search');
      }
    })
  }
}