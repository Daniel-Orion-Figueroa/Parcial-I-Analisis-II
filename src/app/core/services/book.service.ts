import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { Book } from '../interfaces/book';

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
      .get<any>(`${this.apiUrl}${API_ENDPOINTS.BOOKS.GET_ALL}`)
      .pipe(
        tap((response: any) => {
          console.log('BookService: Respuesta completa del backend:', response);
          // El backend devuelve: { message: "...", data: [Book[], ...] }
          const books = response.data || response; // Fallback por si acaso
          console.log('BookService: Libros extraídos:', books);
          this.booksSubject.next(books);
        }),
        // Mapear la respuesta para devolver solo el array de libros
        map((response: any) => response.data || response)
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
      .post<any>(`${this.apiUrl}${API_ENDPOINTS.BOOKS.GET_ALL}`, book)
      .pipe(
        tap((response: any) => {
          console.log('BookService createBook: Respuesta del backend:', response);
          // El backend devuelve: { message: "...", data: Book }
          const newBook = response.data || response;
          console.log('BookService createBook: Libro creado:', newBook);
          
          const currentBooks = this.booksSubject.value;
          this.booksSubject.next([...currentBooks, newBook]);
        }),
        // Devolver solo el libro creado
        map((response: any) => response.data || response)
      );

  }

  /**
   * Actualizar libro
   */
  updateBook(id: number, book: Partial<Book>): Observable<Book> {

    console.log('BookService updateBook: ID del libro:', id);
    console.log('BookService updateBook: Datos a actualizar:', book);

    return this.http
      .put<any>(`${this.apiUrl}${API_ENDPOINTS.BOOKS.GET_BY_ID}/${id}`, book)
      .pipe(
        tap((response: any) => {
          console.log('BookService updateBook: Respuesta del backend:', response);
          // El backend devuelve: { message: "...", data: Book }
          const updatedBook = response.data || response;
          console.log('BookService updateBook: Libro actualizado:', updatedBook);
          
          const books = this.booksSubject.value.map((b: Book) =>
            b.id === id ? updatedBook : b
          );
          this.booksSubject.next(books);
        }),
        // Devolver solo el libro actualizado
        map((response: any) => response.data || response)
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