import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ReservationCard } from '../../components/reservation-card/reservation-card';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Reservation } from '../../../../core/interfaces/reservation';
import { ReservationService } from '../../../../core/services/reservation.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-reservations-page',
  imports: [CommonModule, FormsModule, SearchBarComponent, EmptyState, ReservationCard, ConfirmDialog],
  templateUrl: './reservations-page.html',
  styleUrl: './reservations-page.css',
  standalone: true
})
export class ReservationsPage implements OnInit {
  reservations = signal<Reservation[]>([]);
  filteredReservations = signal<Reservation[]>([]);
  searchTerm = '';
  statusFilter = 'all';
  isLoading = signal(false);
  
  // Propiedades para el modal de confirmación
  selectedReservation = signal<Reservation | null>(null);
  isConfirmDialogVisible = signal(false);
  isCancelling = signal(false);

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserReservations();
  }

  private loadUserReservations(): void {
    this.isLoading.set(true);
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.isLoading.set(false);
      return;
    }

    // CONSUMIR API REAL CON RESERVATION SERVICE
    this.reservationService.getReservationsByUser(currentUser.id).subscribe({
      next: (reservations) => {
        console.log('ReservationsPage: Reservas cargadas:', reservations);
        this.reservations.set(reservations);
        this.filteredReservations.set(reservations);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('ReservationsPage: Error cargando reservas:', error);
        this.isLoading.set(false);
        // No mostrar alerta, solo dejar el array vacío para que el EmptyState se muestre
        this.reservations.set([]);
        this.filteredReservations.set([]);
      }
    });
  }

  onSearch(searchData: { term: string; filter?: string }): void {
    const reservations = this.reservations();
    let filtered = reservations;

    if (searchData.term) {
      filtered = filtered.filter(reservation =>
        reservation.book.title.toLowerCase().includes(searchData.term.toLowerCase()) ||
        reservation.book.author.toLowerCase().includes(searchData.term.toLowerCase())
      );
    }

    if (searchData.filter && searchData.filter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === searchData.filter);
    }

    this.filteredReservations.set(filtered);
  }

  refreshReservations(): void {
    console.log('🔄 Refrescando reservas desde API...');
    this.loadUserReservations();
  }

  onFilter(): void {
    this.onSearch({ term: this.searchTerm, filter: this.statusFilter === 'all' ? undefined : this.statusFilter });
  }

  onCancelReservation(reservation: Reservation): void {
    console.log('ReservationsPage: Iniciando cancelación de reserva:', reservation.book.title);
    
    // Verificar que el usuario esté autenticado
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      alert('❌ Debes iniciar sesión para cancelar una reserva');
      return;
    }
    
    // Verificar que la reserva pertenezca al usuario actual
    if (reservation.user.id !== currentUser.id) {
      alert('❌ No puedes cancelar una reserva que no te pertenece');
      return;
    }
    
    // Verificar que la reserva esté activa
    if (reservation.status !== 'ACTIVE') {
      alert('❌ Solo se pueden cancelar reservas activas');
      return;
    }
    
    // Abrir modal de confirmación
    this.selectedReservation.set(reservation);
    this.isConfirmDialogVisible.set(true);
  }

  // Métodos para el modal de confirmación
  getCancelMessage(): string {
    const reservation = this.selectedReservation();
    if (!reservation) return '';
    
    return `¿Estás seguro de que deseas cancelar la reserva de "${reservation.book.title}"?\n\n` +
      `📚 Libro: ${reservation.book.title}\n` +
      `📅 Fecha de reserva: ${reservation.reservationDate}\n` +
      `⚠️ Esta acción no se puede deshacer.`;
  }

  onConfirmDialogClose(): void {
    this.isConfirmDialogVisible.set(false);
    this.selectedReservation.set(null);
  }

  onConfirmDialogConfirm(): void {
    const reservation = this.selectedReservation();
    if (!reservation) return;
    
    console.log('ReservationsPage: Usuario confirmó cancelación de reserva');
    this.isCancelling.set(true);
    
    // Llamar a la API para cancelar la reserva
    this.reservationService.deleteReservation(reservation.id).subscribe({
      next: () => {
        console.log('ReservationsPage: ✅ Reserva cancelada exitosamente');
        this.isCancelling.set(false);
        this.onConfirmDialogClose();
        
        // Mostrar notificación de éxito
        alert(`✅ ¡Reserva cancelada!\n\n"${reservation.book.title}" ha sido cancelada exitosamente.`);
        
        // Recargar reservas para actualizar la lista
        this.loadUserReservations();
      },
      error: (error) => {
        console.error('ReservationsPage: ❌ Error al cancelar reserva:', error);
        this.isCancelling.set(false);
        
        // Mostrar error específico del backend
        const backendMessage = error.error?.message || error.error?.error || error.message || 'Error desconocido';
        alert(`❌ Error al cancelar reserva: ${backendMessage}`);
      }
    });
  }

  onBorrowBook(reservation: Reservation): void {
    console.log('Solicitando préstamo de:', reservation.book.title);
    // TODO: Implementar lógica de préstamo con API real
    alert('Función de préstamo en desarrollo.');
  }

  onViewReservationDetails(reservation: Reservation): void {
    console.log('Ver detalles de reserva:', reservation.book.title);
    // TODO: Implementar navegación a detalles
  }
}
