import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlmacenService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/almacenes`;

  getAlmacenes(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getAlmacenById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createAlmacen(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateAlmacen(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  changeStatus(id: number, estado: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/estado`, { estado });
  }
}
