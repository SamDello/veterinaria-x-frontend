import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/compras`;

  getCompras(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getCompraById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createCompra(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}
