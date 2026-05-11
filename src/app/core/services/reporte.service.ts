import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reportes`;
  private pdfUrl = `${environment.apiUrl}/reportes-pdf`;
  private mailUrl = `${environment.apiUrl}/reportes-email`;

  getReporteVentas(params: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ventas`, {
      params: this.buildParams(params)
    });
  }

  getReporteCompras(params: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/compras`, {
      params: this.buildParams(params)
    });
  }

  getReporteStock(params: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stock`, {
      params: this.buildParams(params)
    });
  }

  getReporteAtenciones(params: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/atenciones`, {
      params: this.buildParams(params)
    });
  }

  exportReporteVentasPdf(params: any): Observable<Blob> {
    return this.http.get(`${this.pdfUrl}/ventas`, {
      params: this.buildParams(params),
      responseType: 'blob'
    });
  }

  exportReporteComprasPdf(params: any): Observable<Blob> {
    return this.http.get(`${this.pdfUrl}/compras`, {
      params: this.buildParams(params),
      responseType: 'blob'
    });
  }

  exportReporteStockPdf(params: any): Observable<Blob> {
    return this.http.get(`${this.pdfUrl}/stock`, {
      params: this.buildParams(params),
      responseType: 'blob'
    });
  }

  exportReporteAtencionesPdf(params: any): Observable<Blob> {
    return this.http.get(`${this.pdfUrl}/atenciones`, {
      params: this.buildParams(params),
      responseType: 'blob'
    });
  }

  sendReporteVentasMail(payload: any): Observable<any> {
    return this.http.post<any>(`${this.mailUrl}/ventas`, payload);
  }

  sendReporteComprasMail(payload: any): Observable<any> {
    return this.http.post<any>(`${this.mailUrl}/compras`, payload);
  }

  sendReporteStockMail(payload: any): Observable<any> {
    return this.http.post<any>(`${this.mailUrl}/stock`, payload);
  }

  sendReporteAtencionesMail(payload: any): Observable<any> {
    return this.http.post<any>(`${this.mailUrl}/atenciones`, payload);
  }

  private buildParams(data: any): HttpParams {
    let params = new HttpParams();

    Object.keys(data || {}).forEach((key) => {
      const value = data[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    });

    return params;
  }

  getReportePagos(params: any): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/pagos`, {
    params: this.buildParams(params)
  });
}

exportReportePagosPdf(params: any): Observable<Blob> {
  return this.http.get(`${this.pdfUrl}/pagos`, {
    params: this.buildParams(params),
    responseType: 'blob'
  });
}

sendReportePagosMail(payload: any): Observable<any> {
  return this.http.post<any>(`${this.mailUrl}/pagos`, payload);
}
}
