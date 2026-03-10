import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`,
      credentials
    );
  }

  register(user: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`,
      user
    );
  }

}