import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-card',
  imports: [CommonModule],
  templateUrl: './book-card.html',
  styleUrl: './book-card.css',
  standalone: true
})
export class BookCardComponent {
  @Input() book: any;
  @Input() showActions = true;
  @Input() compact = false;
  
  @Output() reserve = new EventEmitter<any>();
  @Output() viewDetails = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  onReserve(): void {
    this.reserve.emit(this.book);
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.book);
  }

  onEdit(): void {
    this.edit.emit(this.book);
  }

  onDelete(): void {
    this.delete.emit(this.book);
  }

  getAvailabilityClass(): string {
    switch (this.book.availability) {
      case 'available':
        return 'available';
      case 'borrowed':
        return 'borrowed';
      case 'reserved':
        return 'reserved';
      default:
        return 'unknown';
    }
  }

  getAvailabilityText(): string {
    switch (this.book.availability) {
      case 'available':
        return 'Disponible';
      case 'borrowed':
        return 'Prestado';
      case 'reserved':
        return 'Reservado';
      default:
        return 'Desconocido';
    }
  }

  getCardClass(): string {
    const classes = ['book-card'];
    if (this.compact) classes.push('compact');
    if (this.book.availability) classes.push(this.getAvailabilityClass());
    return classes.join(' ');
  }
}
