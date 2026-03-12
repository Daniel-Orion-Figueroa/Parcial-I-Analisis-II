import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservation-card',
  imports: [CommonModule],
  templateUrl: './reservation-card.html',
  styleUrl: './reservation-card.css',
  standalone: true
})
export class ReservationCard {
  @Input() reservation: any;
  @Input() compact = false;
  
  @Output() cancel = new EventEmitter<any>();
  @Output() borrow = new EventEmitter<any>();
  @Output() viewDetails = new EventEmitter<any>();

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
      case 'active':
        return 'status-active';
      case 'expired':
        return 'status-expired';
      case 'available':
        return 'status-available';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusText(): string {
    switch (this.reservation.status) {
      case 'active':
        return 'En espera';
      case 'expired':
        return 'Expirada';
      case 'available':
        return 'Disponible';
      case 'cancelled':
        return 'Cancelada';
      default:
        return this.reservation.status;
    }
  }

  getStatusIcon(): string {
    switch (this.reservation.status) {
      case 'active':
        return '⏳';
      case 'expired':
        return '⏰';
      case 'available':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '📋';
    }
  }

  getDaysUntilExpiry(): number {
    const expiryDate = new Date(this.reservation.expiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  isExpiringSoon(): boolean {
    const daysUntil = this.getDaysUntilExpiry();
    return daysUntil <= 3 && daysUntil > 0;
  }

  getCardClass(): string {
    const classes = ['reservation-card'];
    if (this.compact) classes.push('compact');
    if (this.reservation.status) classes.push(this.getStatusClass());
    if (this.isExpiringSoon()) classes.push('expiring-soon');
    return classes.join(' ');
  }
}
