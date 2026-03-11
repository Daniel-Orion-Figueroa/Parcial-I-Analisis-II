import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { Book } from '../interfaces/book';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private apiUrl = environment.apiUrl;

  // estado reactivo de libros
  private booksSubject = new BehaviorSubject<Book[]>([]);
  public books$: Observable<Book[]> = this.booksSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los libros
   */
  getBooks(): Observable<Book[]> {

    return this.http
      .get<Book[]>(`${this.apiUrl}${API_ENDPOINTS.BOOKS.GET_ALL}`)
      .pipe(
        tap((books) => {
          this.booksSubject.next(books);
        })
      );

  }

  /**
   * Obtener un libro por ID
   */
  getBookById(id: number): Observable<Book> {

    return this.http.get<Book>(
      `${this.apiUrl}${API_ENDPOINTS.BOOKS.GET_BY_ID}/${id}`
    );

  }

  /**
   * Buscar libros
   */
  searchBooks(term: string): Observable<Book[]> {

    return this.http.get<Book[]>(
      `${this.apiUrl}${API_ENDPOINTS.BOOKS.SEARCH}?q=${term}`
    );

  }

  /**
   * Crear libro
   */
  createBook(book: Partial<Book>): Observable<Book> {

    return this.http
      .post<Book>(`${this.apiUrl}${API_ENDPOINTS.BOOKS.GET_ALL}`, book)
      .pipe(
        tap((newBook) => {

          const currentBooks = this.booksSubject.value;
          this.booksSubject.next([...currentBooks, newBook]);

        })
      );

  }

  /**
   * Actualizar libro
   */
  updateBook(id: number, book: Partial<Book>): Observable<Book> {

    return this.http
      .put<Book>(`${this.apiUrl}${API_ENDPOINTS.BOOKS.GET_BY_ID}/${id}`, book)
      .pipe(
        tap((updatedBook) => {

          const books = this.booksSubject.value.map(b =>
            b.id === id ? updatedBook : b
          );

          this.booksSubject.next(books);

        })
      );

  }

  /**
   * Eliminar libro
   */
  deleteBook(id: number): Observable<void> {

    return this.http
      .delete<void>(`${this.apiUrl}${API_ENDPOINTS.BOOKS.GET_BY_ID}/${id}`)
      .pipe(
        tap(() => {

          const books = this.booksSubject.value.filter(b => b.id !== id);
          this.booksSubject.next(books);

        })
      );

  }

  /**
   * Obtener estado actual de libros sin llamar API
   */
  getBooksState(): Book[] {
    return this.booksSubject.value;
  }

}