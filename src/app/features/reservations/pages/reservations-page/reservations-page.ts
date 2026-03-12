import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ReservationCard } from '../../components/reservation-card/reservation-card';

@Component({
  selector: 'app-reservations-page',
  imports: [CommonModule, FormsModule, SearchBarComponent, EmptyState, ReservationCard],
  templateUrl: './reservations-page.html',
  styleUrl: './reservations-page.css',
  standalone: true
})
export class ReservationsPage {
  reservations = signal([
    {
      id: 1,
      bookTitle: 'El Principito',
      bookAuthor: 'Antoine de Saint-Exupéry',
      reservationDate: '2024-01-20',
      expiryDate: '2024-01-27',
      status: 'active',
      queuePosition: 1
    },
    {
      id: 2,
      bookTitle: 'Cien Años de Soledad',
      bookAuthor: 'Gabriel García Márquez',
      reservationDate: '2024-01-18',
      expiryDate: '2024-01-25',
      status: 'expired',
      queuePosition: 3
    },
    {
      id: 3,
      bookTitle: '1984',
      bookAuthor: 'George Orwell',
      reservationDate: '2024-01-22',
      expiryDate: '2024-01-29',
      status: 'available',
      queuePosition: 0
    }
  ]);

  filteredReservations = signal([...this.reservations()]);
  searchTerm = '';
  statusFilter = 'all';

  onSearch(searchData: { term: string; filter?: string }): void {
    const reservations = this.reservations();
    let filtered = reservations;

    if (searchData.term) {
      filtered = filtered.filter(reservation =>
        reservation.bookTitle.toLowerCase().includes(searchData.term.toLowerCase()) ||
        reservation.bookAuthor.toLowerCase().includes(searchData.term.toLowerCase())
      );
    }

    if (searchData.filter && searchData.filter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === searchData.filter);
    }

    this.filteredReservations.set(filtered);
  }

  onFilter(): void {
    this.onSearch({ term: this.searchTerm, filter: this.statusFilter === 'all' ? undefined : this.statusFilter });
  }

  onCancelReservation(reservation: any): void {
    console.log('Cancelando reserva:', reservation.bookTitle);
    // TODO: Implementar lógica de cancelación
  }

  onBorrowBook(reservation: any): void {
    console.log('Solicitando préstamo:', reservation.bookTitle);
    // TODO: Implementar lógica de préstamo
  }

  onViewReservationDetails(reservation: any): void {
    console.log('Ver detalles de reserva:', reservation.bookTitle);
    // TODO: Implementar navegación a detalles
  }
}
