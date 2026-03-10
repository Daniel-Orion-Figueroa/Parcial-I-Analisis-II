import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { Book } from '../../core/interfaces/book';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(
      `${this.apiUrl}${API_ENDPOINTS.BOOKS.GET_ALL}`
    );
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(
      `${this.apiUrl}${API_ENDPOINTS.BOOKS.GET_BY_ID}/${id}`
    );
  }

  searchBooks(term: string): Observable<Book[]> {
    return this.http.get<Book[]>(
      `${this.apiUrl}${API_ENDPOINTS.BOOKS.SEARCH}?q=${term}`
    );
  }

}