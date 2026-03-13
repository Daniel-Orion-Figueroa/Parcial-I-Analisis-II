import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

import { Reservation, ReservationStatus } from '../../../../core/interfaces/reservation';
import { User } from '../../../../core/interfaces/user';
import { Book } from '../../../../core/interfaces/book';
import { ReservationService } from '../../../../core/services/reservation.service';
import { UserService } from '../../../../core/services/user.service';
import { BookService } from '../../../../core/services/book.service';

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

  // Datos reales de usuarios y libros
  users = signal<User[]>([]);
  books = signal<Book[]>([]);

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private reservationService: ReservationService,
    private userService: UserService,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    this.loadReservations();
    this.loadUsers();
    this.loadBooks();
  }

  loadReservations(): void {
    this.isLoading.set(true);
    
    // Cargar reservaciones desde la API REAL
    this.reservationService.getAllReservations().subscribe({
      next: (reservations) => {
        console.log('ReservationsManagement: Reservas cargadas:', reservations);
        this.reservations.set(reservations);
        this.filteredReservations.set(reservations);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.isLoading.set(false);
      }
    });
  }

  loadUsers(): void {
    // Cargar usuarios desde la API REAL
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('ReservationsManagement: Usuarios cargados:', users);
        this.users.set(users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        console.error('Error details:', error.status, error.statusText);
        
        // Si hay error de serialización o 403, mostrar mensaje claro
        if (error.status === 200 && error.statusText === 'Unknown Error') {
          alert('Error de serialización en el backend al cargar usuarios. Hay referencias circulares en las entidades.');
          this.users.set([]);
        } else if (error.status === 403) {
          alert('Error 403 Forbidden - No tienes permisos para cargar usuarios. Verifica tu token de autenticación.');
          this.users.set([]);
        }
      }
    });
  }

  loadBooks(): void {
    // Cargar libros desde la API REAL
    this.bookService.getBooks().subscribe({
      next: (books) => {
        console.log('ReservationsManagement: Libros cargados:', books);
        this.books.set(books);
      },
      error: (error) => {
        console.error('Error loading books:', error);
        console.error('Error details:', error.status, error.statusText);
        
        // Si hay error de serialización, mostrar mensaje claro
        if (error.status === 200 && error.statusText === 'Unknown Error') {
          alert('Error de serialización en el backend al cargar libros. Hay referencias circulares en las entidades.');
          this.books.set([]);
        }
      }
    });
  }

  onSearch(searchData: { term: string }): void {
    const term = searchData.term.toLowerCase();
    this.searchTerm.set(term);
    
    const filtered = this.reservations().filter(reservation => 
      reservation.book.title.toLowerCase().includes(term) ||
      reservation.user.name.toLowerCase().includes(term) ||
      reservation.user.email.toLowerCase().includes(term) ||
      reservation.status.toLowerCase().includes(term)
    );
    
    this.filteredReservations.set(filtered);
  }

  onAddReservation(): void {
    this.editingReservation.set(null);
    this.formData.set({
      book: { id: 0 } as Book,
      user: { id: 0 } as User,
      reservationDate: new Date().toISOString().split('T')[0],
      status: ReservationStatus.ACTIVE
    });
    this.showAddForm.set(true);
  }

  onEditReservation(reservation: Reservation): void {
    console.log('ReservationsManagement: Editando reserva:', reservation);
    this.editingReservation.set(reservation);
    this.showAddForm.set(true);
    this.formData.set({ ...reservation });
  }

  onDeleteReservation(reservation: Reservation): void {
    if (confirm(`¿Estás seguro de eliminar la reserva de "${reservation.book.title}"?`)) {
      // ELIMINAR CON API REAL
      this.reservationService.deleteReservation(reservation.id).subscribe({
        next: () => {
          const currentReservations = this.reservations().filter(r => r.id !== reservation.id);
          this.reservations.set(currentReservations);
          this.filteredReservations.set(currentReservations);
          alert('Reserva eliminada exitosamente');
        },
        error: (error) => {
          console.error('Error deleting reservation:', error);
        }
      });
    }
  }

  onSaveReservation(): void {
    console.log('ReservationsManagement: Guardando reserva:', this.formData());
    
    // Preparar datos para el backend - solo IDs y campos simples
    const reservationData = {
      bookId: this.formData().book?.id || 0,
      userId: this.formData().user?.id || 0,
      reservationDate: this.formData().reservationDate || new Date().toISOString().split('T')[0],
      status: (this.formData().status || 'ACTIVE') as ReservationStatus
    };
    
    console.log('ReservationsManagement: Datos a enviar al backend:', reservationData);
    
    if (this.editingReservation()) {
      // Editar reserva existente - API REAL
      this.reservationService.updateReservation(this.editingReservation()!.id, reservationData).subscribe({
        next: (updatedReservation) => {
          const reservations = this.reservations().map(r =>
            r.id === updatedReservation.id ? updatedReservation : r
          );
          this.reservations.set(reservations);
          this.filteredReservations.set(reservations);
          this.onCancelForm();
        },
        error: (error) => {
          console.error('Error updating reservation:', error);
        }
      });
    } else {
      // Crear nueva reserva - API REAL
      this.reservationService.createReservation(reservationData).subscribe({
        next: (newReservation) => {
          this.reservations.set([...this.reservations(), newReservation]);
          this.filteredReservations.set([...this.reservations(), newReservation]);
          this.onCancelForm();
        },
        error: (error) => {
          console.error('Error creating reservation:', error);
        }
      });
    }
  }

  onCancelForm(): void {
    this.showAddForm.set(false);
    this.editingReservation.set(null);
  }

  updateFormField(field: keyof Reservation, value: any): void {
    const current = this.formData();
    this.formData.set({ ...current, [field]: value });
  }

  getTotalReservations(): number {
    return this.reservations().length;
  }

  getActiveReservations(): number {
    return this.reservations().filter(r => r.status === ReservationStatus.ACTIVE).length;
  }

  getCompletedReservations(): number {
    return this.reservations().filter(r => r.status === ReservationStatus.COMPLETED).length;
  }

  getCancelledReservations(): number {
    return this.reservations().filter(r => r.status === ReservationStatus.CANCELLED).length;
  }

  onBookChange(event: Event): void {
    const bookId = (event.target as HTMLSelectElement).value;
    const book = this.books().find(b => b.id === Number(bookId));
    this.updateFormField('book', book || { id: 0 } as Book);
  }

  onUserChange(event: Event): void {
    const userId = (event.target as HTMLSelectElement).value;
    const user = this.users().find(u => u.id === Number(userId));
    this.updateFormField('user', user || { id: 0 } as User);
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case ReservationStatus.ACTIVE:
        return '#28a745';
      case ReservationStatus.COMPLETED:
        return '#007bff';
      case ReservationStatus.CANCELLED:
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case ReservationStatus.ACTIVE:
        return '📋';
      case ReservationStatus.COMPLETED:
        return '✅';
      case ReservationStatus.CANCELLED:
        return '❌';
      default:
        return '📋';
    }
  }

  navigateToBooksManagement(): void {
    this.router.navigate(['/admin/books-management']);
  }

  navigateToUsersManagement(): void {
    this.router.navigate(['/admin/users-management']);
  }
}
