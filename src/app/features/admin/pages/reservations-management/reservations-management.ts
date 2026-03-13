import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Reservation, ReservationStatus } from '../../../../core/interfaces/reservation';
import { ReservationService } from '../../../../core/services/reservation.service';
import { BookService } from '../../../../core/services/book.service';
import { UserService } from '../../../../core/services/user.service';

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
  statusFilter = signal('all');
  isLoading = signal(false);
  showAddForm = signal(false);
  editingReservation = signal<Reservation | null>(null);
  formData = signal<Partial<Reservation>>({});

  books = signal<any[]>([]);
  users = signal<any[]>([]);

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private reservationService: ReservationService,
    private bookService: BookService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadReservations();
    this.loadBooks();
    this.loadUsers();
  }

  loadReservations(): void {
    console.log('ReservationsManagement: Iniciando carga de reservas...');
    this.isLoading.set(true);
    
    // Primero probamos la conexión al backend
    console.log('ReservationsManagement: Probando conexión al backend...');
    
    this.reservationService.getAllReservations().subscribe({
      next: (reservations: Reservation[]) => {
        console.log('ReservationsManagement: ✅ Conexión exitosa al backend');
        console.log('ReservationsManagement: Todas las reservas (incluyendo canceladas):', reservations);
        
        // Filtrar solo reservas que no estén canceladas
        const activeReservations = reservations.filter(r => r.status !== 'CANCELLED');
        console.log('ReservationsManagement: Reservas activas (filtradas):', activeReservations);
        console.log('ReservationsManagement: Número de reservas activas:', activeReservations?.length || 0);
        
        this.reservations.set(activeReservations || []);
        this.filteredReservations.set(activeReservations || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('ReservationsManagement: ❌ Error de conexión al backend:', error);
        console.error('ReservationsManagement: Status:', error.status);
        console.error('ReservationsManagement: StatusText:', error.statusText);
        console.error('ReservationsManagement: URL:', error.url);
        
        this.isLoading.set(false);
        this.reservations.set([]);
        this.filteredReservations.set([]);
        
        // Mostrar error más específico
        if (error.status === 0) {
          alert('❌ Error: No se puede conectar al backend. Asegúrate de que el servidor Spring Boot esté corriendo en http://localhost:8080');
        } else {
          alert(`❌ Error del servidor: ${error.status} - ${error.statusText}`);
        }
      }
    });
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (books) => {
        console.log('ReservationsManagement: Libros cargados:', books);
        this.books.set(books);
      },
      error: (error) => {
        console.error('ReservationsManagement: Error cargando libros:', error);
        this.books.set([]);
      }
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('ReservationsManagement: Usuarios cargados:', users);
        this.users.set(users);
      },
      error: (error) => {
        console.error('ReservationsManagement: Error cargando usuarios:', error);
        this.users.set([]);
      }
    });
  }

  onSearch(searchData: { term: string; filter?: string }): void {
    const reservations = this.reservations();
    let filtered = reservations;

    if (searchData.term) {
      filtered = filtered.filter(reservation =>
        reservation.book.title.toLowerCase().includes(searchData.term.toLowerCase()) ||
        reservation.book.author.toLowerCase().includes(searchData.term.toLowerCase()) ||
        reservation.user.name.toLowerCase().includes(searchData.term.toLowerCase())
      );
    }

    if (searchData.filter && searchData.filter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === searchData.filter);
    }

    this.filteredReservations.set(filtered);
  }

  onAddReservation(): void {
    this.editingReservation.set(null);
    this.formData.set({});
    this.showAddForm.set(true);
  }

  onEditReservation(reservation: Reservation): void {
    console.log('ReservationsManagement: Editando reserva:', reservation);
    this.editingReservation.set(reservation);
    this.showAddForm.set(true);
    this.formData.set({ ...reservation });
  }

  onDeleteReservation(reservation: Reservation): void {
    console.log('ReservationsManagement: Iniciando eliminación de reserva:', reservation);
    
    if (confirm(`¿Estás seguro de eliminar la reserva de "${reservation.book.title}"?`)) {
      console.log('ReservationsManagement: Usuario confirmó eliminación');
      console.log('ReservationsManagement: Eliminando reserva con ID:', reservation.id);
      console.log('ReservationsManagement: Reservas antes de eliminar:', this.reservations());
      
      // ELIMINAR CON API REAL
      this.reservationService.deleteReservation(reservation.id).subscribe({
        next: (response) => {
          console.log('ReservationsManagement: Respuesta de eliminación del servicio:', response);
          console.log('ReservationsManagement: Eliminación completada, recargando datos...');
          
          // RECARGAR DATOS DESDE BACKEND para sincronizar
          this.loadReservations();
          alert('Reserva eliminada exitosamente');
        },
        error: (error) => {
          console.error('ReservationsManagement: Error deleting reservation:', error);
          console.error('ReservationsManagement: Error details:', error);
          alert('Error al eliminar reserva: ' + (error.error?.message || error.message || 'Error desconocido'));
        }
      });
    } else {
      console.log('ReservationsManagement: Usuario canceló eliminación');
    }
  }

  onSaveReservation(): void {
    console.log('ReservationsManagement: Guardando reserva:', this.formData());
    
    // Preparar datos para el backend - solo IDs y campos simples
    const reservationData: any = {
      bookId: this.formData().book?.id || 0,
      userId: this.formData().user?.id || 0,
      reservationDate: this.formData().reservationDate || new Date().toISOString().split('T')[0],
      status: (this.formData().status || ReservationStatus.ACTIVE)
    };
    
    console.log('ReservationsManagement: Datos a enviar al backend:', reservationData);
    console.log('ReservationsManagement: bookId:', reservationData.bookId);
    console.log('ReservationsManagement: userId:', reservationData.userId);
    console.log('ReservationsManagement: reservationDate:', reservationData.reservationDate);
    console.log('ReservationsManagement: status:', reservationData.status);
    
    if (this.editingReservation()) {
      // Editar reserva existente - API REAL
      const reservationId = this.editingReservation()!.id;
      console.log('ReservationsManagement: Editando reserva ID:', reservationId);
      console.log('ReservationsManagement: URL será:', `PUT /reservations/${reservationId}`);
      
      this.reservationService.updateReservation(reservationId, reservationData).subscribe({
        next: (updatedReservation) => {
          console.log('ReservationsManagement: ✅ Reserva actualizada exitosamente:', updatedReservation);
          const reservations = this.reservations().map(r =>
            r.id === updatedReservation.id ? updatedReservation : r
          );
          this.reservations.set(reservations);
          this.filteredReservations.set(reservations);
          this.onCancelForm();
          alert('Reserva actualizada exitosamente');
        },
        error: (error) => {
          console.error('ReservationsManagement: ❌ Error updating reservation:', error);
          console.error('ReservationsManagement: Error status:', error.status);
          console.error('ReservationsManagement: Error message:', error.message);
          console.error('ReservationsManagement: Error error:', error.error);
          console.error('ReservationsManagement: Error details:', error.error?.error);
          
          // Mostrar error específico del backend
          const backendMessage = error.error?.message || error.error?.error || error.message || 'Error desconocido';
          alert('Error al actualizar reserva: ' + backendMessage);
        }
      });
    } else {
      // Crear nueva reserva - API REAL
      console.log('ReservationsManagement: Creando nueva reserva');
      this.reservationService.createReservation(reservationData).subscribe({
        next: (newReservation) => {
          console.log('ReservationsManagement: ✅ Reserva creada exitosamente:', newReservation);
          this.reservations.set([...this.reservations(), newReservation]);
          this.filteredReservations.set([...this.filteredReservations(), newReservation]);
          this.onCancelForm();
          alert('Reserva creada exitosamente');
        },
        error: (error) => {
          console.error('ReservationsManagement: ❌ Error creating reservation:', error);
          console.error('ReservationsManagement: Error status:', error.status);
          console.error('ReservationsManagement: Error message:', error.message);
          console.error('ReservationsManagement: Error error:', error.error);
          
          const backendMessage = error.error?.message || error.error?.error || error.message || 'Error desconocido';
          alert('Error al crear reserva: ' + backendMessage);
        }
      });
    }
  }

  onCancelForm(): void {
    this.showAddForm.set(false);
    this.editingReservation.set(null);
    this.formData.set({});
  }

  updateFormField(field: string, value: any): void {
    const current = this.formData();
    this.formData.set({ ...current, [field]: value });
  }

  getInputValue(event: any): any {
    return event.target.value;
  }

  getTotalReservations(): number {
    return this.filteredReservations().length;
  }

  getActiveReservations(): number {
    return this.filteredReservations().filter(r => r.status === 'ACTIVE').length;
  }

  getCompletedReservations(): number {
    return this.filteredReservations().filter(r => r.status === 'COMPLETED').length;
  }

  getCancelledReservations(): number {
    return this.filteredReservations().filter(r => r.status === 'CANCELLED').length;
  }

  onBookChange(event: any): void {
    const bookId = parseInt(event.target.value);
    const book = this.books().find(b => b.id === bookId);
    this.updateFormField('book', book);
  }

  onUserChange(event: any): void {
    const userId = parseInt(event.target.value);
    const user = this.users().find(u => u.id === userId);
    this.updateFormField('user', user);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return '#28a745';
      case 'COMPLETED':
        return '#007bff';
      case 'CANCELLED':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return '📋';
      case 'COMPLETED':
        return '✅';
      case 'CANCELLED':
        return '❌';
      default:
        return '📋';
    }
  }

  navigateToBooksManagement(): void {
    this.router.navigate(['/admin/books']);
  }

  navigateToUsersManagement(): void {
    this.router.navigate(['/admin/users']);
  }
}
