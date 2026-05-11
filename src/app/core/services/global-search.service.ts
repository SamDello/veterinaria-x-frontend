import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GlobalSearchItem {
  module: string;
  type: string;
  label: string;
  description: string;
  route: string;
}

export interface GlobalSearchResponse {
  ok: boolean;
  query: string;
  items: GlobalSearchItem[];
  results: Record<string, GlobalSearchItem[]>;
  summary: Record<string, number>;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/search`;

  search(term: string): Observable<GlobalSearchResponse> {
    const params = new HttpParams().set('q', term.trim());
    return this.http.get<GlobalSearchResponse>(this.apiUrl, { params });
  }
}
