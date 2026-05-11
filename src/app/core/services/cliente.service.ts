import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clientes`;

  getClientes(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getClienteById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createCliente(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateCliente(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deleteCliente(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  changeStatus(id: number, estado: boolean) {
  return this.http.patch<any>(`${this.apiUrl}/${id}/estado`, { estado });
}
}
