
import { Injectable, signal, effect } from '@angular/core';

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, never store plain text passwords!
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);
  users = signal<User[]>([]);

  constructor() {
    // Load users and session
    const storedUsers = localStorage.getItem('devfolio_users');
    if (storedUsers) {
      this.users.set(JSON.parse(storedUsers));
    }

    const session = localStorage.getItem('devfolio_session');
    if (session) {
      this.currentUser.set(JSON.parse(session));
    }

    // Persist users
    effect(() => {
      localStorage.setItem('devfolio_users', JSON.stringify(this.users()));
    });
  }

  register(username: string, password: string): boolean {
    if (this.users().find(u => u.username === username)) {
      return false; // User exists
    }
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password
    };
    this.users.update(u => [...u, newUser]);
    this.login(username, password);
    return true;
  }

  login(username: string, password: string): boolean {
    const user = this.users().find(u => u.username === username && u.password === password);
    if (user) {
      this.currentUser.set(user);
      localStorage.setItem('devfolio_session', JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('devfolio_session');
  }
}