import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServicioVeterinarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/servicios-veterinarios`;

  getServiciosVeterinarios(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getServicioVeterinarioById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createServicioVeterinario(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateServicioVeterinario(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  changeStatus(id: number, estado: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/estado`, { estado });
  }
}
