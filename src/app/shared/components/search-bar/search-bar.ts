import { Component, EventEmitter, Output } from '@angular/core';
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
  @Output() search = new EventEmitter<string>();
  
  searchTerm = '';
  
  onSearch(): void {
    this.search.emit(this.searchTerm);
  }
  
  onKeyup(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }
}
