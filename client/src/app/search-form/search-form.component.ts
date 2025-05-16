import { WidthType } from './../../../node_modules/get-east-asian-width/index.d';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } 
from '@angular/forms';
import { Router } from '@angular/router';

import { MatSelectModule } from '@angular/material/select';

import { PhoneService } from '../phone.service';
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
    <form [formGroup]="searchForm" (ngSubmit)="searchPhones()">
      <div>
        <input type="keyword" formControlName="keyword" name="keyword" placeholder="Search here"/>
      </div>

      <div id='selectBrand' *ngIf="this.pageState() == 'search'">
        <mat-select formControlName="brand" placeholder="Select Brand" panelClass="fixed-width-panel">
            <mat-option *ngFor='let brand of phoneBrands' [value]="brand">
              {{brand}}
            </mat-option>
        </mat-select>
      </div>
      
      <div>
        <input type="keyword" formControlName="keyword" name="keyword" placeholder="Search phone title"/>
      </div>

      <div>
        <button type="submit" [disabled]="!searchForm.valid">Search</button>
      </div>

    </form>
  `
})
export class SearchFormComponent implements OnInit {
  searchForm = new FormGroup({
    // keyword: new FormControl('', [Validators.required]),
    // brand: new FormControl('', Validators.required),
    keyword: new FormControl(''),
    brand: new FormControl('All brands'),
  });
  phoneBrands:string[] = [];
  pageState = inject(UserService).homeState$;


  constructor(
    private phoneService: PhoneService, 
    private router: Router, 
    private userService: UserService
  ){}

  ngOnInit(){
    // Get all brand info through the service.
    this.phoneService.getAllBrand().subscribe(
      (data) => {
        // this.phoneBrands = data;
        // this.phoneBrands.push('All');
        this.phoneBrands = ['All brands', ...data];
      },
      (error)=>{
        console.log(error);
      }
    )
  }

  // On submit of the form.
  searchPhones(){
    const keyword = this.searchForm.value.keyword ?? '';
    const brand = this.searchForm.value.brand ?? 'All brands';
    console.log("Got keyword:", keyword);
    console.log("Got brand:", brand);

    this.phoneService.getPhones(keyword, brand).subscribe(phones =>{
      this.userService.homeState$.set('search');
      if(!phones || Object.keys(phones).length === 0){
        // Not found result, set saerched result to empty.
        console.log("No result found");
        this.phoneService.searched$.set([]);
        console.log(phones);
      }else{
        // Result found.
        console.log("Found Result");
        this.phoneService.searched$.set(phones);
        console.log(phones);
        this.router.navigate(['']);
        // Set the home state to search.
        this.userService.homeState$.set('search');
      }
    })
  }
}
