import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RazaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/razas`;

  getRazas(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getRazaById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createRaza(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateRaza(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  changeStatus(id: number, estado: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/estado`, { estado });
  }
}
