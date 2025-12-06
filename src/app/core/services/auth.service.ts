// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // 🔧 URL backend
  private base = 'http://localhost:5014/api/Auth';

  constructor(private http: HttpClient, private router: Router) {}

  // -------------------------
  // LOGIN
  // -------------------------
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.base}/login`, { username, password }).pipe(
      map((res: any) => {
        if (res && res.token) {
          localStorage.setItem('mybooks_token', res.token);
          localStorage.setItem('mybooks_user', JSON.stringify({ username }));
        }
        return res;
      })
    );
  }

  // -------------------------
  // REGISTER
  // -------------------------
  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.base}/register`, { username, password });
  }

  // -------------------------
  // GET TOKEN
  // -------------------------
  getToken(): string | null {
    return localStorage.getItem('mybooks_token');
  }

  // -------------------------
  // GET USER (from localStorage)
  // -------------------------
  get user(): { username: string } | null {
    const raw = localStorage.getItem('mybooks_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // -------------------------
  // CHECK LOGIN STATUS
  // -------------------------
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // -------------------------
  // LOGOUT
  // -------------------------
  /**
   * Logout user.
   * @param fullReload If true, do a full page replacement (location.replace('/')).
   *                   Otherwise use Angular Router navigation (recommended).
   */
  logout(fullReload: boolean = false): void {
    // clear client-side auth data
    localStorage.removeItem('mybooks_token');
    localStorage.removeItem('mybooks_user');

    if (fullReload) {
      // full page reload and replace history (user cannot go back)
      location.replace('/');
    } else {
      // navigate via angular router without adding history entry
      this.router.navigateByUrl('/', { replaceUrl: true }).catch(() => {
        // fallback to full reload if router navigation fails for some reason
        location.replace('/');
      });
    }
  }
}
