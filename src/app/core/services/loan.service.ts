import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { Loan, CreateLoanRequest, UpdateLoanRequest, LoanStatus } from '../interfaces/loan';

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  private apiUrl = environment.apiUrl;

  private loansSubject = new BehaviorSubject<Loan[]>([]);
  public loans$: Observable<Loan[]> = this.loansSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los préstamos (admin)
   */
  getAllLoans(): Observable<Loan[]> {

    return this.http
      .get<any>(`${this.apiUrl}${API_ENDPOINTS.LOANS.CREATE}`)
      .pipe(
        tap((response: any) => {
          console.log('LoanService: Respuesta completa del backend:', response);
          // El backend devuelve: { message: "...", data: [Loan[], ...] }
          const loans = response.data || response; // Fallback por si acaso
          console.log('LoanService: Préstamos extraídos:', loans);
          this.loansSubject.next(loans);
        }),
        // Devolver solo el array de préstamos
        map((response: any) => response.data || response)
      );

  }

  /**
   * Obtener préstamos por usuario
   */
  getLoansByUser(userId: number): Observable<Loan[]> {

    return this.http
      .get<any>(`${this.apiUrl}${API_ENDPOINTS.LOANS.GET_BY_USER}/${userId}`)
      .pipe(
        tap((response: any) => {
          console.log('LoanService: Respuesta completa del backend (préstamos por usuario):', response);
          // El backend devuelve: { message: "...", data: [Loan[], ...] }
          const loans = response.data || response; // Fallback por si acaso
          console.log('LoanService: Préstamos del usuario extraídos:', loans);
          this.loansSubject.next(loans);
        }),
        // Devolver solo el array de préstamos
        map((response: any) => response.data || response)
      );

  }

  /**
   * Obtener préstamo por ID
   */
  getLoanById(id: number): Observable<Loan> {

    return this.http.get<Loan>(
      `${this.apiUrl}${API_ENDPOINTS.LOANS.CREATE}/${id}`
    );

  }

  /**
   * Crear préstamo
   */
  createLoan(loan: Partial<Loan>): Observable<Loan> {

    return this.http
      .post<Loan>(`${this.apiUrl}${API_ENDPOINTS.LOANS.CREATE}`, loan)
      .pipe(
        tap(newLoan => {

          const current = this.loansSubject.value;
          this.loansSubject.next([...current, newLoan]);

        })
      );

  }

  /**
   * Actualizar préstamo
   * (por ejemplo marcar DEVUELTO o cambiar estado)
   */
  updateLoan(id: number, loan: Partial<Loan>): Observable<Loan> {

    return this.http
      .put<Loan>(`${this.apiUrl}${API_ENDPOINTS.LOANS.CREATE}/${id}`, loan)
      .pipe(
        tap(updated => {

          const updatedList = this.loansSubject.value.map(l =>
            l.id === id ? updated : l
          );

          this.loansSubject.next(updatedList);

        })
      );

  }

  /**
   * Eliminar préstamo (normalmente no se usa, pero útil para admin)
   */
  deleteLoan(id: number): Observable<void> {

    return this.http
      .delete<void>(`${this.apiUrl}${API_ENDPOINTS.LOANS.CREATE}/${id}`)
      .pipe(
        tap(() => {

          const filtered = this.loansSubject.value.filter(l => l.id !== id);
          this.loansSubject.next(filtered);

        })
      );

  }

  /**
   * Crear préstamo desde reserva
   */
  createLoanFromReservation(reservationId: number, dueDate: string): Observable<Loan> {
    console.log(`LoanService: Creando préstamo desde reserva ${reservationId}`);
    return this.http.post<Loan>(`${this.apiUrl}/loans/from-reservation/${reservationId}`, { dueDate });
  }

  /**
   * Devolver un libro (marcar préstamo como RETURNED)
   */
  returnLoan(id: number): Observable<Loan> {
    console.log(`LoanService: Devolviendo préstamo ${id}`);
    return this.http.put<Loan>(`${this.apiUrl}/loans/return/${id}`, {})
      .pipe(
        tap(returnedLoan => {
          const updatedList = this.loansSubject.value.map(l =>
            l.id === id ? returnedLoan : l
          );
          this.loansSubject.next(updatedList);
        })
      );
  }

  /**
   * Obtener préstamos activos
   */
  getActiveLoans(): Observable<Loan[]> {
    console.log('LoanService: Obteniendo préstamos activos');
    return this.http.get<Loan[]>(`${this.apiUrl}/loans/active`);
  }

  /**
   * Obtener préstamos vencidos
   */
  getOverdueLoans(): Observable<Loan[]> {
    console.log('LoanService: Obteniendo préstamos vencidos');
    return this.http.get<Loan[]>(`${this.apiUrl}/loans/overdue`);
  }

}