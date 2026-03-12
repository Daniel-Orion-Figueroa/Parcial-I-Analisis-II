import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { LoanCard } from '../../components/loan-card/loan-card';

@Component({
  selector: 'app-loans-page',
  imports: [CommonModule, FormsModule, SearchBarComponent, EmptyState, LoanCard],
  templateUrl: './loans-page.html',
  styleUrl: './loans-page.css',
  standalone: true
})
export class LoansPage {
  loans = signal([
    {
      id: 1,
      bookTitle: 'El Principito',
      bookAuthor: 'Antoine de Saint-Exupéry',
      loanDate: '2024-01-15',
      dueDate: '2024-02-15',
      status: 'active',
      renewals: 0
    },
    {
      id: 2,
      bookTitle: 'Cien Años de Soledad',
      bookAuthor: 'Gabriel García Márquez',
      loanDate: '2024-01-05',
      dueDate: '2024-02-05',
      status: 'overdue',
      renewals: 1
    },
    {
      id: 3,
      bookTitle: '1984',
      bookAuthor: 'George Orwell',
      loanDate: '2023-12-20',
      dueDate: '2024-01-20',
      status: 'returned',
      renewals: 2
    },
    {
      id: 4,
      bookTitle: 'Don Quijote de la Mancha',
      bookAuthor: 'Miguel de Cervantes',
      loanDate: '2024-02-01',
      dueDate: '2024-03-01',
      status: 'renewed',
      renewals: 1
    }
  ]);

  filteredLoans = signal([...this.loans()]);
  searchTerm = '';
  statusFilter = 'all';

  onSearch(searchData: { term: string; filter?: string }): void {
    const loans = this.loans();
    let filtered = loans;

    if (searchData.term) {
      filtered = filtered.filter(loan =>
        loan.bookTitle.toLowerCase().includes(searchData.term.toLowerCase()) ||
        loan.bookAuthor.toLowerCase().includes(searchData.term.toLowerCase())
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

  onRenewLoan(loan: any): void {
    console.log('Renovando préstamo:', loan.bookTitle);
    // TODO: Implementar lógica de renovación
    // Actualizar el estado del préstamo
    const updatedLoan = { ...loan, status: 'renewed', renewals: loan.renewals + 1 };
    this.updateLoan(updatedLoan);
  }

  onReturnLoan(loan: any): void {
    console.log('Devolviendo libro:', loan.bookTitle);
    // TODO: Implementar lógica de devolución
    // Actualizar el estado del préstamo
    const updatedLoan = { ...loan, status: 'returned' };
    this.updateLoan(updatedLoan);
  }

  onViewLoanDetails(loan: any): void {
    console.log('Ver detalles del préstamo:', loan.bookTitle);
    // TODO: Implementar navegación a detalles o modal
  }

  private updateLoan(updatedLoan: any): void {
    const currentLoans = this.loans();
    const updatedLoans = currentLoans.map(loan => 
      loan.id === updatedLoan.id ? updatedLoan : loan
    );
    this.loans.set(updatedLoans);
    this.onSearch({ term: this.searchTerm, filter: this.statusFilter === 'all' ? undefined : this.statusFilter });
  }

  getActiveLoansCount(): number {
    return this.loans().filter(loan => loan.status === 'active').length;
  }

  getOverdueLoansCount(): number {
    return this.loans().filter(loan => loan.status === 'overdue').length;
  }

  getReturnedLoansCount(): number {
    return this.loans().filter(loan => loan.status === 'returned').length;
  }
}
