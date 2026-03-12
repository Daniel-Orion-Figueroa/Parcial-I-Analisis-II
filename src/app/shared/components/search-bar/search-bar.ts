import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
  standalone: true
})
export class SearchBarComponent {
  @Input() placeholder: string = 'Buscar...';
  @Input() initialValue: string = '';
  @Input() showFilters: boolean = false;
  @Input() filters: string[] = [];
  @Input() selectedFilter: string = '';
  @Input() loading: boolean = false;
  @Input() debounceTime: number = 300;
  
  @Output() search = new EventEmitter<{ term: string; filter?: string }>();
  @Output() clear = new EventEmitter<void>();
  @Output() filterChange = new EventEmitter<string>();
  
  searchTerm = '';
  private debounceTimer: any;
  
  ngOnInit(): void {
    if (this.initialValue) {
      this.searchTerm = this.initialValue;
    }
  }
  
  ngOnDestroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }
  
  onSearch(): void {
    this.search.emit({
      term: this.searchTerm,
      filter: this.selectedFilter || undefined
    });
  }
  
  onKeyup(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
      return;
    }
    
    // Debounce search
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.onSearch();
    }, this.debounceTime);
  }
  
  onClear(): void {
    this.searchTerm = '';
    this.clear.emit();
    this.onSearch();
  }
  
  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.filterChange.emit(filter);
    this.onSearch();
  }
  
  getPlaceholder(): string {
    if (this.selectedFilter) {
      return `Buscar por ${this.selectedFilter}...`;
    }
    return this.placeholder;
  }
}
