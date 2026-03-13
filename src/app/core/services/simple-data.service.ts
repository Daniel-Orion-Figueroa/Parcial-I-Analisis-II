import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SimpleDataService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtener usuarios básicos sin referencias circulares
   */
  getBasicUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/basic`);
  }

  /**
   * Obtener libros básicos sin referencias circulares
   */
  getBasicBooks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/books/basic`);
  }

  /**
   * Obtener reservaciones básicas sin referencias circulares
   */
  getBasicReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservations/basic`);
  }
}
