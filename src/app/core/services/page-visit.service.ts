import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PageVisitData {
  id_page_visit?: number;
  page_key: string;
  total_visits: number;
  last_visit_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PageVisitResponse {
  ok: boolean;
  message?: string;
  data: PageVisitData;
}

export interface PageVisitListResponse {
  ok: boolean;
  total_registros: number;
  data: PageVisitData[];
}

@Injectable({
  providedIn: 'root'
})
export class PageVisitService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/page-visits`;

  registerPageVisit(pageKey: string): Observable<PageVisitResponse> {
    return this.http.post<PageVisitResponse>(this.apiUrl, {
      page_key: pageKey
    });
  }

  getPageVisit(pageKey: string): Observable<PageVisitResponse> {
    return this.http.get<PageVisitResponse>(`${this.apiUrl}/${pageKey}`);
  }

  getAllPageVisits(): Observable<PageVisitListResponse> {
    return this.http.get<PageVisitListResponse>(this.apiUrl);
  }
}
