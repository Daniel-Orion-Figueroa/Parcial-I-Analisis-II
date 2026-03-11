import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { User } from '../../core/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los usuarios.
   * @returns {Observable<User[]>} Una observable que emite un arreglo de usuarios.
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
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
   * Crea un nuevo usuario.
   * @param {User} user - El objeto de usuario a crear.
   * @returns {Observable<User>} Una observable que emite el usuario creado.
   */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  /**
   * Actualiza un usuario existente.
   * @param {number} id - El ID del usuario.
   * @param {User} user - El objeto de usuario actualizado.
   * @returns {Observable<User>} Una observable que emite el usuario actualizado.
   */
  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, user);
  }

  /**
   * Elimina un usuario existente.
   * @param {number} id - El ID del usuario.
   * @returns {Observable<void>} Una observable que emite void.
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }
}