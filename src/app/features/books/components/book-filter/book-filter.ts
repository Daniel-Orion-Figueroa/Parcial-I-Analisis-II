import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-book-filter',
  imports: [CommonModule, FormsModule],
  templateUrl: './book-filter.html',
  styleUrl: './book-filter.css',
  standalone: true
})
export class BookFilter {
  @Input() categories: string[] = [];
  @Input() selectedCategory: string = '';
  @Input() availabilityFilter: string = '';
  @Input() yearRange: { min: number; max: number } = { min: 1900, max: 2024 };
  @Input() showAdvanced: boolean = false;
  
  @Output() filterChange = new EventEmitter<any>();
  @Output() reset = new EventEmitter<void>();

  internalCategory = '';
  internalAvailability = '';
  internalYearMin = '';
  internalYearMax = '';

  ngOnInit(): void {
    this.internalCategory = this.selectedCategory;
    this.internalAvailability = this.availabilityFilter;
    this.internalYearMin = this.yearRange.min.toString();
    this.internalYearMax = this.yearRange.max.toString();
  }

  onFilterChange(): void {
    const filters = {
      category: this.internalCategory,
      availability: this.internalAvailability,
      yearMin: this.internalYearMin ? parseInt(this.internalYearMin) : null,
      yearMax: this.internalYearMax ? parseInt(this.internalYearMax) : null
    };
    
    this.filterChange.emit(filters);
  }

  onReset(): void {
    this.internalCategory = '';
    this.internalAvailability = '';
    this.internalYearMin = this.yearRange.min.toString();
    this.internalYearMax = this.yearRange.max.toString();
    this.reset.emit();
    this.onFilterChange();
  }

  toggleAdvanced(): void {
    this.showAdvanced = !this.showAdvanced;
  }

  hasActiveFilters(): boolean {
    return !!(this.internalCategory === '' && 
            this.internalAvailability === '' && 
            this.internalYearMin === this.yearRange.min.toString() && 
            this.internalYearMax === this.yearRange.max.toString());
  }
}
