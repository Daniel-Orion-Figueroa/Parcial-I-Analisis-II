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

    // Datos mock que coinciden con el backend
    const mockLoans: Loan[] = [
      {
        id: 1,
        user: currentUser,
        book: {
          id: 1,
          title: 'El Principito',
          author: 'Antoine de Saint-Exupéry',
          editorial: 'Santillana',
          publicationYear: 1943,
          isbn: '978-3-16-148410-0',
          category: 'Ficción',
          totalQuantity: 5,
          availableQuantity: 3,
          description: 'Un clásico de la literatura universal',
          imageUrl: ''
        },
        loanDate: '2024-01-15',
        returnDate: '2024-02-15',
        status: LoanStatus.ACTIVE
      },
      {
        id: 2,
        user: currentUser,
        book: {
          id: 2,
          title: 'Cien Años de Soledad',
          author: 'Gabriel García Márquez',
          editorial: 'Oveja Negra',
          publicationYear: 1967,
          isbn: '978-0-06-088328-7',
          category: 'Realismo mágico',
          totalQuantity: 3,
          availableQuantity: 1,
          description: 'Obra maestra del realismo mágico',
          imageUrl: ''
        },
        loanDate: '2024-01-05',
        returnDate: '2024-02-05',
        status: LoanStatus.LATE
      },
      {
        id: 3,
        user: currentUser,
        book: {
          id: 3,
          title: '1984',
          author: 'George Orwell',
          editorial: 'Seix Barral',
          publicationYear: 1949,
          isbn: '978-0-452-28423-4',
          category: 'Ciencia ficción',
          totalQuantity: 4,
          availableQuantity: 2,
          description: 'Distopía clásica de Orwell',
          imageUrl: ''
        },
        loanDate: '2023-12-20',
        returnDate: '2024-01-20',
        status: LoanStatus.RETURNED
      }
    ];

    this.loans.set(mockLoans);
    this.filteredLoans.set(mockLoans);
    this.isLoading.set(false);
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
