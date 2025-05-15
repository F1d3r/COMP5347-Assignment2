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

  styles: 
  `
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
    .mat-select-value {
      max-width: max-content !important;
    }
  `,

  template: `
    <form [formGroup]="searchForm" (ngSubmit)="searchPhones()">
      <div>
        <label>Keyword
          <input type="keyword" formControlName="keyword" name="keyword"/>
        </label>
      </div>

      <div id='selectBrand'>
        <label>Select Brand</label>
        <mat-select formControlName="brand" placeholder="Select Brand">
            <mat-option *ngFor='let brand of phoneBrands' [value]="brand">
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
    keyword: new FormControl('', [Validators.required]),
    brand: new FormControl('', Validators.required),
  });

  phoneBrands:string[] = [];

  constructor(private phoneService:PhoneService, private router:Router){}

  ngOnInit(){
    this.phoneService.getAllBrand().subscribe(
      (data) => {
        this.phoneBrands = data;
        this.phoneBrands.push('All');
      },
      (error)=>{
        console.log(error);
      }
    )
  }


  searchPhones(){
    const keyword = this.searchForm.value.keyword ?? '';
    const brand = this.searchForm.value.brand ?? '';
    console.log("Got keyword:", keyword);
    console.log("Got brand:", brand);

    this.phoneService.getPhones(keyword, brand).subscribe(phones =>{
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
}
