import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../../../core/interfaces/book';

@Component({
  selector: 'app-reservation-modal',
  imports: [CommonModule],
  templateUrl: './reservation-modal.html',
  styleUrl: './reservation-modal.css',
  standalone: true
})
export class ReservationModalComponent {
  @Input() book: Book | null = null;
  @Input() isVisible = false;
  @Input() isLoading = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<Book>();

  get todayDate(): string {
    return new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getAvailabilityClass(): string {
    if (!this.book) return '';
    const available = this.book.availableQuantity;
    return available > 0 ? 'available-green' : 'unavailable-red';
  }

  getAvailabilityText(): string {
    if (!this.book) return '';
    const available = this.book.availableQuantity;
    const total = this.book.totalQuantity;
    
    if (available > 0) {
      return `Disponible (${available}/${total})`;
    } else {
      return 'No disponible';
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onConfirm(): void {
    if (this.book && !this.isLoading) {
      this.confirm.emit(this.book);
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
