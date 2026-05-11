import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AperturaCajaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/aperturas-caja`;

  getAperturasCaja(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getAperturaCajaById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createAperturaCaja(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}
