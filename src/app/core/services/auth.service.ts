import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FirebaseAuthService } from './firebase-auth.service';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
// environment is already imported above

export interface User {
  id: number | string;
  uid?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.getToken());

  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private firebaseAuthService: FirebaseAuthService) {}

  login(email: string, password: string): Observable<AuthResponse> {
    // If Firebase configured, use Firebase auth
    if (environment.firebase && environment.firebase.apiKey && this.firebaseAuthService) {
      return this.firebaseAuthService.login(email, password).pipe(
        map((res: any) => {
          if (res && res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            this.currentUserSubject.next(res.user);
            this.isAuthenticatedSubject.next(true);
            return { success: true, message: 'Logged in via Firebase', token: res.token, user: res.user } as AuthResponse;
          }
          return { success: false, message: 'Firebase login failed' } as AuthResponse;
        }),
        catchError(error => {
          console.error('Firebase login error:', error);
          return of({ success: false, message: 'Erreur de connexion' });
        })
      );
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/login.php`, { email, password })
      .pipe(
        tap(response => {
          if (response.success && response.token && response.user) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          return of({ success: false, message: 'Erreur de connexion' });
        })
      );
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    if (environment.firebase && environment.firebase.apiKey && this.firebaseAuthService) {
      // create user in Firebase
      return this.firebaseAuthService.register(email, password).pipe(
        map((res: any) => {
          if (res && res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            this.currentUserSubject.next(res.user);
            this.isAuthenticatedSubject.next(true);
            return { success: true, message: 'Registered via Firebase', token: res.token, user: res.user } as AuthResponse;
          }
          return { success: false, message: 'Firebase register failed' } as AuthResponse;
        }),
        catchError(error => {
          console.error('Firebase register error:', error);
          return of({ success: false, message: 'Erreur d\'inscription' });
        })
      );
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/register.php`, {
      username,
      email,
      password
    })
      .pipe(
        tap(response => {
          if (response.success && response.token && response.user) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError(error => {
          console.error('Register error:', error);
          return of({ success: false, message: 'Erreur d\'inscription' });
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  checkAuth(): void {
    const token = this.getToken();
    const user = this.getUserFromStorage();
    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
