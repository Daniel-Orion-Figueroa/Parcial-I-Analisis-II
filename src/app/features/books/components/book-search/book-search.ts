import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-book-search',
  imports: [CommonModule, FormsModule],
  templateUrl: './book-search.html',
  styleUrl: './book-search.css',
  standalone: true
})
export class BookSearch {
  @Input() placeholder: string = 'Buscar libros...';
  @Input() initialValue: string = '';
  @Input() showFilters: boolean = false;
  @Input() filters: string[] = [];
  @Input() loading: boolean = false;
  @Input() debounceTime: number = 300;
  
  @Output() search = new EventEmitter<{ term: string; filter?: string }>();
  @Output() clear = new EventEmitter<void>();

  searchTerm = '';
  selectedFilter = '';
  private debounceTimer: any;

  ngOnInit(): void {
    this.searchTerm = this.initialValue;
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  onSearchInput(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.performSearch();
    }, this.debounceTime);
  }

  onSearchSubmit(): void {
    this.performSearch();
  }

  onClear(): void {
    this.searchTerm = '';
    this.selectedFilter = '';
    this.clear.emit();
    this.performSearch();
  }

  onFilterChange(): void {
    this.performSearch();
  }

  onKeyup(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearchSubmit();
    }
  }

  private performSearch(): void {
    const searchData = {
      term: this.searchTerm,
      filter: this.selectedFilter || undefined
    };
    this.search.emit(searchData);
  }

  getPlaceholder(): string {
    if (this.selectedFilter) {
      return `Buscar por ${this.selectedFilter}...`;
    }
    return this.placeholder;
  }
}
