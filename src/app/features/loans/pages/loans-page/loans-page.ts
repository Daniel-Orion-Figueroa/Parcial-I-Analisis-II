import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { LoanCard } from '../../components/loan-card/loan-card';
import { Loan, LoanStatus } from '../../../../core/interfaces/loan';
import { LoanService } from '../../../../core/services/loan.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-loans-page',
  imports: [CommonModule, FormsModule, SearchBarComponent, EmptyState, ConfirmDialog, LoanCard],
  templateUrl: './loans-page.html',
  styleUrl: './loans-page.css',
  standalone: true
})
export class LoansPage implements OnInit {
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

  constructor(
    private loanService: LoanService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserLoans();
  }

  private loadUserLoans(): void {
    this.isLoading.set(true);
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.isLoading.set(false);
      return;
    }

    this.loanService.getLoansByUser(currentUser.id).subscribe({
      next: (loans) => {
        console.log('LoansPage: Préstamos cargados:', loans);
        this.loans.set(loans);
        this.filteredLoans.set(loans);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('LoansPage: Error cargando préstamos:', error);
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
        loan.book.author.toLowerCase().includes(searchData.term.toLowerCase())
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

  // Método para devolver libro
  onReturnBook(loan: Loan): void {
    if (loan.status === LoanStatus.RETURNED) {
      alert('Este préstamo ya ha sido devuelto');
      return;
    }
    
    this.selectedLoan.set(loan);
    this.confirmMessage.set(`¿Estás seguro de devolver "${loan.book.title}"?`);
    this.isConfirmDialogVisible.set(true);
  }

  // Métodos para el modal de confirmación
  onConfirmDialogClose(): void {
    this.isConfirmDialogVisible.set(false);
    this.selectedLoan.set(null);
    this.confirmMessage.set('');
  }

  onConfirmDialogConfirm(): void {
    const loan = this.selectedLoan();
    if (!loan) return;

    this.isProcessing.set(true);

    this.loanService.returnLoan(loan.id).subscribe({
      next: (returnedLoan) => {
        console.log('LoansPage: ✅ Libro devuelto:', returnedLoan);
        this.isProcessing.set(false);
        this.onConfirmDialogClose();
        this.loadUserLoans(); // Recargar para actualizar la lista
      },
      error: (error) => {
        console.error('LoansPage: ❌ Error al devolver libro:', error);
        this.isProcessing.set(false);
        const message = error.error?.message || error.error?.error || error.message || 'Error desconocido';
        alert(`❌ Error al devolver libro: ${message}`);
      }
    });
  }

  refreshLoans(): void {
    console.log('🔄 Refrescando préstamos...');
    this.loadUserLoans();
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

  // Métodos de conteo para estadísticas
  getActiveLoansCount(): number {
    return this.loans().filter(loan => loan.status === LoanStatus.ACTIVE).length;
  }

  getOverdueLoansCount(): number {
    return this.loans().filter(loan => loan.status === LoanStatus.LATE || this.isOverdue(loan)).length;
  }

  getReturnedLoansCount(): number {
    return this.loans().filter(loan => loan.status === LoanStatus.RETURNED).length;
  }

  // Eventos del LoanCard
  onRenewLoan(loan: Loan): void {
    console.log('Renovando préstamo:', loan.book.title);
    alert('Función de renovación en desarrollo.');
  }

  onViewLoanDetails(loan: Loan): void {
    console.log('Ver detalles del préstamo:', loan.book.title);
    alert('Función de detalles en desarrollo.');
  }
}
