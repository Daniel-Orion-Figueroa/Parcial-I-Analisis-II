import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loan-card',
  imports: [CommonModule],
  templateUrl: './loan-card.html',
  styleUrl: './loan-card.css',
  standalone: true
})
export class LoanCard {
  @Input() loan: any;
  @Input() compact: boolean = false;
  @Input() showActions: boolean = true;
  
  @Output() renew = new EventEmitter<any>();
  @Output() returnBook = new EventEmitter<any>();
  @Output() viewDetails = new EventEmitter<any>();

  getStatusClass(): string {
    switch (this.loan?.status) {
      case 'active':
        return 'status-active';
      case 'overdue':
        return 'status-overdue';
      case 'returned':
        return 'status-returned';
      case 'renewed':
        return 'status-renewed';
      default:
        return 'status-unknown';
    }
  }

  getStatusText(): string {
    switch (this.loan?.status) {
      case 'active':
        return 'Activo';
      case 'overdue':
        return 'Vencido';
      case 'returned':
        return 'Devuelto';
      case 'renewed':
        return 'Renovado';
      default:
        return 'Desconocido';
    }
  }

  getStatusIcon(): string {
    switch (this.loan?.status) {
      case 'active':
        return '📚';
      case 'overdue':
        return '⚠️';
      case 'returned':
        return '✅';
      case 'renewed':
        return '🔄';
      default:
        return '❓';
    }
  }

  getDaysRemaining(): number {
    if (!this.loan?.dueDate) return 0;
    
    const dueDate = new Date(this.loan.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
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
    return this.loan?.status === 'active' && 
           this.getDaysRemaining() <= 3 && 
           this.loan.renewals < 3;
  }

  canReturn(): boolean {
    return this.loan?.status === 'active' || this.loan?.status === 'overdue';
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
