import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ventas`;
  private pagosQrUrl = `${environment.apiUrl}/pagos-qr`;

  getVentas(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  createVentaProductos(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/productos`, payload);
  }

  createVentaServicios(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/servicios`, payload);
  }

  getMascotasByCliente(idCliente: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cliente/${idCliente}/mascotas`);
  }

  getAtencionesPendientesByMascota(idMascota: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mascota/${idMascota}/atenciones-pendientes`);
  }

  generarQrVenta(idVenta: number): Observable<any> {
    return this.http.post<any>(`${this.pagosQrUrl}/ventas/${idVenta}/generar`, {});
  }

  consultarEstadoQrVenta(idVenta: number): Observable<any> {
    return this.http.get<any>(`${this.pagosQrUrl}/ventas/${idVenta}/estado`);
  }

  consultarEstadoQrLocalVenta(idVenta: number): Observable<any> {
    return this.http.get<any>(`${this.pagosQrUrl}/ventas/${idVenta}/local-estado`);
  }

  pagarVentaEfectivo(idVenta: number): Observable<any> {
  return this.http.post<any>(`${environment.apiUrl}/pagos/venta/${idVenta}/efectivo`, {});
  }

  anularPagoVenta(idVenta: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/pagos/venta/${idVenta}/anular`, {});
  }

  getStockAlmacenesByProducto(idProducto: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/productos/${idProducto}/stock-almacenes`);
}
}
