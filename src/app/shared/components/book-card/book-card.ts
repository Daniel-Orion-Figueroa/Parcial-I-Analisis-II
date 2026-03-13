import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

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
  @Input() showEdit = false;  // Controlar si mostrar botón editar
  @Input() showDelete = false; // Controlar si mostrar botón eliminar
  
  @Output() reserve = new EventEmitter<any>();
  @Output() viewDetails = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  constructor(private authService: AuthService) {}

  // Verificar si el usuario actual es admin
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

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
    const available = this.book.availableQuantity;
    if (available > 0) {
      return 'available-green'; // Verde cuando hay disponibilidad
    } else if (available === 0) {
      return 'unavailable-red'; // Rojo cuando no hay disponibilidad
    } else {
      return 'unknown';
    }
  }

  getAvailabilityText(): string {
    const available = this.book.availableQuantity;
    const total = this.book.totalQuantity;
    
    if (available > 0) {
      return `Disponible (${available}/${total})`;
    } else if (available === 0) {
      return 'Prestado';
    } else {
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
