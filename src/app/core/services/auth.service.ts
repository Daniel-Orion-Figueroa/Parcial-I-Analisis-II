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
      try {
        const parsedUser = JSON.parse(user);
        this.userSubject.next(parsedUser);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        // Limpiar datos corruptos
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.userSubject.next(null);
        this.tokenSubject.next(null);
      }
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
  register(userData: Partial<User>): Observable<any> {

    return this.http
      .post<any>(`${this.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`, userData)
      .pipe(
        tap((response) => {
          // El backend devuelve: { message: "User registered successfully", data: User }
          const user = response.data;

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
          // Debug: ver la respuesta completa del backend
          console.log('AuthService: Respuesta completa del backend:', response);
          
          // El backend devuelve: { message: "Login successful", data: {token: string} }
          // NOTA: El backend no devuelve el usuario, solo el token
          const authData = response.data;
          console.log('AuthService: authData:', authData);
          
          const token = authData.token;
          console.log('AuthService: token extraído:', token);
          
          // Como el backend no devuelve el usuario, necesitamos obtenerlo del token
          // Por ahora, crearemos un usuario básico desde el token JWT
          let user = null;
          
          if (token && this.isBrowser()) {
            try {
              // Guardar el token
              localStorage.setItem('token', token);
              console.log('AuthService: Token guardado en localStorage');
              
              // Extraer información básica del token JWT (email y rol)
              const payload = JSON.parse(atob(token.split('.')[1]));
              console.log('AuthService: Payload del token:', payload);
              
              user = {
                id: payload.sub || 0, // Usar el subject (email) como id temporal
                name: payload.name || payload.sub.split('@')[0] || 'Usuario', // Usar email como nombre si no hay 'name'
                email: payload.sub || payload.email || '',
                password: '',
                tipoUsuario: payload.role || 'ESTUDIANTE',
                fechaRegistro: new Date().toISOString().split('T')[0]
              };
              
              console.log('AuthService: Usuario reconstruido desde token:', user);
              
              // Guardar el usuario en localStorage
              localStorage.setItem('user', JSON.stringify(user));
              console.log('AuthService: Usuario guardado en localStorage');
              
            } catch (error) {
              console.error('AuthService: Error procesando token:', error);
            }
          }

          // Actualizar los BehaviorSubjects
          this.userSubject.next(user);
          this.tokenSubject.next(token);
          console.log('AuthService: BehaviorSubject actualizado');

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
    // Primero intentar obtener del BehaviorSubject
    const user = this.userSubject.value;
    if (user) {
      return user;
    }
    
    // Si no hay en BehaviorSubject, intentar del localStorage
    if (this.isBrowser()) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Actualizar el BehaviorSubject con el usuario recuperado
          this.userSubject.next(parsedUser);
          return parsedUser;
        } catch (error) {
          console.error('Error parsing user from localStorage in getCurrentUser:', error);
          localStorage.removeItem('user');
        }
      }
    }
    
    return null;
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