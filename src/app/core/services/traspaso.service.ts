import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TraspasoService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/traspasos`;

  getTraspasos(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getTraspasoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createTraspaso(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
