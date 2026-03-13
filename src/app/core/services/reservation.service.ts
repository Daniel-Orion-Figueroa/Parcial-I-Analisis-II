import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';

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
    const url = `${this.apiUrl}/reservations`;
    console.log('ReservationService: Llamando a GET', url);
    
    return this.http
      .get<any>(url)
      .pipe(
        tap((response: any) => {
          console.log('ReservationService: Respuesta completa del backend:', response);
          console.log('ReservationService: Status:', response.status);
          console.log('ReservationService: Response type:', typeof response);
          
          // El backend devuelve: { message: "...", data: [Reservation[], ...] }
          const reservations = response.data || response;
          console.log('ReservationService: Reservas extraídas:', reservations);
          console.log('ReservationService: Reservas type:', typeof reservations);
          console.log('ReservationService: Reservas is array?', Array.isArray(reservations));
          
          this.reservationsSubject.next(reservations);
        }),
        // Devolver solo el array de reservas
        map((response: any) => {
          console.log('ReservationService: Mapeando respuesta:', response);
          const result = response.data || response;
          console.log('ReservationService: Resultado final:', result);
          return result;
        })
      );
  }

  /**
   * Obtener reservas por usuario
   */
  getReservationsByUser(userId: number): Observable<Reservation[]> {

    return this.http
      .get<any>(`${this.apiUrl}${API_ENDPOINTS.RESERVATIONS.GET_BY_USER}/${userId}`)
      .pipe(
        tap((response: any) => {
          console.log('ReservationService: Reservas por usuario:', response);
          const reservations = response.data || response;
          this.reservationsSubject.next(reservations);
        }),
        map((response: any) => response.data || response)
      );
  }

  /**
   * Obtener reserva por ID
   */
  getReservationById(id: number): Observable<Reservation> {
    return this.http
      .get<any>(`${this.apiUrl}${API_ENDPOINTS.RESERVATIONS.GET_BY_ID}/${id}`)
      .pipe(
        map((response: any) => response.data || response)
      );
  }

  /**
   * Crear nueva reserva
   */
  createReservation(reservation: Partial<Reservation>): Observable<Reservation> {
    return this.http
      .post<any>(`${this.apiUrl}${API_ENDPOINTS.RESERVATIONS.CREATE}`, reservation)
      .pipe(
        tap((response: any) => {
          console.log('ReservationService: Creando reserva:', response);
          const newReservation = response.data || response;
          const currentReservations = this.reservationsSubject.value;
          this.reservationsSubject.next([...currentReservations, newReservation]);
        }),
        map((response: any) => response.data || response)
      );
  }

  /**
   * Actualizar reserva existente
   */
  updateReservation(id: number, reservation: Partial<Reservation>): Observable<Reservation> {
    const url = `${this.apiUrl}/reservations/${id}`;
    console.log('ReservationService: Llamando a PUT', url, 'con datos:', reservation);
    
    return this.http
      .put<any>(url, reservation)
      .pipe(
        tap((response: any) => {
          console.log('ReservationService: Respuesta de actualización:', response);
          const updatedReservation = response.data || response;
          const reservations = this.reservationsSubject.value.map(r =>
            r.id === id ? updatedReservation : r
          );
          this.reservationsSubject.next(reservations);
        }),
        map((response: any) => response.data || response)
      );
  }

  /**
   * Eliminar reserva
   */
  deleteReservation(id: number): Observable<void> {
    const url = `${this.apiUrl}/reservations/${id}`;
    console.log('ReservationService: Llamando a DELETE', url);
    
    return this.http
      .delete<any>(url)
      .pipe(
        tap((response: any) => {
          console.log('ReservationService: Respuesta de eliminación:', response);
          console.log('ReservationService: Eliminando reserva con ID:', id);
          // NO filtrar aquí, dejar que el componente recargue los datos
          const reservations = this.reservationsSubject.value.filter(r => r.id !== id);
          this.reservationsSubject.next(reservations);
        })
      );
  }
}
