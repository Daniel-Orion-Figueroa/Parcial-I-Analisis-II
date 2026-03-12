import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { LoanCard } from '../../components/loan-card/loan-card';
import { Loan, LoanStatus } from '../../../../core/interfaces/loan';
import { Book } from '../../../../core/interfaces/book';
import { User } from '../../../../core/interfaces/user';
import { LoanService } from '../../../../core/services/loan.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-loans-page',
  imports: [CommonModule, FormsModule, SearchBarComponent, EmptyState, LoanCard],
  templateUrl: './loans-page.html',
  styleUrl: './loans-page.css',
  standalone: true
})
export class LoansPage implements OnInit {
  loans = signal<Loan[]>([]);
  filteredLoans = signal<Loan[]>([]);
  searchTerm = signal('');
  isLoading = signal(false);

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

    // CONSUMIR API REAL CON LOAN SERVICE
    this.loanService.getLoansByUser(currentUser.id).subscribe({
      next: (loans) => {
        this.loans.set(loans);
        this.filteredLoans.set(loans);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading loans:', error);
        this.isLoading.set(false);
        alert('Error loading loans from API. Please check backend connection.');
      }
    });
  }

  onSearch(searchData: { term: string; filter?: string }): void {
    this.searchTerm.set(searchData.term);
    this.filterLoans();
  }

  private filterLoans(): void {
    const term = this.searchTerm().toLowerCase();
    const allLoans = this.loans();
    
    if (!term) {
      this.filteredLoans.set(allLoans);
      return;
    }

    const filtered = allLoans.filter(loan => 
      loan.book.title.toLowerCase().includes(term) ||
      loan.book.author.toLowerCase().includes(term) ||
      loan.status.toLowerCase().includes(term)
    );

    this.filteredLoans.set(filtered);
  }

  onRenewLoan(loan: Loan): void {
    // TODO: Implementar renovación con backend
    console.log('Renovando préstamo:', loan);
    alert('Préstamo renovado exitosamente');
  }

  onReturnLoan(loan: Loan): void {
    // TODO: Implementar devolución con backend
    console.log('Devolviendo préstamo:', loan);
    alert('Libro devuelto exitosamente');
  }

  onViewLoanDetails(loan: Loan): void {
    // TODO: Implementar vista de detalles
    console.log('Ver detalles del préstamo:', loan);
    alert(`Detalles del préstamo: ${loan.book.title}`);
  }

  getActiveLoansCount(): number {
    return this.filteredLoans().filter(loan => loan.status === LoanStatus.ACTIVE).length;
  }

  getOverdueLoansCount(): number {
    return this.filteredLoans().filter(loan => loan.status === LoanStatus.LATE).length;
  }

  getReturnedLoansCount(): number {
    return this.filteredLoans().filter(loan => loan.status === LoanStatus.RETURNED).length;
  }
}
