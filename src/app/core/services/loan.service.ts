import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { Loan } from '../interfaces/loan';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';

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
      .get<Loan[]>(`${this.apiUrl}${API_ENDPOINTS.LOANS.CREATE}`)
      .pipe(
        tap(loans => this.loansSubject.next(loans))
      );

  }

  /**
   * Obtener préstamos por usuario
   */
  getLoansByUser(userId: number): Observable<Loan[]> {

    return this.http
      .get<Loan[]>(`${this.apiUrl}${API_ENDPOINTS.LOANS.GET_BY_USER}/${userId}`)
      .pipe(
        tap(loans => this.loansSubject.next(loans))
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
   * Obtener estado actual sin llamar API
   */
  getLoansState(): Loan[] {
    return this.loansSubject.value;
  }

}