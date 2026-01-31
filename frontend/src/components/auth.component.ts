
import { Component, inject, signal, output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
          
          <!-- Simulated Cap.js -->
          <div>
             <label class="block text-xs text-gray-400 mb-1">Verification Code</label>
             <div class="flex gap-2">
                 <canvas #captchaCanvas width="120" height="40" class="rounded bg-white cursor-pointer" (click)="generateCaptcha()"></canvas>
                 <input [(ngModel)]="captchaInput" name="captcha" type="text" required placeholder="Enter code"
                  class="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all uppercase">
             </div>
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
export class AuthComponent implements AfterViewInit {
  authService = inject(AuthService);
  loginSuccess = output<void>(); 

  isRegister = signal(false);
  username = '';
  password = '';
  captchaInput = '';
  errorMsg = signal('');

  @ViewChild('captchaCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  expectedCaptcha = '';

  ngAfterViewInit() {
      this.generateCaptcha();
  }

  generateCaptcha() {
      const ctx = this.canvasRef.nativeElement.getContext('2d')!;
      ctx.clearRect(0, 0, 120, 40);
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 120, 40);
      
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for(let i=0; i<4; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.expectedCaptcha = code;

      // Draw
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#333';
      ctx.textBaseline = 'middle';
      for(let i=0; i<4; i++) {
          ctx.save();
          ctx.translate(20 + i*25, 20);
          ctx.rotate((Math.random() - 0.5) * 0.4);
          ctx.fillText(code[i], 0, 0);
          ctx.restore();
      }
      
      // Noise
      for(let i=0; i<5; i++) {
          ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.5})`;
          ctx.beginPath();
          ctx.moveTo(Math.random() * 120, Math.random() * 40);
          ctx.lineTo(Math.random() * 120, Math.random() * 40);
          ctx.stroke();
      }
  }

  toggleMode() {
    this.isRegister.update(v => !v);
    this.errorMsg.set('');
    this.generateCaptcha();
  }

  onSubmit(e: Event) {
    e.preventDefault();
    if (!this.username || !this.password || !this.captchaInput) return;

    // We send the 'expected' value to backend. 
    // In a real session-based app, we wouldn't send expected, just input.
    // But since this is stateless and we are simulating Cap.js plugin behavior (often validation token based),
    // we encrypt (base64) the expected answer so backend can check it against input.
    const encodedExpected = btoa(this.expectedCaptcha);

    // Mock API call simulation inside Service for now (in a real scenario, this matches the controller logic)
    // Here we just use the Service logic which calls LocalStorage mocking, 
    // but in the actual FULL APP structure we defined, we should call the HTTP endpoint.
    
    // Let's use fetch for real interaction
    const url = this.isRegister() ? '/api/auth/register' : '/api/auth/login';
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: this.username,
            password: this.password,
            captchaCode: this.captchaInput,
            expectedCaptcha: encodedExpected
        })
    }).then(async res => {
        const data = await res.json();
        if (data.code === 0) {
            // Success
            if (this.isRegister()) {
                // Auto login or prompt? Service login logic handles localstorage
                // Re-login to get token
                return this.performLogin(encodedExpected);
            } else {
                 this.authService.currentUser.set(data.data.user);
                 localStorage.setItem('devfolio_session', JSON.stringify({ token: data.data.token, ...data.data.user }));
                 this.loginSuccess.emit();
            }
        } else {
            this.errorMsg.set(data.message);
            this.generateCaptcha();
        }
    }).catch(err => {
        this.errorMsg.set('Network error');
    });
  }

  performLogin(encodedExpected: string) {
       fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: this.username,
            password: this.password,
            captchaCode: this.captchaInput,
            expectedCaptcha: encodedExpected
        })
    }).then(async res => {
        const data = await res.json();
        if (data.code === 0) {
             this.authService.currentUser.set(data.data.user);
             localStorage.setItem('devfolio_session', JSON.stringify({ token: data.data.token, ...data.data.user }));
             this.loginSuccess.emit();
        }
    });
  }
}
