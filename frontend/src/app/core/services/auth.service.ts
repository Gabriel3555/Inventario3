import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import type { LoginRequest, RegisterRequest, JwtResponse, Rol } from '../models/auth.model';
import { environment } from '../../../../environments/environment';

const API_URL = `${environment.apiUrl}/auth`;
const TOKEN_KEY = 'inventario_token';
const USER_KEY = 'inventario_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<JwtResponse | null>(this.loadUserFromStorage());
  private token = signal<string | null>(this.loadToken());

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this.token());
  readonly rol = computed(() => this.currentUser()?.rol ?? null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(body: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${API_URL}/login`, body).pipe(
      tap((res) => this.setSession(res))
    );
  }

  register(body: RegisterRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${API_URL}/register`, body).pipe(
      tap((res) => this.setSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.token();
  }

  getAuthorizationHeader(): string | null {
    const t = this.token();
    return t ? `Bearer ${t}` : null;
  }

  redirectByRole(): void {
    const r = this.rol();
    if (r === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else if (r === 'VENDEDOR') {
      this.router.navigate(['/vendedor/ventas']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  private setSession(res: JwtResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res));
    this.token.set(res.token);
    this.currentUser.set(res);
  }

  private loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadUserFromStorage(): JwtResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as JwtResponse;
    } catch {
      return null;
    }
  }
}
