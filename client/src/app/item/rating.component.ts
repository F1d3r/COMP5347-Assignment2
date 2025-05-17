import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-rating',
  imports: [MatIcon, CommonModule],
  template: `
    <div class="rating">
      <mat-icon *ngFor="let star of stars; let i = index"
                (click)="setRating(i + 1)"
                [ngClass]="{'filled': i < rating}">
        star
      </mat-icon>
    </div>
  `,
  styles: [`
    .rating {
      display: flex;
      gap: 5px;
      cursor: pointer;
    }
    mat-icon {
      font-size: 24px;
      color: gray;
    }
    .filled {
      color: gold;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true
    }
  ]
})
// Implements a ControlValueAccessor to adapt the formGroup.
export class RatingComponent implements ControlValueAccessor {
  @Input() rating = 0;
  stars = Array(5).fill(0);

  private onChange = (rating: number) => {};
  private onTouched = () => {};

  setRating(value: number) {
    this.rating = value;
    this.onChange(value);
    this.onTouched();
  }

  writeValue(value: number): void {
    this.rating = value || 0;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}