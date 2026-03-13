import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Loan } from '../../../../core/interfaces/loan';
import { LoanStatus } from '../../../../core/interfaces/loan';
import { LoanService } from '../../../../core/services/loan.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ReservationService } from '../../../../core/services/reservation.service';

@Component({
  selector: 'app-loans-management',
  imports: [CommonModule, FormsModule, SearchBarComponent, EmptyState, ConfirmDialog],
  templateUrl: './loans-management.html',
  styleUrls: ['./loans-management.css'],
  standalone: true
})
export class LoansManagementComponent implements OnInit {
  loans = signal<Loan[]>([]);
  filteredLoans = signal<Loan[]>([]);
  searchTerm = '';
  statusFilter = 'all';
  isLoading = signal(false);
  
  // Propiedades para el modal de confirmación
  selectedLoan = signal<Loan | null>(null);
  isConfirmDialogVisible = signal(false);
  isProcessing = signal(false);
  confirmMessage = signal('');
  confirmAction = signal<'return' | 'delete' | 'extend'>('return');

  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.loadLoans();
  }

  private loadLoans(): void {
    this.isLoading.set(true);
    
    this.loanService.getAllLoans().subscribe({
      next: (loans) => {
        console.log('LoansManagement: Préstamos cargados:', loans);
        this.loans.set(loans);
        this.filteredLoans.set(loans);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('LoansManagement: Error cargando préstamos:', error);
        this.isLoading.set(false);
        this.loans.set([]);
        this.filteredLoans.set([]);
      }
    });
  }

  onSearch(searchData: { term: string; filter?: string }): void {
    const loans = this.loans();
    let filtered = loans;

    if (searchData.term) {
      filtered = filtered.filter(loan =>
        loan.book.title.toLowerCase().includes(searchData.term.toLowerCase()) ||
        loan.book.author.toLowerCase().includes(searchData.term.toLowerCase()) ||
        loan.user.name.toLowerCase().includes(searchData.term.toLowerCase())
      );
    }

    if (searchData.filter && searchData.filter !== 'all') {
      filtered = filtered.filter(loan => loan.status === searchData.filter);
    }

    this.filteredLoans.set(filtered);
  }

  onFilter(): void {
    this.onSearch({ term: this.searchTerm, filter: this.statusFilter === 'all' ? undefined : this.statusFilter });
  }

  // Métodos para gestionar préstamos
  onReturnLoan(loan: Loan): void {
    if (loan.status === LoanStatus.RETURNED) {
      this.showConfirmDialog('Este préstamo ya ha sido devuelto', 'info', 'return');
      return;
    }
    
    this.selectedLoan.set(loan);
    this.confirmMessage.set(`¿Estás seguro de registrar la devolución de "${loan.book.title}" por ${loan.user.name}?`);
    this.confirmAction.set('return');
    this.isConfirmDialogVisible.set(true);
  }

  onExtendLoan(loan: Loan): void {
    if (loan.status === LoanStatus.RETURNED) {
      this.showConfirmDialog('No se puede extender un préstamo ya devuelto', 'info', 'extend');
      return;
    }
    
    this.selectedLoan.set(loan);
    this.confirmMessage.set(`¿Estás seguro de extender el plazo de "${loan.book.title}" para ${loan.user.name}?`);
    this.confirmAction.set('extend');
    this.isConfirmDialogVisible.set(true);
  }

  onDeleteLoan(loan: Loan): void {
    this.selectedLoan.set(loan);
    this.confirmMessage.set(`¿Estás seguro de eliminar el préstamo de "${loan.book.title}"? Esta acción no se puede deshacer.`);
    this.confirmAction.set('delete');
    this.isConfirmDialogVisible.set(true);
  }

  // Métodos para el modal de confirmación
  showConfirmDialog(message: string, type: 'danger' | 'warning' | 'info' | 'success', action: 'return' | 'delete' | 'extend'): void {
    this.confirmMessage.set(message);
    this.confirmAction.set(action);
    this.isConfirmDialogVisible.set(true);
  }

  onConfirmDialogClose(): void {
    this.isConfirmDialogVisible.set(false);
    this.selectedLoan.set(null);
    this.confirmMessage.set('');
  }

  onConfirmDialogConfirm(): void {
    const loan = this.selectedLoan();
    if (!loan) return;

    this.isProcessing.set(true);

    switch (this.confirmAction()) {
      case 'return':
        this.processReturn(loan);
        break;
      case 'extend':
        this.processExtend(loan);
        break;
      case 'delete':
        this.processDelete(loan);
        break;
    }
  }

  private processReturn(loan: Loan): void {
    this.loanService.returnLoan(loan.id).subscribe({
      next: (returnedLoan) => {
        console.log('LoansManagement: ✅ Préstamo devuelto:', returnedLoan);
        this.isProcessing.set(false);
        this.onConfirmDialogClose();
        this.loadLoans(); // Recargar para actualizar la lista
      },
      error: (error) => {
        console.error('LoansManagement: ❌ Error al devolver préstamo:', error);
        this.isProcessing.set(false);
        const message = error.error?.message || error.error?.error || error.message || 'Error desconocido';
        alert(`❌ Error al devolver préstamo: ${message}`);
      }
    });
  }

  private processExtend(loan: Loan): void {
    // Extender préstamo por 7 días adicionales (usando loanDate como base)
    const newLoanDate = new Date(loan.loanDate);
    newLoanDate.setDate(newLoanDate.getDate() + 7);

    this.loanService.updateLoan(loan.id, { loanDate: newLoanDate.toISOString().split('T')[0] }).subscribe({
      next: (updatedLoan) => {
        console.log('LoansManagement: ✅ Préstamo extendido:', updatedLoan);
        this.isProcessing.set(false);
        this.onConfirmDialogClose();
        this.loadLoans();
      },
      error: (error) => {
        console.error('LoansManagement: ❌ Error al extender préstamo:', error);
        this.isProcessing.set(false);
        const message = error.error?.message || error.error?.error || error.message || 'Error desconocido';
        alert(`❌ Error al extender préstamo: ${message}`);
      }
    });
  }

  private processDelete(loan: Loan): void {
    this.loanService.deleteLoan(loan.id).subscribe({
      next: () => {
        console.log('LoansManagement: ✅ Préstamo eliminado:', loan.id);
        this.isProcessing.set(false);
        this.onConfirmDialogClose();
        this.loadLoans();
      },
      error: (error) => {
        console.error('LoansManagement: ❌ Error al eliminar préstamo:', error);
        this.isProcessing.set(false);
        const message = error.error?.message || error.error?.error || error.message || 'Error desconocido';
        alert(`❌ Error al eliminar préstamo: ${message}`);
      }
    });
  }

  refreshLoans(): void {
    console.log('🔄 Refrescando préstamos...');
    this.loadLoans();
  }

  // Métodos de utilidad
  getStatusClass(status: LoanStatus): string {
    switch (status) {
      case LoanStatus.ACTIVE:
        return 'status-active';
      case LoanStatus.RETURNED:
        return 'status-returned';
      case LoanStatus.LATE:
        return 'status-overdue';
      default:
        return '';
    }
  }

  getStatusText(status: LoanStatus): string {
    switch (status) {
      case LoanStatus.ACTIVE:
        return '📚 Activo';
      case LoanStatus.RETURNED:
        return '✅ Devuelto';
      case LoanStatus.LATE:
        return '⚠️ Vencido';
      default:
        return status;
    }
  }

  isOverdue(loan: Loan): boolean {
    if (loan.status === LoanStatus.RETURNED) return false;
    // Usar loanDate como fecha de vencimiento (asumimos 7 días desde loanDate)
    const dueDate = new Date(loan.loanDate);
    dueDate.setDate(dueDate.getDate() + 7);
    return dueDate < new Date();
  }

  getDaysRemaining(loan: Loan): string {
    if (loan.status === LoanStatus.RETURNED) return 'Devuelto';
    
    // Calcular fecha de vencimiento como 7 días desde loanDate
    const dueDate = new Date(loan.loanDate);
    dueDate.setDate(dueDate.getDate() + 7);
    
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} días vencido`;
    } else if (diffDays === 0) {
      return 'Vence hoy';
    } else if (diffDays === 1) {
      return 'Vence mañana';
    } else {
      return `${diffDays} días restantes`;
    }
  }
}
