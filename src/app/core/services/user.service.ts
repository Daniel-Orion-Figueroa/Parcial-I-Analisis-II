import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = environment.apiUrl;

  // estado reactivo de usuarios
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$: Observable<User[]> = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los usuarios.
   * @returns {Observable<User[]>} Una observable que emite un arreglo de usuarios.
   */
  getUsers(): Observable<User[]> {
    return this.http
      .get<any>(`${this.apiUrl}/users`)
      .pipe(
        tap((response: any) => {
          console.log('UserService: Respuesta completa del backend:', response);
          // El backend devuelve: { message: "...", data: [User[], ...] }
          const users = response.data || response; // Fallback por si acaso
          console.log('UserService: Usuarios extraídos:', users);
          this.usersSubject.next(users);
        }),
        // Devolver solo el array de usuarios
        map((response: any) => response.data || response)
      );
  }

  /**
   * Obtiene un usuario por su ID.
   * @param {number} id - El ID del usuario.
   * @returns {Observable<User>} Una observable que emite el usuario correspondiente.
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  /**
   * Busca usuarios por término
   * @param term El término de búsqueda
   * @returns {Observable<User[]>} Una observable que emite los usuarios encontrados
   */
  searchUsers(term: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/search?q=${term}`);
  }

  /**
   * Crea un nuevo usuario
   * @param user Los datos del usuario a crear
   * @returns {Observable<User>} Una observable que emite el usuario creado
   */
  createUser(user: Partial<User>): Observable<User> {
    return this.http
      .post<User>(`${this.apiUrl}/users`, user)
      .pipe(
        tap((newUser: User) => {
          const currentUsers = this.usersSubject.value;
          this.usersSubject.next([...currentUsers, newUser]);
        })
      );
  }

  /**
   * Actualiza un usuario existente
   * @param id El ID del usuario a actualizar
   * @param user Los nuevos datos del usuario
   * @returns {Observable<User>} Una observable que emite el usuario actualizado
   */
  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http
      .put<User>(`${this.apiUrl}/users/${id}`, user)
      .pipe(
        tap((updatedUser: User) => {
          const users = this.usersSubject.value.map((u: User) =>
            u.id === id ? updatedUser : u
          );
          this.usersSubject.next(users);
        })
      );
  }

  /**
   * Elimina un usuario
   * @param id El ID del usuario a eliminar
   * @returns {Observable<void>} Una observable que completa cuando se elimina
   */
  deleteUser(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/users/${id}`)
      .pipe(
        tap(() => {
          const users = this.usersSubject.value.filter((u: User) => u.id !== id);
          this.usersSubject.next(users);
        })
      );
  }

  /**
   * Obtiene el estado actual de usuarios sin llamar API
   * @returns {User[]} El arreglo actual de usuarios
   */
  getUsersState(): User[] {
    return this.usersSubject.value;
  }
}
