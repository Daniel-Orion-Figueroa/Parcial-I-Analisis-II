import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reservation } from '../../../../core/interfaces/reservation';

@Component({
  selector: 'app-reservation-card',
  imports: [CommonModule],
  templateUrl: './reservation-card.html',
  styleUrl: './reservation-card.css',
  standalone: true
})
export class ReservationCard {
  @Input() reservation!: Reservation;
  @Input() compact = false;
  
  @Output() cancel = new EventEmitter<Reservation>();
  @Output() borrow = new EventEmitter<Reservation>();
  @Output() viewDetails = new EventEmitter<Reservation>();

  onCancel(): void {
    this.cancel.emit(this.reservation);
  }

  onBorrow(): void {
    this.borrow.emit(this.reservation);
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.reservation);
  }

  getStatusClass(): string {
    switch (this.reservation.status) {
      case 'ACTIVE':
        return 'status-active';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusText(): string {
    switch (this.reservation.status) {
      case 'ACTIVE':
        return '📋 Activa';
      case 'COMPLETED':
        return '✅ Completada';
      case 'CANCELLED':
        return '❌ Cancelada';
      default:
        return this.reservation.status;
    }
  }

  getStatusIcon(): string {
    switch (this.reservation.status) {
      case 'ACTIVE':
        return '⏳';
      case 'COMPLETED':
        return '✅';
      case 'CANCELLED':
        return '❌';
      default:
        return '📋';
    }
  }

  getCardClass(): string {
    const classes = ['reservation-card'];
    if (this.compact) classes.push('compact');
    if (this.reservation.status) classes.push(this.getStatusClass());
    return classes.join(' ');
  }
}
