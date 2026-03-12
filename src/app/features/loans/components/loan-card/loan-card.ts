import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loan, LoanStatus } from '../../../../core/interfaces/loan';

@Component({
  selector: 'app-loan-card',
  imports: [CommonModule],
  templateUrl: './loan-card.html',
  styleUrl: './loan-card.css',
  standalone: true
})
export class LoanCard {
  @Input() loan!: Loan;
  @Input() compact: boolean = false;
  @Input() showActions: boolean = true;
  
  @Output() renew = new EventEmitter<Loan>();
  @Output() returnBook = new EventEmitter<Loan>();
  @Output() viewDetails = new EventEmitter<Loan>();

  getStatusClass(): string {
    switch (this.loan?.status) {
      case LoanStatus.ACTIVE:
        return 'status-active';
      case LoanStatus.LATE:
        return 'status-overdue';
      case LoanStatus.RETURNED:
        return 'status-returned';
      default:
        return 'status-unknown';
    }
  }

  getStatusText(): string {
    switch (this.loan?.status) {
      case LoanStatus.ACTIVE:
        return 'Activo';
      case LoanStatus.LATE:
        return 'Vencido';
      case LoanStatus.RETURNED:
        return 'Devuelto';
      default:
        return 'Desconocido';
    }
  }

  getStatusIcon(): string {
    switch (this.loan?.status) {
      case LoanStatus.ACTIVE:
        return '📚';
      case LoanStatus.LATE:
        return '⚠️';
      case LoanStatus.RETURNED:
        return '✅';
      default:
        return '❓';
    }
  }

  getDaysRemaining(): number {
    if (!this.loan?.returnDate) return 0;
    
    const returnDate = new Date(this.loan.returnDate);
    const today = new Date();
    const diffTime = returnDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  getDaysText(): string {
    const days = this.getDaysRemaining();
    
    if (days > 0) {
      return `${days} día${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`;
    } else if (days === 0) {
      return 'Vence hoy';
    } else {
      return `${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''} vencido${Math.abs(days) !== 1 ? 's' : ''}`;
    }
  }

  isOverdue(): boolean {
    return this.getDaysRemaining() < 0;
  }

  canRenew(): boolean {
    return this.loan?.status === LoanStatus.ACTIVE && 
           this.getDaysRemaining() <= 3;
  }

  canReturn(): boolean {
    return this.loan?.status === LoanStatus.ACTIVE || this.loan?.status === LoanStatus.LATE;
  }

  onRenew(): void {
    this.renew.emit(this.loan);
  }

  onReturn(): void {
    this.returnBook.emit(this.loan);
  }

  onViewDetails(): void {
    this.viewDetails.emit(this.loan);
  }
}
