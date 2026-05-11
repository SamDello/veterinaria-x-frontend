import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovimientoInventarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/movimientos-inventario`;

  getMovimientosInventario(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getMovimientoInventarioById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createMovimientoInventario(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}
