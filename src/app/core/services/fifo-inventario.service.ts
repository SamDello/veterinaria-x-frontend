import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FifoInventarioService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/fifo-inventario`;

  inicializarLotes(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inicializar-lotes`, {});
  }

  getLotes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/lotes`);
  }

  getMovimientos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/movimientos`);
  }
}
