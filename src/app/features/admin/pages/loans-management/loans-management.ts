import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

interface Loan {
  id: number;
  bookId: number;
  bookTitle: string;
  userId: number;
  userName: string;
  userEmail: string;
  fechaPrestamo: string;
  fechaDevolucion: string;
  estado: 'ACTIVO' | 'DEVUELTO' | 'VENCIDO';
}

interface User {
  id: number;
  name: string;
  email: string;
  tipoUsuario: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  disponible: boolean;
}

@Component({
  selector: 'app-loans-management',
  imports: [CommonModule],
  templateUrl: './loans-management.html',
  styleUrl: './loans-management.css',
  standalone: true
})
export class LoansManagementComponent implements OnInit {
  loans = signal<Loan[]>([]);
  filteredLoans = signal<Loan[]>([]);
  searchTerm = signal('');
  isLoading = signal(false);
  showAddForm = signal(false);
  editingLoan = signal<Loan | null>(null);
  formData = signal<Partial<Loan>>({});

  // Mock data
  users = signal<User[]>([]);
  books = signal<Book[]>([]);

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.loadLoans();
    this.loadUsers();
    this.loadBooks();
  }

  loadLoans(): void {
    this.isLoading.set(true);
    
    // Mock data
    const mockLoans: Loan[] = [
      {
        id: 1,
        bookId: 1,
        bookTitle: 'Cien años de soledad',
        userId: 1,
        userName: 'Juan Pérez',
        userEmail: 'juan@university.edu',
        fechaPrestamo: '2024-01-15',
        fechaDevolucion: '2024-02-15',
        estado: 'ACTIVO'
      },
      {
        id: 2,
        bookId: 2,
        bookTitle: 'Don Quijote',
        userId: 2,
        userName: 'María García',
        userEmail: 'maria@university.edu',
        fechaPrestamo: '2024-01-10',
        fechaDevolucion: '2024-02-10',
        estado: 'VENCIDO'
      },
      {
        id: 3,
        bookId: 3,
        bookTitle: '1984',
        userId: 3,
        userName: 'Carlos Admin',
        userEmail: 'admin@university.edu',
        fechaPrestamo: '2024-01-05',
        fechaDevolucion: '2024-02-05',
        estado: 'DEVUELTO'
      }
    ];

    setTimeout(() => {
      this.loans.set(mockLoans);
      this.filteredLoans.set(mockLoans);
      this.isLoading.set(false);
    }, 500);
  }

  loadUsers(): void {
    // Mock users
    const mockUsers: User[] = [
      { id: 1, name: 'Juan Pérez', email: 'juan@university.edu', tipoUsuario: 'ESTUDIANTE' },
      { id: 2, name: 'María García', email: 'maria@university.edu', tipoUsuario: 'DOCENTE' },
      { id: 3, name: 'Carlos Admin', email: 'admin@university.edu', tipoUsuario: 'ADMIN' },
      { id: 4, name: 'Ana Estudiante', email: 'ana@university.edu', tipoUsuario: 'ESTUDIANTE' }
    ];
    this.users.set(mockUsers);
  }

  loadBooks(): void {
    // Mock books
    const mockBooks: Book[] = [
      { id: 1, title: 'Cien años de soledad', author: 'Gabriel García Márquez', isbn: '978-0-06-088328-7', disponible: false },
      { id: 2, title: 'Don Quijote', author: 'Miguel de Cervantes', isbn: '978-0-14-243723-4', disponible: false },
      { id: 3, title: '1984', author: 'George Orwell', isbn: '978-0-452-28423-4', disponible: true },
      { id: 4, title: 'El Principito', author: 'Antoine de Saint-Exupéry', isbn: '978-0-15-601219-5', disponible: true },
      { id: 5, title: 'Orgullo y Prejuicio', author: 'Jane Austen', isbn: '978-0-14-143951-8', disponible: true }
    ];
    this.books.set(mockBooks);
  }

  onSearch(searchData: { term: string }): void {
    const term = searchData.term.toLowerCase();
    this.searchTerm.set(term);
    
    const filtered = this.loans().filter(loan => 
      loan.bookTitle.toLowerCase().includes(term) ||
      loan.userName.toLowerCase().includes(term) ||
      loan.userEmail.toLowerCase().includes(term) ||
      loan.estado.toLowerCase().includes(term)
    );
    
    this.filteredLoans.set(filtered);
  }

  onAddLoan(): void {
    this.editingLoan.set(null);
    this.formData.set({
      bookId: 0,
      userId: 0,
      fechaPrestamo: new Date().toISOString().split('T')[0],
      fechaDevolucion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estado: 'ACTIVO'
    });
    this.showAddForm.set(true);
  }

  onEditLoan(loan: Loan): void {
    this.editingLoan.set(loan);
    this.formData.set({ ...loan });
    this.showAddForm.set(true);
  }

  onSaveLoan(): void {
    if (this.editingLoan()) {
      // Edit existing loan
      const updatedLoans = this.loans().map(loan => 
        loan.id === this.editingLoan()!.id 
          ? { ...this.formData(), id: loan.id } as Loan
          : loan
      );
      this.loans.set(updatedLoans);
    } else {
      // Add new loan
      const newLoan: Loan = {
        id: Date.now(),
        bookId: this.formData().bookId!,
        bookTitle: this.books().find(b => b.id === this.formData().bookId)?.title || '',
        userId: this.formData().userId!,
        userName: this.users().find(u => u.id === this.formData().userId)?.name || '',
        userEmail: this.users().find(u => u.id === this.formData().userId)?.email || '',
        fechaPrestamo: this.formData().fechaPrestamo!,
        fechaDevolucion: this.formData().fechaDevolucion!,
        estado: this.formData().estado as 'ACTIVO' | 'DEVUELTO' | 'VENCIDO'
      };
      this.loans.set([...this.loans(), newLoan]);
    }
    
    this.onCancelForm();
    this.onSearch({ term: this.searchTerm() });
  }

  onDeleteLoan(loan: Loan): void {
    if (confirm(`¿Estás seguro de eliminar el préstamo de "${loan.bookTitle}" a ${loan.userName}?`)) {
      const updatedLoans = this.loans().filter(l => l.id !== loan.id);
      this.loans.set(updatedLoans);
      this.onSearch({ term: this.searchTerm() });
    }
  }

  onCancelForm(): void {
    this.showAddForm.set(false);
    this.editingLoan.set(null);
    this.formData.set({});
  }

  updateFormField(field: string, value: any): void {
    this.formData.update(current => ({ ...current, [field]: value }));
  }

  getInputValue(event: any): string {
    return event?.target?.value || '';
  }

  // Statistics
  getTotalLoans(): number {
    return this.loans().length;
  }

  getActiveLoans(): number {
    return this.loans().filter(loan => loan.estado === 'ACTIVO').length;
  }

  getOverdueLoans(): number {
    return this.loans().filter(loan => loan.estado === 'VENCIDO').length;
  }

  getReturnedLoans(): number {
    return this.loans().filter(loan => loan.estado === 'DEVUELTO').length;
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'ACTIVO':
        return '#28a745';
      case 'DEVUELTO':
        return '#007bff';
      case 'VENCIDO':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  getStatusIcon(estado: string): string {
    switch (estado) {
      case 'ACTIVO':
        return '📚';
      case 'DEVUELTO':
        return '✅';
      case 'VENCIDO':
        return '⚠️';
      default:
        return '📋';
    }
  }
}
