import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { Reservation } from '../interfaces/reservation';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private apiUrl = environment.apiUrl;

  private reservationsSubject = new BehaviorSubject<Reservation[]>([]);
  public reservations$: Observable<Reservation[]> = this.reservationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las reservas (admin)
   */
  getAllReservations(): Observable<Reservation[]> {

    return this.http
      .get<Reservation[]>(`${this.apiUrl}${API_ENDPOINTS.RESERVATIONS.CREATE}`)
      .pipe(
        tap(reservations => this.reservationsSubject.next(reservations))
      );

  }

  /**
   * Obtener reservas por usuario
   */
  getReservationsByUser(userId: number): Observable<Reservation[]> {

    return this.http
      .get<Reservation[]>(`${this.apiUrl}${API_ENDPOINTS.RESERVATIONS.GET_BY_USER}/${userId}`)
      .pipe(
        tap(reservations => this.reservationsSubject.next(reservations))
      );

  }

  /**
   * Obtener reserva por ID
   */
  getReservationById(id: number): Observable<Reservation> {

    return this.http.get<Reservation>(
      `${this.apiUrl}${API_ENDPOINTS.RESERVATIONS.CREATE}/${id}`
    );

  }

  /**
   * Crear reserva
   */
  createReservation(reservation: Partial<Reservation>): Observable<Reservation> {

    return this.http
      .post<Reservation>(`${this.apiUrl}${API_ENDPOINTS.RESERVATIONS.CREATE}`, reservation)
      .pipe(
        tap(newReservation => {

          const current = this.reservationsSubject.value;
          this.reservationsSubject.next([...current, newReservation]);

        })
      );

  }

  /**
   * Actualizar reserva (aprobar / rechazar / modificar)
   */
  updateReservation(id: number, reservation: Partial<Reservation>): Observable<Reservation> {

    return this.http
      .put<Reservation>(`${this.apiUrl}${API_ENDPOINTS.RESERVATIONS.CREATE}/${id}`, reservation)
      .pipe(
        tap(updated => {

          const updatedList = this.reservationsSubject.value.map(r =>
            r.id === id ? updated : r
          );

          this.reservationsSubject.next(updatedList);

        })
      );

  }

  /**
   * Eliminar o cancelar reserva
   */
  deleteReservation(id: number): Observable<void> {

    return this.http
      .delete<void>(`${this.apiUrl}${API_ENDPOINTS.RESERVATIONS.CREATE}/${id}`)
      .pipe(
        tap(() => {

          const filtered = this.reservationsSubject.value.filter(r => r.id !== id);
          this.reservationsSubject.next(filtered);

        })
      );

  }

  /**
   * Obtener estado actual sin llamar API
   */
  getReservationsState(): Reservation[] {
    return this.reservationsSubject.value;
  }

}