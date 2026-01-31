
import { Component, inject, signal, output } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  imports: [FormsModule],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center p-4">
      <div class="bg-brand-dark/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        <h2 class="text-3xl font-bold text-white mb-2 text-center">{{ isRegister() ? 'Join DevFolio' : 'Welcome Back' }}</h2>
        <p class="text-gray-400 text-center mb-8">{{ isRegister() ? 'Create an account to build your portfolio.' : 'Sign in to manage your content.' }}</p>

        <form (submit)="onSubmit($event)" class="space-y-4">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Username</label>
            <input [(ngModel)]="username" name="username" type="text" required 
              class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all">
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Password</label>
            <input [(ngModel)]="password" name="password" type="password" required 
              class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all">
          </div>
          
          @if (errorMsg()) {
            <p class="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded border border-red-500/20">{{ errorMsg() }}</p>
          }

          <button type="submit" class="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-brand-500/20 mt-4">
            {{ isRegister() ? 'Sign Up' : 'Login' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <button (click)="toggleMode()" class="text-gray-400 hover:text-white text-sm hover:underline">
            {{ isRegister() ? 'Already have an account? Login' : "Don't have an account? Sign Up" }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AuthComponent {
  authService = inject(AuthService);
  loginSuccess = output<void>(); // Emit when login is successful

  isRegister = signal(false);
  username = '';
  password = '';
  errorMsg = signal('');

  toggleMode() {
    this.isRegister.update(v => !v);
    this.errorMsg.set('');
  }

  onSubmit(e: Event) {
    e.preventDefault();
    if (!this.username || !this.password) return;

    if (this.isRegister()) {
      const success = this.authService.register(this.username, this.password);
      if (success) {
        this.loginSuccess.emit();
      } else {
        this.errorMsg.set('Username already exists.');
      }
    } else {
      const success = this.authService.login(this.username, this.password);
      if (success) {
        this.loginSuccess.emit();
      } else {
        this.errorMsg.set('Invalid username or password.');
      }
    }
  }
}