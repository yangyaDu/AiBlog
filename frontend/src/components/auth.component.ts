
import { Component, inject, signal, output } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ApiError } from '../services/api.service'; // Import the new error class
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
            <input [(ngModel)]="username" name="username" type="text" required placeholder="Enter username"
              class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all">
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Password</label>
            <input [(ngModel)]="password" name="password" type="password" required placeholder="••••••••"
              class="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all">
          </div>
          
          @if (errorMsg()) {
            <p class="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded border border-red-500/20 animate-pulse">{{ errorMsg() }}</p>
          }

          <button type="submit" [disabled]="loading()" class="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-brand-500/20 mt-4">
            {{ loading() ? 'Processing...' : (isRegister() ? 'Sign Up' : 'Login') }}
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
  loginSuccess = output<void>(); 

  isRegister = signal(false);
  username = '';
  password = '';
  errorMsg = signal('');
  loading = signal(false);

  toggleMode() {
    this.isRegister.update(v => !v);
    this.errorMsg.set('');
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    if (!this.username || !this.password) return;

    // Validate length locally
    if (this.username.length < 3) {
        this.errorMsg.set('Username must be at least 3 characters.');
        return;
    }

    this.loading.set(true);
    this.errorMsg.set('');

    try {
        if (this.isRegister()) {
            await this.authService.register(this.username, this.password);
        } else {
            await this.authService.login(this.username, this.password);
        }
        this.loginSuccess.emit();
    } catch (err: any) {
        // Handle Custom API Errors
        if (err instanceof ApiError) {
            // See backend/src/utils/types.ts for codes
            switch (err.code) {
                case 1001: // USER_EXISTS
                    this.errorMsg.set('该用户名已被占用 (User already exists)');
                    break;
                case 1002: // INVALID_CREDENTIALS
                    this.errorMsg.set('用户名或密码错误 (Invalid credentials)');
                    break;
                case 4000: // VALIDATION_ERROR
                    this.errorMsg.set('输入格式有误 (Validation Error)');
                    break;
                default:
                    this.errorMsg.set(err.message || 'Authentication failed');
            }
        } else {
            this.errorMsg.set('Network Error or Server Offline');
        }
    } finally {
        this.loading.set(false);
    }
  }
}
