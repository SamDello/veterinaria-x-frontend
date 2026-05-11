import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private storageService = inject(StorageService);
  private apiUrl = environment.apiUrl;

  login(payload: { correo: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, payload).pipe(
      tap((response) => {
        if (response?.token) {
          this.storageService.setToken(response.token);
          this.storageService.setUser(response.user);
        }
      })
    );
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/profile`);
  }

  logout(): void {
    this.storageService.clear();
  }

  isAuthenticated(): boolean {
    return !!this.storageService.getToken();
  }

  getUser(): any {
    return this.storageService.getUser();
  }

  getToken(): string | null {
    return this.storageService.getToken();
  }
}
