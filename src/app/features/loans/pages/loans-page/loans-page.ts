import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-loans-page',
  imports: [CommonModule, FormsModule],
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
      bookTitle: '1984',
      bookAuthor: 'George Orwell',
      loanDate: '2024-01-10',
      dueDate: '2024-02-10',
      status: 'overdue',
      renewals: 1
    },
    {
      id: 3,
      bookTitle: 'Cien Años de Soledad',
      bookAuthor: 'Gabriel García Márquez',
      loanDate: '2024-01-20',
      dueDate: '2024-02-20',
      status: 'returned',
      renewals: 0
    }
  ]);

  filteredLoans = signal([...this.loans()]);
  searchTerm = '';
  statusFilter = 'all';

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'overdue':
        return 'status-overdue';
      case 'returned':
        return 'status-returned';
      default:
        return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'overdue':
        return 'Vencido';
      case 'returned':
        return 'Devuelto';
      default:
        return status;
    }
  }

  onFilter(): void {
    const loans = this.loans();
    let filtered = loans;

    if (this.searchTerm) {
      filtered = filtered.filter(loan =>
        loan.bookTitle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        loan.bookAuthor.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(loan => loan.status === this.statusFilter);
    }

    this.filteredLoans.set(filtered);
  }

  onRenewLoan(loan: any): void {
    console.log('Renovando préstamo:', loan.bookTitle);
    // TODO: Implementar lógica de renovación
  }

  onReturnLoan(loan: any): void {
    console.log('Devolviendo libro:', loan.bookTitle);
    // TODO: Implementar lógica de devolución
  }
}
