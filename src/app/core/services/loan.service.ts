import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { Loan } from '../../core/interfaces/loan';

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createLoan(data: any): Observable<Loan> {
    return this.http.post<Loan>(
      `${this.apiUrl}${API_ENDPOINTS.LOANS.CREATE}`,
      data
    );
  }

  getUserLoans(userId: number): Observable<Loan[]> {
    return this.http.get<Loan[]>(
      `${this.apiUrl}${API_ENDPOINTS.LOANS.GET_BY_USER}/${userId}`
    );
  }

}