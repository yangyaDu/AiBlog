
import { Injectable, signal, inject, effect } from '@angular/core';
import { ApiService } from './api.service';

export interface User {
  id: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  
  currentUser = signal<User | null>(null);

  constructor() {
    // Load session on startup
    const session = localStorage.getItem('devfolio_session');
    if (session) {
      this.currentUser.set(JSON.parse(session));
    }
  }

  async register(username: string, password: string): Promise<void> {
    // ApiService throws Error if failed, Component will catch it
    const res = await this.api.post<{ userId: string }>('/api/auth/register', { username, password });
    
    // Auto login after register
    await this.login(username, password);
  }

  async login(username: string, password: string): Promise<void> {
    const res = await this.api.post<{ token: string, user: User }>('/api/auth/login', { username, password });
    
    // Save session
    const sessionData = { ...res.user, token: res.token };
    this.currentUser.set(res.user);
    localStorage.setItem('devfolio_session', JSON.stringify(sessionData));
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('devfolio_session');
  }
}
