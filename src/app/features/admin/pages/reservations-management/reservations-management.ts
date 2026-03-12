import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

interface Reservation {
  id: number;
  bookId: number;
  bookTitle: string;
  userId: number;
  userName: string;
  userEmail: string;
  fechaReserva: string;
  fechaExpiracion: string;
  estado: 'ACTIVA' | 'COMPLETADA' | 'CANCELADA' | 'EXPIRADA';
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
  selector: 'app-reservations-management',
  imports: [CommonModule],
  templateUrl: './reservations-management.html',
  styleUrl: './reservations-management.css',
  standalone: true
})
export class ReservationsManagementComponent implements OnInit {
  reservations = signal<Reservation[]>([]);
  filteredReservations = signal<Reservation[]>([]);
  searchTerm = signal('');
  isLoading = signal(false);
  showAddForm = signal(false);
  editingReservation = signal<Reservation | null>(null);
  formData = signal<Partial<Reservation>>({});

  // Mock data
  users = signal<User[]>([]);
  books = signal<Book[]>([]);

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.loadReservations();
    this.loadUsers();
    this.loadBooks();
  }

  loadReservations(): void {
    this.isLoading.set(true);
    
    // Mock data
    const mockReservations: Reservation[] = [
      {
        id: 1,
        bookId: 1,
        bookTitle: 'Cien años de soledad',
        userId: 1,
        userName: 'Juan Pérez',
        userEmail: 'juan@university.edu',
        fechaReserva: '2024-01-15',
        fechaExpiracion: '2024-01-22',
        estado: 'ACTIVA'
      },
      {
        id: 2,
        bookId: 2,
        bookTitle: 'Don Quijote',
        userId: 2,
        userName: 'María García',
        userEmail: 'maria@university.edu',
        fechaReserva: '2024-01-10',
        fechaExpiracion: '2024-01-17',
        estado: 'COMPLETADA'
      },
      {
        id: 3,
        bookId: 3,
        bookTitle: '1984',
        userId: 3,
        userName: 'Carlos Admin',
        userEmail: 'admin@university.edu',
        fechaReserva: '2024-01-05',
        fechaExpiracion: '2024-01-12',
        estado: 'EXPIRADA'
      }
    ];

    setTimeout(() => {
      this.reservations.set(mockReservations);
      this.filteredReservations.set(mockReservations);
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
      { id: 2, title: 'Don Quijote', author: 'Miguel de Cervantes', isbn: '978-0-14-243723-4', disponible: true },
      { id: 3, title: '1984', author: 'George Orwell', isbn: '978-0-452-28423-4', disponible: true },
      { id: 4, title: 'El Principito', author: 'Antoine de Saint-Exupéry', isbn: '978-0-15-601219-5', disponible: true },
      { id: 5, title: 'Orgullo y Prejuicio', author: 'Jane Austen', isbn: '978-0-14-143951-8', disponible: true }
    ];
    this.books.set(mockBooks);
  }

  onSearch(searchData: { term: string }): void {
    const term = searchData.term.toLowerCase();
    this.searchTerm.set(term);
    
    const filtered = this.reservations().filter(reservation => 
      reservation.bookTitle.toLowerCase().includes(term) ||
      reservation.userName.toLowerCase().includes(term) ||
      reservation.userEmail.toLowerCase().includes(term) ||
      reservation.estado.toLowerCase().includes(term)
    );
    
    this.filteredReservations.set(filtered);
  }

  onAddReservation(): void {
    this.editingReservation.set(null);
    this.formData.set({
      bookId: 0,
      userId: 0,
      fechaReserva: new Date().toISOString().split('T')[0],
      fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estado: 'ACTIVA'
    });
    this.showAddForm.set(true);
  }

  onEditReservation(reservation: Reservation): void {
    this.editingReservation.set(reservation);
    this.formData.set({ ...reservation });
    this.showAddForm.set(true);
  }

  onSaveReservation(): void {
    if (this.editingReservation()) {
      // Edit existing reservation
      const updatedReservations = this.reservations().map(reservation => 
        reservation.id === this.editingReservation()!.id 
          ? { ...this.formData(), id: reservation.id } as Reservation
          : reservation
      );
      this.reservations.set(updatedReservations);
    } else {
      // Add new reservation
      const newReservation: Reservation = {
        id: Date.now(),
        bookId: this.formData().bookId!,
        bookTitle: this.books().find(b => b.id === this.formData().bookId)?.title || '',
        userId: this.formData().userId!,
        userName: this.users().find(u => u.id === this.formData().userId)?.name || '',
        userEmail: this.users().find(u => u.id === this.formData().userId)?.email || '',
        fechaReserva: this.formData().fechaReserva!,
        fechaExpiracion: this.formData().fechaExpiracion!,
        estado: this.formData().estado as 'ACTIVA' | 'COMPLETADA' | 'CANCELADA' | 'EXPIRADA'
      };
      this.reservations.set([...this.reservations(), newReservation]);
    }
    
    this.onCancelForm();
    this.onSearch({ term: this.searchTerm() });
  }

  onDeleteReservation(reservation: Reservation): void {
    if (confirm(`¿Estás seguro de eliminar la reserva de "${reservation.bookTitle}" para ${reservation.userName}?`)) {
      const updatedReservations = this.reservations().filter(r => r.id !== reservation.id);
      this.reservations.set(updatedReservations);
      this.onSearch({ term: this.searchTerm() });
    }
  }

  onCancelForm(): void {
    this.showAddForm.set(false);
    this.editingReservation.set(null);
    this.formData.set({});
  }

  updateFormField(field: string, value: any): void {
    this.formData.update(current => ({ ...current, [field]: value }));
  }

  getInputValue(event: any): string {
    return event?.target?.value || '';
  }

  // Statistics
  getTotalReservations(): number {
    return this.reservations().length;
  }

  getActiveReservations(): number {
    return this.reservations().filter(reservation => reservation.estado === 'ACTIVA').length;
  }

  getCompletedReservations(): number {
    return this.reservations().filter(reservation => reservation.estado === 'COMPLETADA').length;
  }

  getExpiredReservations(): number {
    return this.reservations().filter(reservation => reservation.estado === 'EXPIRADA').length;
  }

  getCancelledReservations(): number {
    return this.reservations().filter(reservation => reservation.estado === 'CANCELADA').length;
  }

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'ACTIVA':
        return '#28a745';
      case 'COMPLETADA':
        return '#007bff';
      case 'CANCELADA':
        return '#6c757d';
      case 'EXPIRADA':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  getStatusIcon(estado: string): string {
    switch (estado) {
      case 'ACTIVA':
        return '📋';
      case 'COMPLETADA':
        return '✅';
      case 'CANCELADA':
        return '❌';
      case 'EXPIRADA':
        return '⏰';
      default:
        return '📋';
    }
  }
}
