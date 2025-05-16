import { HomepageComponent } from './../homepage/homepage.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } 
from '@angular/forms';
import { Router } from '@angular/router';

import { MatSelectModule } from '@angular/material/select';

import { PhoneService } from '../phone.service';

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

    #selectBrand mat-select {
      width: 200px;
    }
    
    #selectBrand .mat-select-value {
      min-width: 200px;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,

  template: `
    <form [formGroup]="searchForm" (ngSubmit)="searchPhones()">
      <div id='selectBrand' *ngIf="isSearchMode">
        <mat-select formControlName="brand">
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

  constructor(private phoneService:PhoneService, 
              private router:Router,
              private homepageComponent:HomepageComponent
            ){}

  ngOnInit(){
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


  searchPhones(){
    const keyword = this.searchForm.value.keyword ?? '';
    const brand = this.searchForm.value.brand ?? 'All brands';
    console.log("Got keyword:", keyword);
    console.log("Got brand:", brand);

    this.phoneService.getPhones(keyword, brand).subscribe(phones =>{
      this.homepageComponent.pageState.set('search');
      if(!phones || Object.keys(phones).length === 0){
        console.log("No result found");
        this.phoneService.searched$.set([]);
        console.log(phones);
      }else{
        console.log("Found Result");
        this.phoneService.searched$.set(phones);
        console.log(phones);
        this.router.navigate(['']);
      }
    })
  }


  // return whether it is search state
  get isSearchMode(): boolean {
    return this.homepageComponent.pageState() === 'search';
  }
}
