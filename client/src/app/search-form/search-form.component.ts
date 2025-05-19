import { catchError } from 'rxjs';
import { WidthType } from './../../../node_modules/get-east-asian-width/index.d';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } 
from '@angular/forms';
import { Router } from '@angular/router';

import { MatSelectModule } from '@angular/material/select';

import { PhoneListingService } from '../phonelisting.service';
import { UserService } from '../user.service';


@Component({
  selector: 'app-search-form',
  imports: [ReactiveFormsModule, MatSelectModule, CommonModule],

  styles: `
    form{
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap:10px;
    }

    #selectBrand{
      display: flex;
      flex-direction: row;
    }

    mat-select {
      width: 150px;
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
  `,

  template: `
    <form [formGroup]="searchForm" (ngSubmit)="searchPhoneListings()">
      <div>
        <input type="text" formControlName="keyword" name="keyword" placeholder="Search here"/>
      </div>

      <div id='selectBrand' *ngIf="this.pageState() == 'search'">
        <mat-select formControlName="brand" placeholder="Select Brand" panelClass="fixed-width-panel">
            <mat-option *ngFor='let brand of phonelistingBrands' [value]="brand">
              {{brand}}
            </mat-option>
        </mat-select>
      </div>

      <div>
        <button type="submit" [disabled]="!searchForm.valid">Search</button>
      </div>

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