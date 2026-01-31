
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  isAdmin = signal(false);

  toggleAdmin() {
    this.isAdmin.update(v => !v);
  }
}
