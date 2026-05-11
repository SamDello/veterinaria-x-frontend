import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pagos`;
  private pagosQrUrl = `${environment.apiUrl}/pagos-qr`;

  getPagos(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getPagoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getPagosByVenta(idVenta: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/venta/${idVenta}`);
  }

  consultarEstadoQrVenta(idVenta: number): Observable<any> {
    return this.http.get<any>(`${this.pagosQrUrl}/ventas/${idVenta}/estado`);
  }

  consultarEstadoQrLocalVenta(idVenta: number): Observable<any> {
    return this.http.get<any>(`${this.pagosQrUrl}/ventas/${idVenta}/local-estado`);
  }
}
