import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stocks`;

  getStocks(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getStockById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createStock(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateStock(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }
}
