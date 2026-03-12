import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User, TipoUsuario } from '../../core/interfaces/user';
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
   * Verificar si estamos en navegador
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Cargar sesión guardada (si existe)
   */
  private loadStoredSession() {

    if (!this.isBrowser()) {
      return;
    }

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token) {
      this.tokenSubject.next(token);
    }

    if (user) {
      this.userSubject.next(JSON.parse(user));
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

          if (this.isBrowser()) {
            localStorage.setItem('user', JSON.stringify(user));
          }

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

          if (this.isBrowser()) {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
          }

          this.userSubject.next(user);
          this.tokenSubject.next(token);

        })
      );
  }

  /**
   * Logout
   */
  logout(): void {

    if (this.isBrowser()) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }

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

  /**
   * Obtener token actual
   */
  getCurrentToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Verificar si el usuario es admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.tipoUsuario === TipoUsuario.ADMIN;
  }

  /**
   * Verificar si el usuario es docente
   */
  isDocente(): boolean {
    const user = this.getCurrentUser();
    return user?.tipoUsuario === TipoUsuario.DOCENTE;
  }

  /**
   * Verificar si el usuario es estudiante
   */
  isEstudiante(): boolean {
    const user = this.getCurrentUser();
    return user?.tipoUsuario === TipoUsuario.ESTUDIANTE;
  }

  /**
   * Actualizar manualmente el usuario actual (para registro)
   */
  updateUser(user: User): void {
    this.userSubject.next(user);
  }

  /**
   * Actualizar manualmente el token actual (para registro)
   */
  updateToken(token: string): void {
    this.tokenSubject.next(token);
  }
}