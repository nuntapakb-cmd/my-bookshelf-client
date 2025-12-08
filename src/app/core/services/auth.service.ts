// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // 🔧 URL backend
  private base = `${environment.apiBaseUrl}/Auth`;

  constructor(private http: HttpClient, private router: Router) {}

  // -------------------------
  // LOGIN (use email login)
  // -------------------------
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.base}/login`, { email, password }).pipe(
      map((res: any) => {
        if (res && res.token) {
          // storage token
          localStorage.setItem('mybooks_token', res.token);

          const storedUser = { email: res.email ?? email, username: res.username ?? null };
          localStorage.setItem('mybooks_user', JSON.stringify(storedUser));
        }
        return res;
      })
    );
  }

  // -------------------------
  // REGISTER
  // -------------------------
  register(data: { email: string; password: string; confirmPassword?: string; username?: string }): Observable<any> {
    // backend support username
    return this.http.post(`${this.base}/register`, data);
  }

  // -------------------------
  // GET TOKEN
  // -------------------------
  getToken(): string | null {
    return localStorage.getItem('mybooks_token');
  }

  // -------------------------
  // Decode JWT token (read payload)
  // -------------------------
  private decodeToken(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }

  // -------------------------
  // GET USER (email / username)
  // -------------------------
  get user(): { email?: string; username?: string } | null {
    // 1) Read from token first
    const payload = this.decodeToken();
    if (payload) {
    // In JWT:
    // - Username stored in custom claim: "username"
    // - Email currently comes from ClaimTypes.Name => key URI
      const emailFromClaim =
        payload.email ??
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];

      return {
        email: emailFromClaim,
        username: payload.username
      };
    }

    // 2) fallback: read from localStorage
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
    return !!this.getToken();   // get mybooks_token
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
