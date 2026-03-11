import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { User } from '../../core/interfaces/user';
import { environment } from '../../environments/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  // estado reactivo del usuario
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  // estado reactivo del token
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$: Observable<string | null> = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredSession();
  }

  /**
   * Cargar sesión guardada (si existe)
   */
  private loadStoredSession(): void {

    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (user) {
      this.userSubject.next(JSON.parse(user));
    }

    if (token) {
      this.tokenSubject.next(token);
    }
  }

  /**
   * Obtener token actual
   */
  getStoredToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Registro de usuario
   */
  register(userData: Partial<User>): Observable<User> {

    return this.http
      .post<User>(`${this.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`, userData)
      .pipe(
        tap((user) => {
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
        })
      );
  }

  /**
   * Login
   */
  login(email: string, password: string): Observable<any> {

    return this.http
      .post<any>(`${this.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`, { email, password })
      .pipe(
        tap((response) => {

          const user = response.user;
          const token = response.token;

          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', token);

          this.userSubject.next(user);
          this.tokenSubject.next(token);

        })
      );
  }

  /**
   * Logout
   */
  logout(): void {

    localStorage.removeItem('user');
    localStorage.removeItem('token');

    this.userSubject.next(null);
    this.tokenSubject.next(null);
  }

  /**
   * Saber si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

}